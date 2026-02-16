# 🔧 GUIDE CONFIGURATION VERCEL - Restauration Assistant v4

**Date** : 2026-02-16 13:45  
**Objectif** : Restaurer assistant v4 stable sur Vercel  
**Assistant ID cible** : `asst_cxFeyG9ytDMSMlLIeC5SVa1A`

---

## 📝 Étape 1 : Accéder aux variables d'environnement Vercel

1. **Ouvrir le dashboard Vercel** :
   - URL : https://vercel.com/kaiser28s-projects/devis-artisan-vocal/settings/environment-variables

2. **Se connecter** (si nécessaire) :
   - Email/GitHub de votre compte Vercel
   - Autoriser l'accès au projet `devis-artisan-vocal`

3. **Localiser la section "Environment Variables"** :
   - Dans le menu gauche : **Settings** → **Environment Variables**
   - Vous verrez la liste des variables configurées

---

## 🔍 Étape 2 : Vérifier la variable actuelle

**Rechercher** : `OPENAI_ASSISTANT_ID`

**Valeur actuelle possible** :
- ❌ `asst_g7rysLPm3HIA2PnwIxQhF3Iu` (v6 cassé)
- ❌ `asst_SnH3CtwziXe7A4mKdkWqYCj1` (v5)
- ⚠️ `asst_cxFeyG9ytDMSMlLIeC5SVa1A` (v4 - si déjà correct, passer à l'étape 4)
- ❌ Autre ID ou absente

**Si la variable est absente** :
- Cliquer **Add New** (passer à l'étape 3)

**Si la variable existe** :
- Cliquer sur l'icône **⋯ (trois points)** à droite
- Sélectionner **Edit**

---

## ✏️ Étape 3 : Modifier/Créer la variable

### **Si vous ÉDITEZ une variable existante** :
1. **Champ "Value"** : Remplacer par `asst_cxFeyG9ytDMSMlLIeC5SVa1A`
2. **Environment** : Vérifier que les 3 cases sont cochées :
   - ✅ Production
   - ✅ Preview
   - ✅ Development
3. Cliquer **Save**

### **Si vous CRÉEZ une nouvelle variable** :
1. **Name** : `OPENAI_ASSISTANT_ID`
2. **Value** : `asst_cxFeyG9ytDMSMlLIeC5SVa1A`
3. **Environment** : Cocher les 3 cases :
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Cliquer **Save**

---

## 🚀 Étape 4 : Redéployer l'application

**IMPORTANT** : La modification de variable d'environnement ne prend effet qu'après un redéploiement.

### **Méthode 1 : Redéploiement automatique** (recommandé)
1. Aller sur https://vercel.com/kaiser28s-projects/devis-artisan-vocal/deployments
2. Trouver le dernier déploiement (commit `f638870` - "🔙 ROLLBACK v4")
3. Cliquer sur l'icône **⋯ (trois points)** à droite du déploiement
4. Sélectionner **Redeploy**
5. Confirmer **Redeploy**
6. Attendre 2-3 minutes (barre de progression)

### **Méthode 2 : Trigger via commit vide** (alternative)
Si le redéploiement manuel ne fonctionne pas :
```bash
cd /home/user/devis-vocal
git commit --allow-empty -m "🔄 Trigger Vercel redeploy with v4 assistant"
git push origin main
```

---

## ✅ Étape 5 : Vérifier le déploiement

### **5.1 Vérifier le statut du build**
1. Rester sur https://vercel.com/kaiser28s-projects/devis-artisan-vocal/deployments
2. Le dernier déploiement devrait afficher :
   - 🟢 **Ready** (build réussi)
   - Durée : ~2-3 minutes
   - Commit : `f638870` ou commit vide

### **5.2 Vérifier les variables d'environnement**
1. Cliquer sur le déploiement **Ready**
2. Onglet **Environment Variables**
3. Vérifier : `OPENAI_ASSISTANT_ID = asst_cxFeyG9ytDMSMlLIeC5SVa1A`

---

## 🧪 Étape 6 : Tester la création client

### **Test 1 : Création client simple**
1. Ouvrir https://devis-artisan-vocal-f2sf.vercel.app/chat
2. **Nouvelle conversation** (cliquer ➕)
3. Envoyer :
   ```
   créer devis peinture 30m² pour Bertrand Dupont téléphone 06 50 50 50 50 Versailles 78000
   ```

### **Résultat attendu** (v4 stable) :
```
🔍 Recherche du client Dupont...

(Agent trouve 0 résultat)

✅ Client Bertrand Dupont créé avec succès !

💶 Recherche du prix pour 'peinture'...

📋 DEVIS #DEV-2026-00X

LOT 1 : PEINTURE
• Peinture acrylique
  30 m² × 25,00€ = 750,00€ HT

───────────────────────────
TOTAL HT       750,00€
TVA 20%        150,00€
**TOTAL TTC    900,00€**

✏️ Modifications ? ou ✅ Validé ?
```

### **Si l'agent répond** :
- ✅ Brouillon comme ci-dessus → **SUCCÈS, v4 restauré**
- ❌ "Erreur création client" → **ÉCHEC, voir diagnostic ci-dessous**

---

## 🐛 Diagnostic si échec persiste

### **Cas 1 : Toujours "erreur création client"**

**Hypothèse** : L'ID assistant n'est pas pris en compte ou cache Vercel.

**Actions** :
1. Vérifier logs Vercel :
   - https://vercel.com/kaiser28s-projects/devis-artisan-vocal/logs
   - Filtrer par `/api/chat`
   - Chercher `🔧 create_client appelé:`
   - Noter les paramètres transmis (telephone présent ?)

2. Vider cache Vercel :
   - Dashboard → **Settings** → **Data Cache**
   - Cliquer **Purge Everything**
   - Redéployer à nouveau

3. Tester endpoint direct :
   ```bash
   cd /home/user/devis-vocal
   ./test-create-client-direct.sh
   # Suivre instructions (nécessite token auth)
   ```

### **Cas 2 : Agent utilise ancien prompt v6**

**Symptôme** : Agent affiche section 🏢 ARTISAN complète dans le brouillon.

**Cause** : Vercel utilise encore code v6 (cache CDN).

**Solution** :
1. Attendre 5-10 minutes (propagation CDN)
2. Forcer refresh navigateur : **Ctrl + Shift + R** (Windows/Linux) ou **Cmd + Shift + R** (Mac)
3. Tester à nouveau

### **Cas 3 : Erreur Supabase RLS**

**Symptôme** : Logs montrent `❌ Erreur Supabase create_client: { code: '42501' }`

**Cause** : Politique RLS bloque insertion.

**Solution** :
```sql
-- Se connecter à Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

-- Vérifier politiques existantes
SELECT * FROM pg_policies WHERE tablename = 'clients' AND cmd = 'INSERT';

-- Si absente, créer :
CREATE POLICY "Users can insert own clients"
ON clients FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## 📊 Tableau de bord de débogage

| Indicateur | ✅ OK | ❌ KO |
|-----------|-------|-------|
| **Variable Vercel** | `asst_cxFeyG9ytDMSMlLIeC5SVa1A` | Autre ID |
| **Déploiement** | 🟢 Ready | 🔴 Error |
| **Test création client** | Client créé | Erreur technique |
| **Brouillon simple** | Sans section 🏢 ARTISAN détaillée | Avec section 🏢 |
| **Logs Vercel** | `🔧 create_client appelé: { telephone: "0650..." }` | Telephone absent |

---

## 📞 Contact support si bloqué

**Si toutes les étapes échouent** :
1. Capturer screenshot :
   - Variable Vercel `OPENAI_ASSISTANT_ID`
   - Déploiement status
   - Message d'erreur chat
   - Logs Vercel `/api/chat`

2. Partager :
   - Screenshots
   - Commit hash actuel (`f638870`)
   - Résultat test endpoint direct

---

## 🎯 Résumé en 3 étapes

1. **Vercel env var** : `OPENAI_ASSISTANT_ID = asst_cxFeyG9ytDMSMlLIeC5SVa1A`
2. **Redeploy** : https://vercel.com/kaiser28s-projects/devis-artisan-vocal/deployments
3. **Test** : https://devis-artisan-vocal-f2sf.vercel.app/chat → « créer devis Dupont 0650505050 Versailles »

**Durée totale estimée** : 5-10 minutes
