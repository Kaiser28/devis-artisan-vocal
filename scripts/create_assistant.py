#!/usr/bin/env python3
import os
import json
import requests

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    with open('.env.local') as f:
        for line in f:
            if line.startswith('OPENAI_API_KEY='):
                OPENAI_API_KEY = line.strip().split('=', 1)[1]
                break

# Récupérer l'ancien ID si existe
old_id = os.getenv('OPENAI_ASSISTANT_ID')
if not old_id and os.path.exists('.env.local'):
    with open('.env.local') as f:
        for line in f:
            if line.startswith('OPENAI_ASSISTANT_ID='):
                old_id = line.strip().split('=', 1)[1]
                break

print("🚀 Création nouvel assistant OpenAI...")
print(f"Clé API : {OPENAI_API_KEY[:20]}...")
if old_id:
    print(f"Ancien ID : {old_id}\n")

# Supprimer ancien si existe
if old_id:
    try:
        r = requests.delete(
            f'https://api.openai.com/v1/assistants/{old_id}',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'OpenAI-Beta': 'assistants=v2'
            }
        )
        if r.status_code == 200:
            print("✅ Ancien assistant supprimé\n")
        else:
            print(f"⚠️  Ancien assistant déjà supprimé (status {r.status_code})\n")
    except:
        print("⚠️  Impossible supprimer ancien\n")

# Charger tools depuis fichier JSON externe
with open('scripts/assistant-tools.json') as f:
    tools = json.load(f)

# Instructions
instructions = """Tu es un assistant IA spécialisé dans la gestion de devis BTP pour artisans français.

WORKFLOW AUTONOME OBLIGATOIRE :

**CLIENTS :**
1. Demande création client → check_duplicate_client(nom, ville) AUTOMATIQUE
2. Résultats trouvés → "⚠️ Client similaire : [Nom Prénom], [Ville] [CP], [Téléphone]. Même entité ?"
   - Si utilisateur confirme "oui c'est lui" → utiliser client existant
   - Si utilisateur dit "non différent" → create_client()
3. Aucun doublon → create_client() avec TOUS les paramètres fournis par utilisateur
   IMPORTANT : tu DOIS passer telephone OU email dans l'appel create_client
   Exemple correct : create_client(nom="Dupont", prenom="Alain", telephone="0645454545", ville="Versailles")
4. Si fonction retourne erreur → AFFICHE MESSAGE ERREUR EXACT puis explique

**DEVIS :**
1. Demande création → SÉQUENCE AUTOMATIQUE :
   a. Résoudre client : search_clients → sélection auto ou création
   b. Résoudre prestations : search_prices → create_price si absent
   c. Calculs automatiques : HT, remise, TVA, TTC, acompte
   d. Présenter brouillon structuré complet
   e. Validation unique

2. Modification : update_devis() + recalcul auto

**VALIDATIONS :**
Confirmer uniquement : doublons clients, créations prix, sauvegarde finale.

**CALCULS :**
TVA 10% isolation/plâtrerie/menuiserie, 20% fournitures. Arrondi 2 décimales.

**GESTION ERREURS :**
Quand une fonction retourne {"success": false, "error": "..."} :
1. AFFICHE le message d'erreur exact : "❌ Erreur : [message]"
2. Explique la cause probable
3. Demande les informations manquantes ou propose solution alternative

Exemple :
- Erreur reçue : "Email ou téléphone obligatoire"
- Ta réponse : "❌ Erreur création client : Email ou téléphone obligatoire. Je n'ai pas reçu votre numéro. Pouvez-vous me le redonner ?"

IMPORTANT : Utilise TOUJOURS les fonctions disponibles plutôt que deviner. Passe TOUS les paramètres fournis par l'utilisateur aux fonctions."""

payload = {
    "name": "Devis BTP Assistant v2 - Workflow Autonome",
    "model": "gpt-4o-mini",
    "temperature": 0.7,
    "instructions": instructions,
    "tools": tools,
    "metadata": {
        "version": "2.0",
        "features": "autonomous_workflow,create_client,check_duplicate,create_price,update_devis"
    }
}

# Créer assistant
r = requests.post(
    'https://api.openai.com/v1/assistants',
    headers={
        'Authorization': f'Bearer {OPENAI_API_KEY}',
        'OpenAI-Beta': 'assistants=v2',
        'Content-Type': 'application/json'
    },
    json=payload
)

if r.status_code != 200:
    print(f"❌ Erreur {r.status_code}: {r.text}")
    exit(1)

assistant = r.json()
print("✅ Nouvel assistant créé!\n")
print(f"📋 ID: {assistant['id']}")
print(f"   Nom: {assistant['name']}")
print(f"   Modèle: {assistant['model']}")
print(f"   Tools: {len(assistant.get('tools', []))} fonctions\n")

print("🔧 Tools disponibles:")
for i, tool in enumerate(assistant.get('tools', []), 1):
    if tool['type'] == 'function':
        print(f"   {i}. {tool['function']['name']}")

print("\n📝 ACTIONS REQUISES:\n")
print("1️⃣  Ajouter dans .env.local:")
print(f"OPENAI_ASSISTANT_ID={assistant['id']}\n")
print("2️⃣  Ajouter dans Vercel Environment Variables:")
print(f"   OPENAI_ASSISTANT_ID={assistant['id']}\n")

# Sauvegarder ID
with open('.assistant-id', 'w') as f:
    f.write(assistant['id'])
print("💾 ID sauvegardé dans .assistant-id")
