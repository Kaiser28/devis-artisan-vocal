-- REQUÊTE 2 : VÉRIFIER STRUCTURE user_settings
-- Exécuter cette requête dans Supabase SQL Editor

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_settings'
ORDER BY ordinal_position;
