# 🔍 AUDIT COMPLET BASE DE DONNÉES - CLIC DEVIS

## ❌ Erreur détectée

```
Could not find the 'data' column of 'user_settings' in the schema cache
```

**Interprétation** : Message Supabase trompeur. Ne signifie PAS qu'une colonne `data` est manquante.

**Significations possibles** :
1. ❌ Table `user_settings` n'existe pas dans Supabase
2. ❌ Permissions RLS bloquent l'accès
3. ❌ Cache Supabase obsolète
4. ❌ Migration SQL jamais exécutée

---

## 📋 PLAN D'ACTION COMPLET

### Phase 1 : AUDIT (À faire MAINTENANT)

**Objectif** : Identifier TOUTES les tables manquantes ou mal configurées

**Étapes** :

#### 1️⃣ Connexion Supabase SQL Editor
```
https://supabase.com/dashboard/project/zfdcqnrsggbqgxsuwgxv/sql/new
```

#### 2️⃣ Exécuter requête audit (fichier créé : `audit_schema_supabase.sql`)

**Ouvrir le fichier et copier TOUTE la requête dans SQL Editor**

**Résultat attendu** : Liste complète de toutes les tables, colonnes, indexes, policies

---

### Phase 2 : DIAGNOSTIC

**Comparer résultats audit avec code** :

| Table | Code attend | État Supabase | Action |
|-------|-------------|---------------|--------|
| `user_settings` | 22 colonnes | ❓ À vérifier | Si manquante → Créer |
| `clients` | 11 colonnes | ❓ À vérifier | Si OK → RAS |
| `devis` | ~20 colonnes | ❓ À vérifier | Si colonnes manquent → ALTER |
| `base_prix` | ~10 colonnes | ❓ À vérifier | Si OK → RAS |
| `subscription_plans` | 5 colonnes | ❓ À vérifier | Si OK → RAS |
| `user_subscriptions` | 10 colonnes | ❓ À vérifier | Si OK → RAS |
| `ai_conversations` | 6 colonnes | ❓ À vérifier | Si manquante → Créer |
| `ai_messages` | 8 colonnes | ❓ À vérifier | Si manquante → Créer |
| `ai_actions` | 7 colonnes | ❓ À vérifier | Si manquante → Créer |

---

### Phase 3 : CORRECTION IMMÉDIATE (user_settings)

**Si `user_settings` manquante** :

#### Exécuter script correction (fichier créé : `fix_user_settings_schema.sql`)

**Contenu** :
1. Création table `user_settings` complète
2. Activation RLS
3. Création policies
4. Trigger `updated_at`
5. Vérifications post-création

**Exécution** :
```
1. Copier TOUT le contenu de fix_user_settings_schema.sql
2. Coller dans Supabase SQL Editor
3. Cliquer "Run"
4. Vérifier messages succès/erreur
```

---

### Phase 4 : MIGRATION COMPLÈTE

**Après correction user_settings**, exécuter migration complète :

#### Fichier : `supabase-migrations.sql`

**Contenu** :
- ✅ Table `user_settings` (déjà corrigée Phase 3)
- ✅ Table `clients`
- ✅ Enrichissement `base_prix`
- ✅ Enrichissement `devis`
- ✅ Fonction `generate_devis_numero()`
- ✅ Indexes optimisation
- ✅ RLS toutes tables

**Si tables AI Chat manquantes** :

#### Fichier : `migrations/0003_ai_chat_tables.sql`

```sql
-- Tables pour Chat IA
CREATE TABLE ai_conversations (...);
CREATE TABLE ai_messages (...);
CREATE TABLE ai_actions (...);
```

---

## 🔧 CORRECTIONS SPÉCIFIQUES PAR TABLE

### user_settings

**Problème détecté** : Erreur `data` column

**Solution** :
```sql
-- Exécuter fix_user_settings_schema.sql
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  raison_sociale TEXT,
  siret TEXT,
  -- ... (voir fichier complet)
);
```

**Test après correction** :
```sql
-- Dans Supabase SQL Editor
SELECT * FROM user_settings LIMIT 1;
-- Doit retourner : 0 rows (table vide OK) OU enregistrements existants
-- Ne doit PAS retourner : "relation user_settings does not exist"
```

---

### clients

**Vérification** :
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;
```

**Colonnes attendues** :
- `id`, `user_id`, `nom`, `prenom`, `email`, `telephone`
- `adresse`, `code_postal`, `ville`, `notes`
- `created_at`, `updated_at`

**Si colonne manquante** :
```sql
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS notes TEXT;
```

---

### devis

**Vérification** :
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'devis'
ORDER BY ordinal_position;
```

**Colonnes critiques** :
- `client_id` (UUID, référence clients)
- `remise_pourcentage`, `remise_montant`
- `acompte_pourcentage`, `acompte_montant`

**Si colonnes manquantes** :
```sql
ALTER TABLE devis
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id),
ADD COLUMN IF NOT EXISTS remise_pourcentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS remise_montant NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS acompte_pourcentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS acompte_montant NUMERIC DEFAULT 0;
```

---

### base_prix

