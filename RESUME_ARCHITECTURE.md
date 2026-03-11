# 📊 RÉSUMÉ ARCHITECTURE LANGCHAIN - État actuel

**Date** : 2026-03-11  
**Branche** : `feature/langchain-architecture`  
**Derniers commits** : `ced1f13` (architecture complète), `a07a233` (setup initial), `29c7f4e` (vision)  
**GitHub** : https://github.com/Kaiser28/devis-artisan-vocal/tree/feature/langchain-architecture

---

## ✅ COMPOSANTS DÉVELOPPÉS (100%)

### **1. Agent LangChain Principal** (`core/agent.py` - 252 lignes)

```python
# Architecture agent
ArtisanAgent(artisan_id, config)
  ├── LLM : GPT-4o-mini (configurable)
  ├── Tools : [SheetsTool, DevisTool, ...]
  ├── Memory : ConversationBufferMemory
  ├── Prompt : Système personnalisé par spécialité
  └── Executor : AgentExecutor avec max_iterations=5

AgentFactory
  └── get_agent(artisan_id, config) → Pattern Singleton par artisan
```

**Fonctionnalités** :
- ✅ Orchestration automatique tools via function calling
- ✅ Mémoire conversation persistante
- ✅ Prompt adapté par métier artisan (peinture, plomberie, etc.)
- ✅ Support sync + async (webhooks)
- ✅ Gestion erreurs avec `handle_parsing_errors=True`

---

### **2. Tools Modulaires**

#### **SheetsTool** (`core/tools/sheets_tool.py` - 183 lignes)

```python
Fonctions :
  - search_client(query) : Recherche floue nom/prénom/tel/email
  - create_client(**kwargs) : Création avec auto-ID (CLT-NNNN)
  - get_all_clients() : Liste top 10
```

**Google Sheets requis** : Onglet `Clients` avec colonnes
```
id | nom | prenom | email | telephone | adresse | code_postal | ville
```

#### **DevisTool** (`core/tools/devis_tool.py` - 402 lignes)

```python
Fonctions :
  - create_devis(client, prestations, remise, acompte, ...)
    → Génère PDF professionnel + calculs auto

Calculs automatiques :
  - Total HT brut = Σ(quantité × prix_unitaire_ht)
  - Remise (%) → Montant remise
  - Total HT net = HT brut - Remise
  - TVA (%) → Montant TVA
  - Total TTC = HT net + TVA
  - Acompte (%) → Reste à payer
```

**Export PDF** : ReportLab A4 avec
- En-tête artisan + client
- Tableau prestations (désignation, qté, unité, P.U. HT, Total HT)
- Totaux détaillés + conditions paiement
- Numérotation auto (DEV-YYYY-NNNN)

---

### **3. API Webhook FastAPI** (`api/webhook.py` - 259 lignes)

#### **Endpoints**

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/` | GET | Health check simple |
| `/health` | GET | Détails : agents actifs, artisans configurés |
| `/webhook/whatsapp` | POST | Réception messages WhatsApp (Twilio) |
| `/webhook/sms` | POST | Réception SMS |
| `/api/message` | POST | API directe pour tests/web |
| `/api/admin/reload-configs` | POST | Recharge configs artisans (admin) |
| `/api/admin/agent/{id}` | DELETE | Supprime agent de mémoire (admin) |

#### **Sécurité**
- ✅ Vérification signature HMAC (`x-webhook-signature`)
- ✅ Auto-détection artisan par `phone_number`
- ✅ Admin endpoints protégés par `ADMIN_API_KEY`

---

### **4. Configuration Multi-Artisan**

#### **`config/artisans.json`** (2 exemples)

```json
{
  "artisan_test_001": {
    "phone_number": "+33650505050",
    "sheets_id": "VOTRE_SHEETS_ID",
    "raison_sociale": "Dupont Peinture SARL",
    "siret": "12345678901234",
    "adresse": "10 rue de la République",
    "code_postal": "78000",
    "ville": "Versailles",
    "telephone": "01 39 50 50 50",
    "email": "contact@dupont-peinture.fr",
    "specialites": ["Peinture", "Ravalement"],
    "assurance_decennale": "Compagnie ABC - Police n°123456789"
  }
}
```

**Principe** : 1 artisan = 1 Google Sheets = 1 agent LangChain indépendant

---

### **5. Variables Environnement** (`.env.example` - 47 lignes)

```env
OPENAI_API_KEY=sk-proj-xxx
GOOGLE_CREDENTIALS_PATH=config/google_credentials.json
WEBHOOK_SECRET=<générer_random_32_chars>
ADMIN_API_KEY=<votre_cle_admin>
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
REDIS_URL=redis://localhost:6379
LOG_LEVEL=INFO
ENVIRONMENT=development
```

---

### **6. Déploiement Docker Production**

#### **`deploy/Dockerfile`** (54 lignes)
- Multi-stage build (builder + runtime)
- Python 3.11-slim
- Utilisateur non-root (appuser:1000)
- Health check intégré
- Workers : 2 (Uvicorn)

#### **`deploy/docker-compose.yml`** (97 lignes)
```yaml
Services :
  - api (FastAPI port 8000)
  - redis (cache port 6379)
  - nginx (reverse proxy 80/443)

