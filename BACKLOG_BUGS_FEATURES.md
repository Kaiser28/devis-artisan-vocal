# 📋 BACKLOG BUGS & FEATURES - Devis Artisan Vocal

**Date mise à jour** : 2026-02-16 14:00  
**Version actuelle** : v4 (rollback stable)

---

## 🔴 BUGS PRIORITAIRES (à corriger avant nouvelles features)

### **1. Barre de recherche clients ne fonctionne pas** 🔍
**Statut** : ⏳ Pending  
**Priorité** : 🔴 Haute  
**ID** : `bug_search1`

**Description** :
- Lors de la création d'un devis (`/devis/nouveau`), la barre de recherche clients ne trouve pas les clients existants
- User tape nom/prénom → aucun résultat affiché
- Impossible de sélectionner un client existant avant de créer un devis

**Impact** :
- Force à recréer des clients en doublon
- UX dégradée : utilisateur doit vérifier manuellement dans `/clients` avant de créer devis

**Composant concerné** :
- `app/devis/nouveau/components/AutocompleteClient.tsx`
- API : `/api/clients/search` (ligne 98)

**Actions de diagnostic** :
1. Tester `/api/clients/search?q=Dupont` directement (curl ou navigateur)
2. Vérifier résultat : `{ clients: [...] }` ou `{ data: [...] }` ou `[]` ?
3. Vérifier console navigateur : erreurs JavaScript ?
4. Vérifier console DevTools Network : requête envoyée ? Status 200/400/500 ?

**Hypothèses** :
- Format de réponse API incorrect (cf. commit `4a5d892` - déjà corrigé ?)
- Debounce trop court (300ms ligne 54 `AutocompleteClient.tsx`)
- Politique RLS Supabase bloque requête `SELECT`
- Champ recherche vide dans requête API

**Référence commits** :
- Commit `4a5d892` : correctif autocomplete clients (`.data` → `.clients`)
- À vérifier si appliqué aussi à `/devis/nouveau`

---

### **2. Devis vocal : fonctionnalité incomplète ou à supprimer** 🎙️
**Statut** : ⏳ Pending  
**Priorité** : 🟡 Moyenne  
**ID** : `bug_vocal1`

**Description** :
- Page `/devis/vocal` existe mais ne fonctionne pas correctement
- User clique sur "Devis vocal" dans navigation → page affichée mais fonctionnalité incomplète

**Options** :
1. **Option A** : Supprimer la page et le lien de navigation
   - Retirer `app/devis/vocal/page.tsx`
   - Retirer lien dans navigation principale
   - Gain : simplifie l'interface, évite confusion utilisateur

2. **Option B** : Faire fonctionner correctement
   - Déboguer reconnaissance vocale
   - Améliorer timeout micro (déjà fait : commit `4a5d892` - `maxSpeechPauseDuration: 3000ms`)
   - Tester avec différents navigateurs (Chrome, Firefox, Safari)
   - Ajouter fallback si micro non disponible

**Composant concerné** :
- `app/devis/vocal/page.tsx` (lignes 52-57 : config reconnaissance vocale)

**Décision requise** : User doit choisir Option A ou B avant implémentation.

---

## 🟢 FEATURES DEMANDÉES (après correction bugs)

### **3. Ajouter reconnaissance vocale dans Base de Prix** 🎙️
**Statut** : ⏳ Pending  
**Priorité** : 🟡 Moyenne  
**ID** : `feature_vocal1`

**Description** :
- Page `/base-prix` permet saisie manuelle des prix
- User demande ajout reconnaissance vocale (comme `/devis/vocal`)
- Permettre dictée : "Peinture acrylique, 25 euros le mètre carré, TVA 20%"

**Bénéfices** :
- Accélère saisie catalogue prix (10x plus rapide que clavier)
- UX cohérente avec `/devis/vocal`
- Réduit erreurs de frappe

**Implémentation** :
1. Réutiliser composant reconnaissance vocale de `/devis/vocal`
2. Parser phrases dictées → extraire `designation`, `prix_unitaire_ht`, `unite`, `tva_taux`
3. Remplir formulaire automatiquement
4. Validation user avant sauvegarde

