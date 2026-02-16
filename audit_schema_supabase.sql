-- AUDIT COMPLET SCHÉMA SUPABASE
-- Date: 2026-02-16
-- Objectif: Vérifier cohérence entre code et base de données

-- ============================================
-- ÉTAPE 1 : VÉRIFIER TOUTES LES TABLES EXISTANTES
-- ============================================

-- Lister toutes les tables publiques
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- ÉTAPE 2 : VÉRIFIER STRUCTURE user_settings
-- ============================================

-- Colonnes existantes dans user_settings
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_settings'
ORDER BY ordinal_position;

-- ============================================
-- ÉTAPE 3 : VÉRIFIER STRUCTURE clients
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'clients'
ORDER BY ordinal_position;

-- ============================================
-- ÉTAPE 4 : VÉRIFIER STRUCTURE devis
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'devis'
ORDER BY ordinal_position;

-- ============================================
-- ÉTAPE 5 : VÉRIFIER STRUCTURE base_prix
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'base_prix'
ORDER BY ordinal_position;

-- ============================================
-- ÉTAPE 6 : VÉRIFIER STRUCTURE subscription_plans
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'subscription_plans'
ORDER BY ordinal_position;

-- ============================================
-- ÉTAPE 7 : VÉRIFIER STRUCTURE user_subscriptions
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- ============================================
-- ÉTAPE 8 : VÉRIFIER AI CHAT TABLES
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('ai_conversations', 'ai_messages', 'ai_actions')
ORDER BY table_name, ordinal_position;

-- ============================================
-- ÉTAPE 9 : VÉRIFIER RLS (Row Level Security)
-- ============================================

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- ÉTAPE 10 : VÉRIFIER POLICIES
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- ÉTAPE 11 : VÉRIFIER INDEXES
-- ============================================

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- ÉTAPE 12 : VÉRIFIER CONTRAINTES
-- ============================================

SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- ============================================
-- ÉTAPE 13 : COMPTER ENREGISTREMENTS PAR TABLE
-- ============================================

-- user_settings
SELECT 'user_settings' as table_name, COUNT(*) as count FROM user_settings
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'devis', COUNT(*) FROM devis
UNION ALL
SELECT 'base_prix', COUNT(*) FROM base_prix
UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM subscription_plans
UNION ALL
SELECT 'user_subscriptions', COUNT(*) FROM user_subscriptions
UNION ALL
SELECT 'ai_conversations', COUNT(*) FROM ai_conversations
UNION ALL
SELECT 'ai_messages', COUNT(*) FROM ai_messages
UNION ALL
SELECT 'ai_actions', COUNT(*) FROM ai_actions;

-- ============================================
-- DIAGNOSTICS SPÉCIFIQUES
-- ============================================

-- Vérifier si colonne 'data' existe quelque part (erreur mentionnée)
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'data'
ORDER BY table_name;

-- Vérifier triggers
SELECT 
  trigger_schema,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Vérifier fonctions personnalisées
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