Volumes persistants :
  - output/devis (PDF générés)
  - config (artisans.json, credentials)
  - logs (debug production)
```

#### **`deploy/GUIDE_DEPLOIEMENT.md`** (282 lignes)
- Prérequis Google Cloud + OpenAI
- Setup Google Sheets avec Service Account
- Déploiement Docker local
- Déploiement cloud (Railway/Render)
- Connexion WhatsApp (Twilio/n8n)
- Tests E2E, troubleshooting, sécurité

---

## 🎯 FLUX DE DONNÉES COMPLET

```
1. 📱 Artisan envoie message WhatsApp
      ↓ (Twilio webhook)
2. 🔌 POST /webhook/whatsapp
      ↓ (Vérif signature HMAC)
3. 🤖 Détection artisan_id par phone_number
      ↓ (AgentFactory.get_agent)
4. 🧠 LangChain Agent analyse intention
      ↓ (GPT-4o-mini function calling)
5. 🛠️ Tool sélectionné automatiquement
      ↓ (ex: SheetsTool.search_client)
6. 📊 Lecture/écriture Google Sheets
      ↓ (gspread API)
7. 📄 Génération PDF si devis (DevisTool)
      ↓ (ReportLab)
8. ✅ Réponse envoyée à l'artisan
      ↓ (Twilio API)
9. 📱 Message reçu sur WhatsApp artisan
```

---

## 📋 DÉPENDANCES PYTHON (`requirements.txt`)

```
Core :
  - langchain==0.1.0
  - langchain-openai==0.0.5
  - openai==1.10.0

Google Sheets :
  - gspread==5.12.0
  - oauth2client==4.1.3
  - google-auth==2.26.2

API :
  - fastapi==0.109.0
  - uvicorn[standard]==0.27.0
  - pydantic==2.5.3

PDF :
  - reportlab==4.0.9
  - PyPDF2==3.0.1

WhatsApp :
  - twilio==8.11.1

Cache :
  - redis==5.0.1

Dev :
  - pytest==7.4.4
  - black==23.12.1
```

---

## 🚀 DÉMARRAGE RAPIDE

### **Option 1 : Docker (recommandé)**

```bash
cd /home/user/devis-vocal

# 1. Copier .env.example → .env et remplir clés
cp .env.example .env
nano .env

# 2. Configurer artisan dans config/artisans.json
nano config/artisans.json

# 3. Ajouter google_credentials.json dans config/
# (depuis Google Cloud Console)

# 4. Build + démarrer
cd deploy
docker-compose up -d

# 5. Tester
curl http://localhost:8000/health
```

### **Option 2 : Local Python**

```bash
cd /home/user/devis-vocal

# 1. Créer venv
python3 -m venv venv
source venv/bin/activate

# 2. Installer dépendances
pip install -r requirements.txt

