# 🎯 VISION NOUVELLE ARCHITECTURE - Agence Chatbot Artisan

**Date** : 2026-02-16  
**Branche** : `feature/langchain-architecture`  
**Version précédente sauvegardée** : Tag `v4-stable-pre-transformation` (commit `ed36d66`)

---

## 🎯 Vision en une phrase

**Une agence qui déploie des assistants IA sur-mesure pour artisans, accessibles depuis leur téléphone, connectés à leurs outils existants (Google Sheets, calendrier, stocks), sans changer leurs habitudes.**

---

## 🧱 Architecture en 3 couches

### **Couche 1 — L'Interface Client (ce que voit l'artisan)**

```
📱 WhatsApp / SMS / Interface Web simple
        ↓
    Message texte ou vocal de l'artisan
```

**Principe** : L'artisan ne change rien à ses habitudes. Il envoie un message comme à un collègue.

**Exemples d'interactions** :
- « Crée un devis pour Dupont, peinture 30m² »
- « J'ai rendez-vous avec qui demain ? »
- « Combien me reste-t-il de peinture blanche ? »

---

### **Couche 2 — Le Cerveau (LangChain + LLM)**

```
    LangChain (orchestrateur)
    ├── 🤖 LLM (GPT-4 / Gemini / Claude)
    │       → comprend l'intention du message
    ├── 🛠️ Tools (modules enfichables)
    │   ├── Tool 1 : Lecture/écriture Google Sheets
    │   ├── Tool 2 : Calendrier Google
    │   ├── Tool 3 : Vérification stocks
    │   ├── Tool 4 : Génération de devis PDF
    │   └── Tool 5 : (ajout futur sans tout réécrire)
    └── 🧠 Mémoire (historique de conversation)
```

**Avantages** :
- **Modulaire** : Ajouter un nouveau tool = créer un fichier Python
- **Évolutif** : Chaque artisan a sa config personnalisée
- **Intelligent** : Le LLM choisit automatiquement le bon tool

---

### **Couche 3 — La Base de Données (Google Sheets)**

```
📊 Google Sheets = Base de données zéro-technique
    ├── Onglet Clients
    ├── Onglet Devis / Factures
    ├── Onglet Stocks
    └── Onglet Rendez-vous
```

**Pourquoi Sheets ?**
- ✅ L'artisan peut le **voir** et le **modifier** lui-même
- ✅ Pas de base SQL mystérieuse
- ✅ Synchronisation automatique avec le chatbot
- ✅ Export Excel/PDF natif
- ✅ Partageable avec comptable/associés

---

## 🔄 Flux de données (de bout en bout)

```
1. 📱 Artisan envoie un message
        ↓ (WhatsApp / SMS)
2. 🔌 Webhook (n8n / Make)
        ↓ (POST request)
3. 🧠 LangChain reçoit le message
        ↓ (Prompt enrichi)
4. 🤖 LLM analyse l'intention
        ↓ (Choix du tool)
5. 🛠️ Tool sélectionné automatiquement
        ↓ (API Sheets)
6. 📊 Google Sheets mis à jour
        ↓ (Confirmation)
7. ✅ Réponse envoyée à l'artisan
```

**Exemple concret** :
```
Artisan : "Crée un devis pour Dupont, peinture 30m²"
        ↓
LangChain détecte : intention = créer_devis
        ↓
Tool activé : devis_tool.py
        ↓
1. Recherche client "Dupont" dans Sheets
2. Récupère prix "peinture" (25€/m²)
3. Calcule total HT/TTC
4. Génère PDF devis
5. Enregistre dans onglet Devis
        ↓
Réponse : "✅ Devis DEV-2026-005 créé pour Dupont. Total TTC : 900€. PDF envoyé par email."
```

---

## 🗂️ Structure du Projet (dossiers & fichiers)

```
📁 agence-chatbot-artisan/
│
├── 📁 core/                   ← Le cerveau
│   ├── agent.py               ← LangChain agent principal
│   ├── tools/
│   │   ├── sheets_tool.py     ← Lecture/écriture Google Sheets
│   │   ├── calendar_tool.py   ← Gestion agenda
│   │   ├── stock_tool.py      ← Vérif stocks
│   │   └── devis_tool.py      ← Génération devis PDF
│   └── memory.py              ← Mémoire de conversation
│
├── 📁 api/                    ← Point d'entrée des messages
│   ├── webhook.py             ← Reçoit les messages (WhatsApp/SMS)
│   └── router.py              ← Redirige vers le bon agent
│
├── 📁 config/                 ← Configuration par client
│   ├── artisan_1_config.json  ← Paramètres spécifiques artisan 1
│   └── artisan_2_config.json  ← Paramètres spécifiques artisan 2
│
├── 📁 templates/              ← Modèles réutilisables
│   ├── devis_template.pdf
│   └── message_templates.json
│
└── 📁 deploy/                 ← Déploiement
    ├── Dockerfile
    └── .env.example
```

---

## 📦 Stack Technique Recommandée

| Besoin | Outil | Pourquoi |
|--------|-------|----------|
| **Orchestration IA** | LangChain | Modulaire, évolutif |
| **LLM** | GPT-4o / Gemini | Selon budget client |
| **Interface artisan** | WhatsApp Business API | Il est déjà dessus |
| **Automatisation flux** | n8n (self-hosted) | Gratuit, puissant |
| **Base de données** | Google Sheets | Compréhensible par l'artisan |
| **Hébergement** | Railway / Render | Déploiement simple, pas cher |
| **Auth & sécurité** | Supabase | Simple à configurer |