**Vérification** :
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'base_prix'
ORDER BY ordinal_position;
```

**Colonnes enrichissement** :
- `source` (TEXT, manual/csv/auto)
- `tva_taux` (NUMERIC, défaut 20)
- `fournisseur` (TEXT)

**Si colonnes manquantes** :
```sql
ALTER TABLE base_prix
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS tva_taux NUMERIC DEFAULT 20,
ADD COLUMN IF NOT EXISTS fournisseur TEXT;
```

---

### Tables AI Chat

**Vérification** :
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('ai_conversations', 'ai_messages', 'ai_actions');
```

**Si 0 résultat** :
```sql
-- Exécuter migrations/0003_ai_chat_tables.sql
-- OU créer manuellement (voir fichier)
```

---

## 📊 CHECKLIST COMPLÈTE

### ✅ Tables principales

- [ ] `user_settings` : Existe, 22 colonnes, RLS activé
- [ ] `clients` : Existe, 11 colonnes, RLS activé
- [ ] `devis` : Existe, colonnes enrichissement, RLS activé
- [ ] `base_prix` : Existe, colonnes enrichissement, RLS activé
- [ ] `subscription_plans` : Existe, données prix 29,99€
- [ ] `user_subscriptions` : Existe, RLS activé

### ✅ Tables AI Chat (si fonctionnalité active)

- [ ] `ai_conversations` : Existe, RLS activé
- [ ] `ai_messages` : Existe, RLS activé
- [ ] `ai_actions` : Existe, RLS activé

### ✅ Indexes performance

- [ ] `idx_clients_user_id` : Existe
- [ ] `idx_clients_nom` : Existe
- [ ] `idx_devis_numero` : Existe
- [ ] `idx_devis_client_nom` : Existe
- [ ] `idx_base_prix_designation_trgm` : Existe (recherche texte)

### ✅ Fonctions & Triggers

- [ ] `update_updated_at_column()` : Existe
- [ ] `generate_devis_numero()` : Existe
- [ ] Triggers `updated_at` : Tous activés

### ✅ RLS Policies

- [ ] `user_settings` : 3 policies (SELECT, INSERT, UPDATE)
- [ ] `clients` : 4 policies (SELECT, INSERT, UPDATE, DELETE)
- [ ] `devis` : 4 policies
- [ ] `base_prix` : 4 policies

---

## 🚀 PROCÉDURE EXÉCUTION

### Étape 1 : AUDIT (5 min)

```
1. Ouvrir Supabase SQL Editor
2. Copier contenu audit_schema_supabase.sql
3. Exécuter
4. Noter résultats (tables existantes, colonnes manquantes)
```

### Étape 2 : CORRECTION user_settings (2 min)

```
1. Copier contenu fix_user_settings_schema.sql
2. Exécuter dans SQL Editor
3. Vérifier succès : SELECT * FROM user_settings LIMIT 1;
```

### Étape 3 : MIGRATION COMPLÈTE (5 min)

```
1. Copier contenu supabase-migrations.sql
2. Exécuter dans SQL Editor
3. Ignorer erreurs "already exists" (normal)
4. Vérifier erreurs critiques (aucune attendue)
```

### Étape 4 : AI CHAT (optionnel, 2 min)

```
Si fonctionnalité chat IA utilisée :
1. Copier migrations/0003_ai_chat_tables.sql
2. Exécuter
```

### Étape 5 : VÉRIFICATION (3 min)

```sql
-- Compter enregistrements toutes tables
SELECT 'user_settings' as table_name, COUNT(*) FROM user_settings
UNION ALL SELECT 'clients', COUNT(*) FROM clients
UNION ALL SELECT 'devis', COUNT(*) FROM devis
UNION ALL SELECT 'base_prix', COUNT(*) FROM base_prix;

-- Vérifier RLS activé
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Étape 6 : TEST API (2 min)

```
1. Rafraîchir cache Supabase (attendre 2-3 min)
2. Tester GET /api/settings
3. Tester PUT /api/settings (enregistrer paramètres)
4. Vérifier succès
```

---

## 📝 FICHIERS CRÉÉS

| Fichier | Objectif | Usage |
|---------|----------|-------|
| `audit_schema_supabase.sql` | Audit complet BDD | Exécuter en premier |
| `fix_user_settings_schema.sql` | Correction user_settings | Si erreur `data` column |
| `supabase-migrations.sql` | Migration complète | Tables + indexes + RLS |
| `migrations/0003_ai_chat_tables.sql` | Tables chat IA | Si fonctionnalité active |

---

## 🎯 ACTIONS IMMÉDIATES

### MAINTENANT (vous)

1. ✅ Ouvrir Supabase SQL Editor : https://supabase.com/dashboard/project/zfdcqnrsggbqgxsuwgxv/sql/new
2. ✅ Copier contenu `audit_schema_supabase.sql`
3. ✅ Exécuter et partager résultats

### APRÈS AUDIT (moi)

1. Analyser résultats audit
2. Identifier tables/colonnes manquantes
3. Préparer script correction sur-mesure
4. Guider exécution étape par étape

---

## ⚠️ NOTES IMPORTANTES

**Ne PAS supprimer tables existantes** sauf si explicitement demandé.

**Toutes les commandes utilisent `IF NOT EXISTS`** → Sécurité maximale, pas de perte données.

**Cache Supabase** : Attendre 2-3 min après exécution SQL avant test API.

**RLS critique** : Sans RLS, utilisateurs voient données autres utilisateurs → Faille sécurité.

---

**Commencez par l'audit. Partagez résultats. Je prépare corrections précises.**