# 3. Configurer .env
cp .env.example .env
nano .env

# 4. Démarrer API
python -m uvicorn api.webhook:app --reload --port 8000

# 5. Tester
curl -X POST http://localhost:8000/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "from_number": "+33650505050",
    "message": "Liste tous les clients",
    "artisan_id": "artisan_test_001"
  }'
```

---

## 🧪 TESTS E2E RECOMMANDÉS

```bash
# Test 1 : Recherche client inexistant
curl -X POST http://localhost:8000/api/message -H "Content-Type: application/json" -d '{"from_number": "+33650505050", "message": "Recherche client Dupont", "artisan_id": "artisan_test_001"}'

# Test 2 : Création client
curl -X POST http://localhost:8000/api/message -H "Content-Type: application/json" -d '{"from_number": "+33650505050", "message": "Crée client Martin Pierre téléphone 0612345678 ville Paris", "artisan_id": "artisan_test_001"}'

# Test 3 : Génération devis
curl -X POST http://localhost:8000/api/message -H "Content-Type: application/json" -d '{"from_number": "+33650505050", "message": "Crée devis peinture 30m² pour Martin, prix 25 euros/m²", "artisan_id": "artisan_test_001"}'

# Test 4 : Health check
curl http://localhost:8000/health
```

---

## 📂 STRUCTURE FICHIERS COMPLÈTE

```
devis-vocal/
├── core/
│   ├── agent.py                    ← Agent LangChain principal (252 lignes)
│   └── tools/
│       ├── sheets_tool.py          ← CRUD Google Sheets (183 lignes)
│       └── devis_tool.py           ← Génération PDF (402 lignes)
│
├── api/
│   └── webhook.py                  ← FastAPI endpoints (259 lignes)
│
├── config/
│   ├── artisans.json               ← Config multi-artisan (2 exemples)
│   └── google_credentials.json    ← À créer (Service Account Google)
│
├── deploy/
│   ├── Dockerfile                  ← Multi-stage optimisé (54 lignes)
│   ├── docker-compose.yml          ← Stack complète (97 lignes)
│   └── GUIDE_DEPLOIEMENT.md        ← Doc détaillée (282 lignes)
│
├── output/
│   └── devis/                      ← PDF générés (DEV-YYYY-NNNN.pdf)
│
├── requirements.txt                ← Dépendances Python (46 lignes)
├── .env.example                    ← Template variables env (47 lignes)
├── .gitignore                      ← Exclusions (.env, credentials)
│
└── VISION_NOUVELLE_ARCHITECTURE.md ← Architecture globale (284 lignes)
```

---

## ⚠️ PRÉREQUIS AVANT TESTS

### **1. Google Cloud Setup (gratuit)**

1. Créer projet : https://console.cloud.google.com/
2. Activer API Google Sheets
3. Créer Service Account :
   - IAM & Admin → Service Accounts → Create
   - Créer clé JSON → Télécharger
   - Placer dans `config/google_credentials.json`

### **2. Google Sheets Setup**

1. Créer nouveau Sheets avec onglets :
   - **Clients** : `id | nom | prenom | email | telephone | adresse | code_postal | ville`
   - **Devis** : `numero | date | client_id | total_ht | tva | total_ttc | statut`

2. Partager Sheets avec email Service Account (depuis JSON)

3. Copier Sheets ID (depuis URL) dans `config/artisans.json`

### **3. OpenAI API Key**

1. Créer compte : https://platform.openai.com/
2. Générer API key : https://platform.openai.com/api-keys
3. Budget recommandé : $10/mois (gpt-4o-mini ≈ $0.15/1M tokens)

---

## 🔜 PROCHAINES ÉTAPES (Priorités)

### **Phase 1 : Tests Locaux (2-3h)**
- [ ] Configurer Google Cloud + Service Account
- [ ] Créer Google Sheets test avec onglet Clients
- [ ] Configurer `.env` avec vraies clés
- [ ] Tester `/api/message` avec curl (recherche client)
- [ ] Tester création client
- [ ] Tester génération devis PDF

### **Phase 2 : Tools Additionnels (4-6h)**
- [ ] `CalendarTool` : Gestion rendez-vous Google Calendar
- [ ] `StockTool` : Vérification stocks (lecture onglet Stocks)
- [ ] `PriceTool` : Récupération prix catalogue
- [ ] Intégrer tools dans `core/agent.py`

### **Phase 3 : WhatsApp (2-4h)**
- [ ] Créer compte Twilio : https://www.twilio.com/
- [ ] Configurer WhatsApp Business Sandbox
- [ ] Tester webhook Twilio → API locale (ngrok)
- [ ] Valider messages bidirectionnels

### **Phase 4 : Déploiement Production (2-3h)**
- [ ] Déployer sur Railway : https://railway.app/
- [ ] Configurer variables d'environnement production
- [ ] Tester webhook Twilio → API Railway
- [ ] Monitoring logs + métriques

### **Phase 5 : Multi-Artisan (1-2h)**
- [ ] Ajouter 2e artisan dans `config/artisans.json`
- [ ] Créer 2e Google Sheets indépendant
- [ ] Tester isolation données (artisan A ne voit pas artisan B)

---

## 📊 MÉTRIQUES PROJET

| Métrique | Valeur |
|----------|--------|
| **Lignes de code Python** | ~1 100 lignes |
| **Fichiers créés** | 10 fichiers |
| **Commits branche** | 3 commits |
| **Dépendances Python** | 20 packages |
| **Tools disponibles** | 2 (SheetsTool, DevisTool) |
| **Endpoints API** | 7 routes |
| **Temps développement** | ~4h |
| **Complexité** | Moyenne-Haute |

---

## 💾 VERSIONS & ROLLBACK

**Version stable v4 (Next.js + Supabase)** :
- Tag : `v4-stable-pre-transformation`
- Branche : `main`
- Rollback : `git checkout v4-stable-pre-transformation`

**Version nouvelle architecture (Python + LangChain)** :
- Branche : `feature/langchain-architecture`
- Dernier commit : `ced1f13`
- GitHub : https://github.com/Kaiser28/devis-artisan-vocal/tree/feature/langchain-architecture

---

## 🤝 COMPARAISON V4 vs NOUVELLE ARCHI

| Aspect | V4 (Next.js) | Nouvelle (LangChain) |
|--------|-------------|---------------------|
| **Interface** | Chat web uniquement | WhatsApp/SMS/Web |
| **Base données** | Supabase PostgreSQL | Google Sheets |
| **Artisan voit les données ?** | ❌ Non (backend caché) | ✅ Oui (Sheets = transparent) |
| **Multi-artisans** | ❌ Complexe (1 DB = tous) | ✅ Simple (1 Sheets = 1 artisan) |
| **Ajout fonctionnalités** | 🟡 Modifier Next.js + API | ✅ Créer nouveau tool Python |
| **Déploiement** | Vercel + Supabase | Railway/Render + Docker |
| **Coût hébergement** | ~$25/mois | ~$10/mois |
| **Onboarding artisan** | 🟡 Créer compte + formation | ✅ Envoyer lien WhatsApp |
| **Génération PDF** | ❌ Non implémenté | ✅ Automatique (ReportLab) |

---

## 📞 DOCUMENTATION DISPONIBLE

1. **VISION_NOUVELLE_ARCHITECTURE.md** : Architecture 3 couches, roadmap, stack technique
2. **deploy/GUIDE_DEPLOIEMENT.md** : Setup complet, Docker, cloud, WhatsApp
3. **SUCCES_WORKFLOW_V4.md** : Workflow v4 stable (référence)
4. **BACKLOG_BUGS_FEATURES.md** : Bugs v4 non traités
5. **Ce fichier (RESUME_ARCHITECTURE.md)** : État actuel + prochaines étapes

---

**🎯 STATUT FINAL : Architecture fonctionnelle prête pour tests locaux avec Google Sheets réel.**

**Action immédiate** : Configurer Google Cloud + Service Account + créer Sheets test.
