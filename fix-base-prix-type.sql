-- ============================================
-- FIX : Colonne type dans base_prix
-- Date: 2026-02-12
-- ============================================

-- Option 1 : Rendre la colonne type nullable (recommandé)
ALTER TABLE base_prix ALTER COLUMN type DROP NOT NULL;

-- Option 2 : Ajouter une valeur par défaut
-- ALTER TABLE base_prix ALTER COLUMN type SET DEFAULT 'standard';

-- Si la colonne n'existe pas encore, la créer comme nullable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'base_prix' AND column_name = 'type'
  ) THEN
    ALTER TABLE base_prix ADD COLUMN type TEXT;
  ELSE
    -- Si elle existe déjà, la rendre nullable
    ALTER TABLE base_prix ALTER COLUMN type DROP NOT NULL;
  END IF;
END $$;

-- ============================================
-- FIN FIX
-- ============================================
