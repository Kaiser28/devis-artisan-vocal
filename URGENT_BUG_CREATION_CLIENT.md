# 🚨 URGENT : Code cassé - Création client échoue

**Date** : 2026-02-16 13:38  
**Commit actuel** : `9a365ef` (v6)  
**Assistant local** : `asst_g7rysLPm3HIA2PnwIxQhF3Iu` (v6)

---

## 🔍 Symptôme

**Test utilisateur** :
```
User: "crée moi un devis pour alin bernard, un mur de 20m² à peindre en peinture acrylique blanc"
Agent: "Il semble que je ne parvienne pas à créer le client Alin Bernard en raison d'une erreur"

User: "0610101010, versailles"
Agent: "Je n'ai pas pu trouver le client Alin Bernard dans la base de données. Il semble que nous devions le créer, mais une erreur s'est produite"

User: "oui crée le client, 3 rue jacques duclos"
Agent: "Il semble qu'il y ait un problème lors de la création du client Alin Bernard"
```

**Boucle infinie** : L'agent demande confirmation → user confirme → agent échoue → redemande confirmation

---

## 🐛 Cause probable

### **Hypothèse 1 : Vercel utilise ancien assistant**
- Local : `asst_g7rysLPm3HIA2PnwIxQhF3Iu` (v6)
- Vercel : `asst_cxFeyG9ytDMSMlLIeC5SVa1A` (v4) ou `asst_SnH3CtwziXe7A4mKdkWqYCj1` (v5)
- **Conséquence** : Vercel utilise ancien prompt qui demande confirmation au lieu de créer directement

### **Hypothèse 2 : Paramètres manquants dans l'appel `create_client`**
- L'agent envoie peut-être `{ nom: "Bernard", prenom: "Alin" }` SANS `telephone`
- Backend rejette : `"Email ou téléphone obligatoire"`
- Mais l'agent ne propage pas l'erreur clairement

### **Hypothèse 3 : Erreur Supabase RLS**
- Table `clients` a politique RLS qui bloque insertion
- Backend retourne `success: false` mais l'agent ne comprend pas l'erreur

---

## ✅ Actions de diagnostic

### **1. Vérifier ID assistant Vercel**
```bash
# Via Vercel Dashboard
https://vercel.com/kaiser28s-projects/devis-artisan-vocal/settings/environment-variables
→ Chercher OPENAI_ASSISTANT_ID
→ Devrait être : asst_g7rysLPm3HIA2PnwIxQhF3Iu (v6)
→ Si différent : CORRIGER + Redeploy
```

### **2. Consulter logs Vercel**
```bash
https://vercel.com/kaiser28s-projects/devis-artisan-vocal/logs
→ Filtrer par /api/chat
→ Chercher "🔧 create_client appelé:"
→ Vérifier contenu JSON : telephone présent ?
→ Chercher "❌ Erreur Supabase create_client:"
→ Noter code erreur exact
```

### **3. Tester endpoint isolé**
```bash
# Remplacer <token> par Supabase auth token (DevTools → Application → Cookies → sb-*-auth-token)
curl -X POST https://devis-artisan-vocal-f2sf.vercel.app/api/test/create-client \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Bernard",
    "prenom": "Alin",
    "telephone": "0610101010",
    "ville": "Versailles",
    "adresse": "3 rue Jacques Duclos"
  }'
```

**Résultat attendu** :
- ✅ 200 OK → client créé → problème dans prompt assistant
- ❌ 400 Bad Request → validation backend échoue → vérifier colonnes Supabase
- ❌ 401 Unauthorized → problème auth RLS
- ❌ 500 Server Error → erreur Supabase (voir logs)

---

## 🔧 Correctifs possibles

### **Si Vercel assistant ID incorrect**
```bash
# Action manuelle Vercel :
1. Mettre OPENAI_ASSISTANT_ID = asst_g7rysLPm3HIA2PnwIxQhF3Iu
2. Redeploy
3. Attendre 2-3 min
4. Retester
```

### **Si prompt assistant défaillant**
```typescript
// lib/openai/assistant.ts ligne 31
// AVANT (bugué) :
4. Données complètes → create_client() DIRECTEMENT

// APRÈS (explicite) :
4. Données complètes → APPELER create_client(nom, prenom, telephone, ville, adresse, code_postal)
   - Passer TOUS les paramètres fournis par l'utilisateur
   - NE PAS demander confirmation supplémentaire
   - Si erreur retournée : afficher message exact + proposer retry
```

### **Si erreur Supabase RLS**
```sql
-- Vérifier politique INSERT sur clients
SELECT * FROM pg_policies WHERE tablename = 'clients' AND cmd = 'INSERT';

-- Si absente, créer :
CREATE POLICY "Users can insert own clients"
ON clients FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### **Si validation backend trop stricte**
```typescript
// app/api/chat/route.ts ligne 220
// AVANT :
if (!email && !telephone) {
  return { success: false, error: 'Email ou téléphone obligatoire' }
}

// APRÈS (log détaillé) :
if (!email && !telephone) {
  console.error('❌ Validation échec:', { email, telephone, args })
  return { 
    success: false, 
    error: 'Email OU téléphone obligatoire. Reçu : email=' + (email || 'vide') + ', tel=' + (telephone || 'vide')
  }
}
```

---

## 📝 Comparaison v4 (fonctionnel) vs v6 (cassé)

| Aspect | v4 (fonctionnel) | v6 (cassé) |
|--------|------------------|------------|
| **Assistant ID** | `asst_cxFeyG9ytDMSMlLIeC5SVa1A` | `asst_g7rysLPm3HIA2PnwIxQhF3Iu` |
| **Prompt workflow** | Simple : search → create direct | Enrichi : validation + logs |
| **Backend** | Inchangé | Inchangé |
| **Test 16/02 matin** | ✅ Client créé OK | ❌ Boucle échec |

**Hypothèse forte** : Vercel utilise encore v4/v5, et le nouveau prompt v6 n'est pas déployé → l'agent ne transmet pas correctement les paramètres.

---

## 🚀 Plan de résolution immédiat

1. **Vérifier Vercel env var** (2 min)
2. **Corriger si nécessaire + Redeploy** (3 min)
3. **Consulter logs Vercel pendant test** (1 min)
4. **Si échec persiste : rollback v4** (5 min)

---

## 📞 Rollback v4 (si nécessaire)

```bash
cd /home/user/devis-vocal

# 1. Restaurer assistant v4
grep -v "^OPENAI_ASSISTANT_ID=" .env.local > .env.local.tmp
echo "OPENAI_ASSISTANT_ID=asst_cxFeyG9ytDMSMlLIeC5SVa1A" >> .env.local.tmp
mv .env.local.tmp .env.local

# 2. Restaurer prompt v4
git show 2b78026:lib/openai/assistant.ts > lib/openai/assistant.ts

# 3. Build + commit
npm run build
git add -A
git commit -m "🔙 ROLLBACK v4 : assistant cassé, restauration version stable"
git push origin main

# 4. Mettre à jour Vercel
# → OPENAI_ASSISTANT_ID=asst_cxFeyG9ytDMSMlLIeC5SVa1A
# → Redeploy

# 5. Tester
# → "créer devis Dupont 30m² peinture 0650505050 Versailles"
# → Devrait fonctionner comme ce matin
```

---

**PRIORITÉ ABSOLUE** : Diagnostiquer avant toute autre modification. Ne pas créer v7 tant que v6 n'est pas fixé.
