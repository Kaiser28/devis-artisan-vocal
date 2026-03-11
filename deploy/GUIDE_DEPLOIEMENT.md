# 🚀 GUIDE DÉPLOIEMENT - Architecture LangChain

**Date** : 2026-03-11  
**Branche** : `feature/langchain-architecture`

---

## 📋 Prérequis

### **1. Compte Google Cloud (gratuit)**
- Créer projet : https://console.cloud.google.com/
- Activer API Google Sheets
- Créer Service Account + télécharger JSON credentials
- Placer `google_credentials.json` dans `config/`

### **2. Compte OpenAI**
- API key : https://platform.openai.com/api-keys
- Budget recommandé : $10/mois (gpt-4o-mini)

### **3. (Optionnel) Compte Twilio**
- Pour WhatsApp Business API : https://www.twilio.com/
- Alternative gratuite : n8n + API WhatsApp Web

---

## 🏗️ Architecture Déployée

```
┌─────────────────────────────────────────────────┐
│  Internet (WhatsApp / SMS / Web)                │
└─────────────────┬───────────────────────────────┘
                  │
         ┌────────▼────────┐
         │  Nginx (80/443) │  ← Reverse proxy + SSL
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │  FastAPI (8000) │  ← API webhook + agent
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │  Redis (6379)   │  ← Cache conversations
         └─────────────────┘

         ┌─────────────────┐
         │ Google Sheets   │  ← Base de données artisan
         └─────────────────┘
```

---

## 🐳 Déploiement Docker (Recommandé)

### **Étape 1 : Configuration**

```bash
# Cloner repo
cd /home/user/devis-vocal

# Copier template env
cp .env.example .env

# Éditer .env avec vos clés
nano .env
```

**Variables OBLIGATOIRES** :
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
GOOGLE_CREDENTIALS_PATH=config/google_credentials.json
WEBHOOK_SECRET=<générer_random_32_chars>
ADMIN_API_KEY=<votre_cle_admin>
```

### **Étape 2 : Configurer artisan**

```bash
# Éditer config/artisans.json
nano config/artisans.json
```

**Remplacer** :
- `sheets_id` → ID de votre Google Sheets (visible dans URL)
- `phone_number` → Numéro WhatsApp artisan (format: +33650505050)
- `raison_sociale`, `siret`, etc. → Infos réelles

### **Étape 3 : Google Sheets Setup**

1. Créer un Google Sheets avec onglets :
   - **Clients** : colonnes `id | nom | prenom | email | telephone | adresse | code_postal | ville`
   - **Devis** : colonnes `numero | date | client_id | total_ht | tva | total_ttc | statut`
   - **Stocks** : colonnes `designation | quantite | unite | prix_unitaire_ht`

2. Partager le Sheets avec le Service Account email (depuis `google_credentials.json`)

### **Étape 4 : Build + Démarrage**

```bash
cd deploy

# Build image Docker
docker-compose build

# Démarrer services
docker-compose up -d

# Vérifier logs
docker-compose logs -f api
```

### **Étape 5 : Test**

```bash
# Health check
curl http://localhost:8000/health

# Test message direct
curl -X POST http://localhost:8000/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "from_number": "+33650505050",
    "message": "Liste tous les clients",
    "artisan_id": "artisan_test_001"
  }'
```

---

## ☁️ Déploiement Railway/Render (Cloud)

### **Option A : Railway (recommandé)**

1. Créer compte : https://railway.app/
2. New Project → Deploy from GitHub
3. Sélectionner repo + branche `feature/langchain-architecture`
4. Ajouter variables d'environnement (Settings → Variables)
5. Deploy automatique à chaque push

**Variables requises** :
```
OPENAI_API_KEY=sk-proj-xxx
GOOGLE_CREDENTIALS_PATH=config/google_credentials.json
WEBHOOK_SECRET=xxx
ADMIN_API_KEY=xxx
PORT=8000
```

**Coût estimé** : $5-10/mois

### **Option B : Render**

1. Créer compte : https://render.com/
2. New Web Service → Connect repository
3. Build Command : `pip install -r requirements.txt`
4. Start Command : `uvicorn api.webhook:app --host 0.0.0.0 --port $PORT`
5. Ajouter variables d'environnement

**Coût estimé** : $7/mois (plan Starter)

---

## 🔌 Connexion WhatsApp

### **Option 1 : Twilio (payant, stable)**

```bash
# Config Twilio dans .env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Webhook URL** : `https://votre-domaine.com/webhook/whatsapp`

### **Option 2 : n8n + WhatsApp Web (gratuit, moins stable)**

1. Installer n8n : https://n8n.io/
2. Workflow :
   - **Trigger** : WhatsApp Web (node community)
   - **HTTP Request** : POST vers `https://votre-api.com/webhook/whatsapp`
   - **WhatsApp Send** : Envoyer réponse

---

## 📊 Monitoring Production

### **Logs en temps réel**
```bash
docker-compose logs -f api
```

### **Métriques**
- Agents actifs : `GET /health` → `agents_actifs`
- Redis cache : `docker exec -it artisan-chatbot-redis redis-cli INFO`

### **Redémarrage**
```bash
# Redémarrer API
docker-compose restart api

# Rebuild complet
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 🔒 Sécurité Production

1. **HTTPS obligatoire** : Utiliser Nginx + Let's Encrypt (Certbot)
2. **Webhook signature** : Vérifier `x-webhook-signature` (déjà implémenté)
3. **Rate limiting** : Ajouter middleware FastAPI (ex: slowapi)
4. **Secrets** : Ne JAMAIS commit `.env` ou `google_credentials.json`
5. **Firewall** : Limiter accès port 8000 (uniquement Nginx)

---

## 🧪 Tests E2E

```bash
# 1. Test recherche client
curl -X POST http://localhost:8000/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "from_number": "+33650505050",
    "message": "Recherche client Dupont"
  }'

# 2. Test création client
curl -X POST http://localhost:8000/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "from_number": "+33650505050",
    "message": "Crée client Martin Pierre téléphone 0612345678 ville Paris"
  }'

# 3. Test génération devis
curl -X POST http://localhost:8000/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "from_number": "+33650505050",
    "message": "Crée devis peinture 30m² pour Dupont"
  }'
```

---

## 🐛 Troubleshooting

### **Erreur : "Artisan non reconnu"**
→ Vérifier `phone_number` dans `config/artisans.json` (format +33...)

### **Erreur : "Google Sheets API"**
→ Vérifier `google_credentials.json` présent et Service Account partagé avec Sheets

### **Erreur : "OpenAI API rate limit"**
→ Vérifier crédits OpenAI : https://platform.openai.com/account/usage

### **Logs vides**
→ `docker-compose logs api` ou vérifier `LOG_LEVEL=DEBUG` dans `.env`

---

## 📞 Support

**GitHub** : https://github.com/Kaiser28/devis-artisan-vocal  
**Branche** : `feature/langchain-architecture`  
**Docs** : `VISION_NOUVELLE_ARCHITECTURE.md`

---

**Version sauvegardée** : Tag `v4-stable-pre-transformation` (branche main)  
**Rollback possible** : `git checkout v4-stable-pre-transformation`
