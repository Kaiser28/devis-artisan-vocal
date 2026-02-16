-- CORRECTION SCHÉMA user_settings
-- Date: 2026-02-16
-- Problème: Erreur "Could not find the 'data' column of 'user_settings'"
-- Cause probable: Schéma user_settings incomplet ou manquant

-- ============================================
-- SOLUTION 1 : RECRÉER TABLE user_settings COMPLÈTE
-- ============================================

-- Supprimer table existante (si besoin de repartir à zéro)
-- DROP TABLE IF EXISTS user_settings CASCADE;

-- Créer table user_settings avec TOUTES les colonnes
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Infos entreprise
  raison_sociale TEXT,
  siret TEXT,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  telephone TEXT,
  email TEXT,
  site_web TEXT,
  
  -- Logo
  logo_url TEXT,
  
  -- Assurance / Légal
  assurance_decennale_compagnie TEXT,
  assurance_decennale_numero TEXT,
  assurance_decennale_validite DATE,
  mentions_legales TEXT DEFAULT 'En cas de litige, les tribunaux français seront seuls compétents. Devis valable sous réserve d''acceptation.',
  
  -- Paramètres devis par défaut
  tva_defaut NUMERIC DEFAULT 20,
  conditions_paiement_defaut TEXT DEFAULT 'Acompte de 30% à la commande, solde à réception des travaux.',
  validite_devis_jours INTEGER DEFAULT 30,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- ============================================
-- SOLUTION 2 : RLS (Row Level Security)
-- ============================================

-- Activer RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes policies (si existantes)
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

-- Recréer policies
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- SOLUTION 3 : TRIGGER updated_at
-- ============================================

-- Fonction trigger (si pas déjà créée)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer ancien trigger (si existant)
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;

-- Recréer trigger
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VÉRIFICATION POST-CORRECTION
-- ============================================

-- Vérifier colonnes créées
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_settings'
ORDER BY ordinal_position;

-- Vérifier RLS activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'user_settings';

-- Vérifier policies
SELECT 
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_settings';

-- Compter enregistrements
SELECT COUNT(*) as total_settings FROM user_settings;

-- ============================================
-- TEST INSERTION
-- ============================================

-- Tester insertion (remplacer USER_ID par un vrai UUID d'utilisateur)
/*
INSERT INTO user_settings (
  user_id,
  raison_sociale,
  siret,
  ville,
  telephone,
  email
) VALUES (
  'YOUR_USER_ID_HERE',
  'Test Entreprise',
  '12345678901234',
  'Paris',
  '0612345678',
  'test@example.com'
) ON CONFLICT (user_id) DO UPDATE SET
  raison_sociale = EXCLUDED.raison_sociale,
  updated_at = NOW();
*/

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

/*
ERREUR COURANTE : "Could not find the 'data' column"

Cette erreur Supabase signifie généralement :
1. La table n'existe pas dans la base de données
2. Le nom de la table est incorrect (typo)
3. Les permissions RLS bloquent l'accès
4. Le cache Supabase est obsolète

SOLUTIONS :
1. Exécuter ce script dans Supabase SQL Editor
2. Rafraîchir le cache Supabase (attendre 2-3 min)
3. Vérifier logs Supabase pour erreurs détaillées
4. Tester requête directe dans SQL Editor avant API

VÉRIFICATION :
1. Table créée : SELECT * FROM user_settings LIMIT 1;
2. RLS activé : Voir pg_tables
3. Policies OK : Voir pg_policies
4. API fonctionne : Test GET /api/settings
*/
