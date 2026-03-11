"""
API Webhook FastAPI - Réception messages WhatsApp/SMS/Web
Point d'entrée pour tous les messages artisans
"""

from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
import hmac
import hashlib
from dotenv import load_dotenv

# Import agent
from core.agent import AgentFactory

load_dotenv()

app = FastAPI(
    title="Agence Chatbot Artisan API",
    description="Webhook pour messages WhatsApp/SMS/Web",
    version="1.0.0"
)

# Configuration
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "votre_secret_ici")
ARTISAN_CONFIGS = {}  # À charger depuis config/artisans.json


class IncomingMessage(BaseModel):
    """Format message entrant"""
    from_number: str  # Numéro expéditeur (format: +33650505050)
    message: str  # Contenu texte du message
    timestamp: Optional[str] = None
    artisan_id: Optional[str] = None  # ID artisan (détecté ou fourni)


class OutgoingMessage(BaseModel):
    """Format réponse"""
    to_number: str
    message: str
    status: str = "sent"


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Vérifie la signature HMAC du webhook (sécurité)"""
    expected_signature = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected_signature)


def detect_artisan_from_number(phone_number: str) -> Optional[str]:
    """
    Détecte l'artisan à partir du numéro de téléphone
    
    Returns:
        artisan_id si trouvé, None sinon
    """
    # Chercher dans la config
    for artisan_id, config in ARTISAN_CONFIGS.items():
        if config.get("phone_number") == phone_number:
            return artisan_id
    return None


@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "online",
        "service": "Agence Chatbot Artisan API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    """Endpoint santé détaillé"""
    return {
        "status": "healthy",
        "agents_actifs": len(AgentFactory._instances),
        "artisans_configures": len(ARTISAN_CONFIGS)
    }


@app.post("/webhook/whatsapp")
async def whatsapp_webhook(
    request: Request,
    x_webhook_signature: Optional[str] = Header(None)
):
    """
    Webhook pour messages WhatsApp (via Twilio ou autre provider)
    
    Format attendu (exemple Twilio) :
    {
        "From": "whatsapp:+33650505050",
        "Body": "Crée un devis pour Dupont",
        "MessageSid": "SM...",
        "AccountSid": "AC..."
    }
    """
    try:
        # Récupérer le payload brut
        body = await request.body()
        
        # Vérifier signature (sécurité)
        if x_webhook_signature:
            if not verify_webhook_signature(body, x_webhook_signature):
                raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Parser données
        data = await request.json()
        
        # Extraire numéro et message
        from_number = data.get("From", "").replace("whatsapp:", "")
        message_text = data.get("Body", "")
        
        if not from_number or not message_text:
            raise HTTPException(status_code=400, detail="Missing from_number or message")
        
        # Détecter l'artisan
        artisan_id = detect_artisan_from_number(from_number)
        
        if not artisan_id:
            return JSONResponse(
                content={
                    "error": "Artisan non reconnu",
                    "message": "Ce numéro n'est pas enregistré. Contactez l'administrateur."
                },
                status_code=404
            )
        
        # Récupérer config artisan
        artisan_config = ARTISAN_CONFIGS[artisan_id]
        
        # Récupérer ou créer agent
        agent = AgentFactory.get_agent(artisan_id, artisan_config)
        
        # Traiter le message
        response = await agent.process_message_async(message_text)
        
        # Retourner réponse (sera envoyée par le webhook provider)
        return {
            "to": from_number,
            "message": response,
            "artisan_id": artisan_id,
            "status": "processed"
        }
    
    except Exception as e:
        return JSONResponse(
            content={
                "error": "Erreur traitement message",
                "detail": str(e)
            },
            status_code=500
        )


@app.post("/webhook/sms")
async def sms_webhook(request: Request):
    """
    Webhook pour SMS (via Twilio ou autre provider)
    Format similaire à WhatsApp
    """
    # Logique similaire à whatsapp_webhook
    return await whatsapp_webhook(request)


@app.post("/api/message")
async def send_message(message: IncomingMessage):
    """
    API directe pour tests ou interface web
    Ne nécessite pas de webhook provider
    """
    try:
        # Détecter artisan
        if not message.artisan_id:
            artisan_id = detect_artisan_from_number(message.from_number)
        else:
            artisan_id = message.artisan_id
        
        if not artisan_id or artisan_id not in ARTISAN_CONFIGS:
            raise HTTPException(status_code=404, detail="Artisan non trouvé")
        
        # Récupérer config
        artisan_config = ARTISAN_CONFIGS[artisan_id]
        
        # Créer agent
        agent = AgentFactory.get_agent(artisan_id, artisan_config)
        
        # Traiter message
        response = await agent.process_message_async(message.message)
        
        return {
            "from_number": message.from_number,
            "artisan_id": artisan_id,
            "response": response,
            "timestamp": message.timestamp
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/admin/reload-configs")
async def reload_configs(admin_key: str = Header(...)):
    """
    Recharge les configurations artisans (admin uniquement)
    """
    if admin_key != os.getenv("ADMIN_API_KEY"):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # TODO: Recharger depuis fichier JSON ou DB
    return {"status": "configs reloaded", "count": len(ARTISAN_CONFIGS)}


@app.delete("/api/admin/agent/{artisan_id}")
async def delete_agent(artisan_id: str, admin_key: str = Header(...)):
    """
    Supprime un agent de la mémoire (force recréation)
    """
    if admin_key != os.getenv("ADMIN_API_KEY"):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    AgentFactory.remove_agent(artisan_id)
    return {"status": "agent deleted", "artisan_id": artisan_id}


# Chargement des configs au démarrage
@app.on_event("startup")
async def load_artisan_configs():
    """Charge les configurations artisans depuis config/artisans.json"""
    import json
    
    config_path = "config/artisans.json"
    
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            global ARTISAN_CONFIGS
            ARTISAN_CONFIGS = json.load(f)
            print(f"✅ {len(ARTISAN_CONFIGS)} artisan(s) configuré(s)")
    else:
        print(f"⚠️ Fichier config introuvable : {config_path}")
        print("Création d'une config par défaut...")
        
        # Config par défaut pour tests
        ARTISAN_CONFIGS = {
            "artisan_test_001": {
                "phone_number": "+33650505050",
                "sheets_id": "VOTRE_SHEETS_ID_ICI",
                "raison_sociale": "Dupont Peinture SARL",
                "siret": "12345678901234",
                "adresse": "10 rue de la République",
                "code_postal": "78000",
                "ville": "Versailles",
                "telephone": "01 39 50 50 50",
                "email": "contact@dupont-peinture.fr",
                "specialites": ["Peinture", "Ravalement"]
            }
        }
        
        # Sauvegarder config par défaut
        os.makedirs("config", exist_ok=True)
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(ARTISAN_CONFIGS, f, indent=2, ensure_ascii=False)


# Point d'entrée pour uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.webhook:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Auto-reload en dev
    )
