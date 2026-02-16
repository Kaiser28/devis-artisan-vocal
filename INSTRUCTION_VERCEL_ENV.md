# ⚠️ ACTION CRITIQUE REQUISE : Configuration Vercel

## Problème actuel
L'assistant OpenAI v4 (ID: `asst_cxFeyG9ytDMSMlLIeC5SVa1A`) est créé et configuré localement mais **absent de Vercel**.

Vercel utilise donc l'ancien assistant v2/v3 qui possède le workflow bugué `check_duplicate_client` → boucle récursive → échec création client.

## Test reproduit
1. User : "créer devis Thomas Alain 06 50 50 50 50 Versailles"
2. Agent : recherche client "Thomas Alain" → 0 résultat
3. Agent : tentative `create_client()` → **ERREUR technique** (probablement appel `check_duplicate_client` récursif)

## Solution
### 1. Ajouter variable d'environnement Vercel
```
OPENAI_ASSISTANT_ID=asst_cxFeyG9ytDMSMlLIeC5SVa1A
```

**Procédure Vercel** :
1. Aller sur https://vercel.com/kaiser28s-projects/devis-artisan-vocal/settings/environment-variables
2. Cliquer **Add New**
3. **Name** : `OPENAI_ASSISTANT_ID`
4. **Value** : `asst_cxFeyG9ytDMSMlLIeC5SVa1A`
5. **Environment** : ✅ Production + ✅ Preview + ✅ Development
6. Cliquer **Save**

### 2. Redéployer l'application
1. Aller sur https://vercel.com/kaiser28s-projects/devis-artisan-vocal/deployments
2. Cliquer sur le dernier déploiement (commit `2b78026`)
3. Cliquer **⋯ (trois points)** → **Redeploy**
4. Attendre ≈2‑3 min

### 3. Tester après redéploiement
**URL** : https://devis-artisan-vocal-f2sf.vercel.app/chat

**Commande test** :
```
créer devis peinture intérieure 30m² pour Bertrand Dupont téléphone 06 50 50 50 50 Versailles 78000
```

**Comportement attendu** :
1. Agent recherche client "Dupont" → 0 résultat
2. Agent crée client directement : `create_client(nom="Dupont", prenom="Bertrand", telephone="0650505050", ville="Versailles", code_postal="78000")`
3. Agent recherche prix "peinture intérieure" → ex. 25 €/m² HT
4. Agent calcule HT 30×25 = 750 €, TVA 20% = 150 €, TTC = 900 €
5. Agent présente brouillon formaté complet
6. Agent attend validation unique : "✏️ Modifications ? ou ✅ Validé ?"
7. Réponse "validé" → `create_devis()` → "✅ Devis DEV-2026-00X créé (Brouillon)"

**Résultat espéré** : création client + devis en **2‑3 messages** (au lieu de 5‑8 avec l'ancien workflow)

## Différences assistant v4 vs v2/v3
| Aspect | v2/v3 (bugué) | v4 (corrigé) |
|--------|---------------|--------------|
| Workflow client | `check_duplicate_client` → récursif | `search_clients` → création directe |
| Paramètre `prenom` | obligatoire | optionnel (required: ['nom']) |
| Nombre messages | 5‑8 validations | 2‑3 validations |
| Gestion doublons | agent IA (bugué) | base de données (index unique) |

## Vérification post‑déploiement
1. Ouvrir https://vercel.com/kaiser28s-projects/devis-artisan-vocal/settings/environment-variables
2. Vérifier présence de `OPENAI_ASSISTANT_ID = asst_cxFeyG9ytDMSMlLIeC5SVa1A`
3. Tester création client + devis sur /chat
4. Si échec : vérifier logs Vercel → https://vercel.com/kaiser28s-projects/devis-artisan-vocal/logs

## Logs de diagnostic
Si le problème persiste après configuration Vercel, consulter les logs :
1. Aller sur https://vercel.com/kaiser28s-projects/devis-artisan-vocal/logs
2. Filtrer par `/api/chat`
3. Rechercher erreur `create_client` pour identifier la cause exacte

## Contact support
Si l'erreur persiste après ces étapes :
1. Partager screenshot logs Vercel `/api/chat`
2. Tester endpoint isolé : `curl -X POST https://devis-artisan-vocal-f2sf.vercel.app/api/test/create-client -H "Authorization: Bearer <token>" -d '{"nom":"Test","prenom":"User","telephone":"0600000000","ville":"Paris"}'`
