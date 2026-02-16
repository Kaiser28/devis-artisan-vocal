-- REQUÊTE 1 : LISTER TOUTES LES TABLES
-- Exécuter cette requête dans Supabase SQL Editor

SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