**Composants concernés** :
- `app/base-prix/nouveau/page.tsx` (formulaire ajout prix)
- `app/devis/vocal/page.tsx` (composant vocal à réutiliser)

**Complexité estimée** : 🟡 Moyenne (2-4h)

**Prérequis** :
- Bug #2 (devis vocal) doit être résolu d'abord (Option B choisie)
- Si Option A choisie → Feature #3 annulée

---

## 🔧 MAINTENANCE EN COURS

### **4. Configuration Vercel assistant v4** ⏳
**Statut** : ⏳ Pending (action manuelle requise)  
**Priorité** : 🔴 Haute  
**ID** : `vercel2`

**Action requise** :
1. Mettre à jour `OPENAI_ASSISTANT_ID=asst_cxFeyG9ytDMSMlLIeC5SVa1A` sur Vercel
2. Redéployer
3. Tester création client

**Voir** : `GUIDE_RESTAURATION_VERCEL_V4.md`

---

### **5. Diagnostic bug v5/v6** 🔍
**Statut** : ⏳ Pending (après restauration v4)  
**Priorité** : 🔴 Haute  
**ID** : `diag1`

**Objectif** : Comprendre pourquoi v5/v6 casse création client

**Actions** :
1. Consulter logs Vercel `/api/chat` pendant test utilisateur
2. Comparer args transmis v4 (OK) vs v6 (KO)
3. Identifier modification qui casse transmission paramètres

**Voir** : `URGENT_BUG_CREATION_CLIENT.md`

---

## 📊 PRIORITÉS GLOBALES

### **Phase 1 : Restauration service (URGENT)** 🔴
1. ✅ Rollback code v4 (commit `f638870`) - **FAIT**
2. ⏳ Configuration Vercel assistant v4 - **EN ATTENTE USER**
3. ⏳ Test création client post-restauration

### **Phase 2 : Corrections bugs critiques** 🔴
1. ⏳ Corriger barre recherche clients (`bug_search1`)
2. ⏳ Décision devis vocal : supprimer ou corriger (`bug_vocal1`)

### **Phase 3 : Diagnostic & amélioration** 🟡
1. ⏳ Diagnostic bug v5/v6 (`diag1`)
2. ⏳ Créer v7 avec correctifs ciblés (si diagnostic réussi)

### **Phase 4 : Nouvelles features** 🟢
1. ⏳ Reconnaissance vocale base prix (`feature_vocal1`) - si `bug_vocal1` résolu
2. ⏳ Autres améliorations UX (logs transparents, retry auto, etc.)

---

## 🚫 FEATURES REPORTÉES (ne pas implémenter maintenant)

- ❌ Amélioration communication agent (logs transparents) → a cassé v6
- ❌ Affichage infos entreprise brouillon enrichi → a cassé v6
- ❌ Validation champs obligatoires stricte → a cassé v6

**Raison** : À ré-implémenter de manière incrémentale après diagnostic v6 complet.

---

## 📝 NOTES DÉVELOPPEMENT

### **Règles de déploiement strictes**
1. ✅ **Une modification à la fois** (pas de multi-commits sans test)
2. ✅ **Test local** avant commit (`npm run build` + test manuel)
3. ✅ **Test Vercel** après déploiement (attendre 3 min, tester feature)
4. ✅ **Rollback immédiat** si régression détectée
5. ✅ **Documentation** de chaque bug/correctif

### **Fichiers de référence**
- `SUCCES_WORKFLOW_V4.md` - Pourquoi v4 fonctionne (à ne jamais casser)
- `URGENT_BUG_CREATION_CLIENT.md` - Diagnostic bug v6
- `GUIDE_RESTAURATION_VERCEL_V4.md` - Procédure restauration

### **Branches Git recommandées**
- `main` - Version stable (actuellement v4)
- `feature/vocal-base-prix` - Feature #3 (si approuvée)
- `bugfix/search-clients` - Bug #1
- `experimental/v7` - Tests correctifs v6 (à créer après diagnostic)

---

**Dernière mise à jour** : 2026-02-16 14:00  
**Responsable** : Directeur Sferia  
**Status global** : 🟡 Service partiellement dégradé (restauration v4 en cours)
