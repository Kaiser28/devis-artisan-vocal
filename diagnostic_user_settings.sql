-- DIAGNOSTIC COMPLET user_settings
-- La table existe avec 20 colonnes (structure PARFAITE)
-- L'erreur "data column" est TROMPEUSE

-- ============================================
-- ÉTAPE 1 : VÉRIFIER RLS (Row Level Security)
-- ============================================

-- Vérifier si RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'user_settings';

-- Résultat attendu : rowsecurity = true
-- Si false → Problème identifié

-- ============================================
-- ÉTAPE 2 : VÉRIFIER POLICIES
-- ============================================

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_settings'
ORDER BY policyname;

-- Résultat attendu : 3 policies
-- - Users can view own settings (SELECT)
-- - Users can insert own settings (INSERT)  
-- - Users can update own settings (UPDATE)

-- ============================================
-- ÉTAPE 3 : TESTER LECTURE DIRECTE
-- ============================================

-- Test 1 : Compter enregistrements
SELECT COUNT(*) as total_settings FROM user_settings;

-- Test 2 : Lister tous settings (si peu d'utilisateurs)
SELECT 
  id,
  user_id,
  raison_sociale,
  ville,
  created_at
FROM user_settings
LIMIT 5;

-- ============================================
-- ÉTAPE 4 : TESTER AVEC VOTRE USER_ID
-- ============================================

-- Récupérer votre user_id
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE email = 'test@sferia.fr'  -- Remplacer par votre email
LIMIT 1;

-- Puis tester lecture settings avec ce user_id
-- SELECT * FROM user_settings WHERE user_id = 'VOTRE_USER_ID_ICI';

-- ============================================
-- ÉTAPE 5 : SI RLS BLOQUE, TESTER SANS RLS
-- ============================================

-- TEMPORAIREMENT désactiver RLS pour test
-- ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Tester lecture
-- SELECT * FROM user_settings LIMIT 1;

-- IMMÉDIATEMENT réactiver RLS après test
-- ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ⚠️ NE PAS LAISSER RLS DÉSACTIVÉ EN PRODUCTION

-- ============================================
-- ÉTAPE 6 : VÉRIFIER TRIGGER updated_at
-- ============================================

SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'user_settings'
ORDER BY trigger_name;

-- Résultat attendu : update_user_settings_updated_at

-- ============================================
-- DIAGNOSTIC FINAL
-- ============================================

-- Si TOUTES ces vérifications passent :
-- → Problème = Cache Supabase OU format réponse API

-- Solutions possibles :
-- 1. Attendre 5 min (cache Supabase expire)
-- 2. Redémarrer serveur Next.js (npm run build)
-- 3. Vérifier format réponse API (doit être {data: settings})