---

## 🔄 Migration depuis version actuelle

### **État actuel (v4)**
- **Stack** : Next.js 15 + Hono + Cloudflare Pages + Supabase
- **Interface** : Chat web uniquement
- **Base données** : Supabase PostgreSQL
- **IA** : OpenAI Assistant API (fonction calling)

### **Nouvelle architecture (cible)**
- **Stack** : Python + LangChain + Google Sheets API
- **Interface** : WhatsApp / SMS / Web
- **Base données** : Google Sheets
- **IA** : LangChain + LLM au choix (GPT-4/Gemini/Claude)

### **Stratégie de migration**

#### **Option A : Migration progressive (recommandée)**
1. **Phase 1** : Créer nouvelle stack Python + LangChain en parallèle
2. **Phase 2** : Migrer données Supabase → Google Sheets
3. **Phase 3** : Tester nouvelle stack avec 1 artisan pilote
4. **Phase 4** : Basculer progressivement les artisans
5. **Phase 5** : Désactiver ancienne stack

**Avantage** : Risque zéro, rollback facile  
**Durée estimée** : 2-3 semaines

#### **Option B : Refonte complète**
1. Développer nouvelle architecture de zéro
2. Importer données en une fois
3. Basculer tous les artisans simultanément

**Avantage** : Plus rapide  
**Inconvénient** : Risque de downtime  
**Durée estimée** : 1 semaine

---

## 🎯 Différences clés vs version actuelle

| Aspect | Version actuelle (v4) | Nouvelle architecture |
|--------|----------------------|----------------------|
| **Interface** | Chat web uniquement | WhatsApp / SMS / Web |
| **Base données** | Supabase (PostgreSQL) | Google Sheets |
| **Artisan voit les données ?** | ❌ Non (backend caché) | ✅ Oui (Sheets = transparent) |
| **Multi-artisans** | ❌ Complexe (1 Supabase DB = tous) | ✅ Simple (1 Sheets = 1 artisan) |
| **Ajout fonctionnalités** | 🟡 Modifier Next.js + API | ✅ Créer nouveau tool Python |
| **Déploiement** | Vercel (frontend) + Supabase | Railway / Render (backend) |
| **Coût hébergement** | ~$25/mois (Vercel + Supabase) | ~$10/mois (Railway + Sheets gratuit) |
| **Onboarding artisan** | 🟡 Créer compte + formation | ✅ Envoyer lien WhatsApp |

---

## 🚀 Roadmap Transformation

### **Semaine 1 : Setup infrastructure**
- [ ] Créer repo Python + LangChain
- [ ] Configurer Google Sheets API
- [ ] Développer `sheets_tool.py` (CRUD clients/devis)
- [ ] Développer `devis_tool.py` (génération PDF)
- [ ] Tester LangChain agent basique

### **Semaine 2 : Intégrations**
- [ ] Intégrer WhatsApp Business API
- [ ] Configurer webhook n8n/Make
- [ ] Développer `calendar_tool.py`
- [ ] Développer `stock_tool.py`
- [ ] Tests E2E flux complet

### **Semaine 3 : Migration & Production**
- [ ] Migrer données Supabase → Sheets (script Python)
- [ ] Déployer sur Railway/Render
- [ ] Tests artisan pilote (vous ?)
- [ ] Documenter onboarding nouveau client
- [ ] Basculer production

---

## 📝 Prochaines actions immédiates

1. **Créer structure dossiers** (voir ci-dessus)
2. **Installer dépendances Python** :
   ```bash
   pip install langchain langchain-openai gspread oauth2client python-dotenv
   ```
3. **Configurer Google Sheets API** :
   - Créer projet Google Cloud
   - Activer Sheets API
   - Créer service account + JSON credentials
4. **Développer premier tool** : `sheets_tool.py`
5. **Tester agent LangChain basique** : recherche client dans Sheets

---

## ⚠️ Points d'attention

### **Sécurité**
- Chaque artisan a son propre Sheets (pas de données croisées)
- Service account Google avec permissions restreintes
- Webhook sécurisé (token secret)
- Logs chiffrés

### **Performance**
- Google Sheets API : 100 requêtes/100s/user (largement suffisant)
- Cache local pour éviter appels répétés
- Optimiser lecture Sheets (batch requests)

### **Scalabilité**
- Architecture modulaire → facile d'ajouter artisans
- Chaque artisan = instance agent indépendante
- Déploiement conteneurisé (Docker)

---

## 🔖 Ressources & Documentation

- **LangChain** : https://python.langchain.com/docs/
- **Google Sheets API** : https://developers.google.com/sheets/api
- **WhatsApp Business API** : https://developers.facebook.com/docs/whatsapp
- **n8n** : https://docs.n8n.io/
- **Railway** : https://docs.railway.app/

---

**Version sauvegardée** : Tag `v4-stable-pre-transformation` sur branche `main`  
**Branche transformation** : `feature/langchain-architecture`  
**Rollback possible** : `git checkout v4-stable-pre-transformation`
