-- ============================================
-- FIX : Vérifier et créer colonne prix_unitaire_ht
-- Date: 2026-02-12
-- ============================================

-- Si la table base_prix existe mais sans la bonne colonne, on la renomme/crée
DO $$ 
BEGIN
  -- Vérifier si prix_unitaire existe (ancien nom possible)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'base_prix' AND column_name = 'prix_unitaire'
  ) THEN
    -- Renommer la colonne
    ALTER TABLE base_prix RENAME COLUMN prix_unitaire TO prix_unitaire_ht;
  END IF;

  -- Si ni prix_unitaire ni prix_unitaire_ht n'existent, créer la colonne
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'base_prix' AND column_name = 'prix_unitaire_ht'
  ) THEN
    ALTER TABLE base_prix ADD COLUMN prix_unitaire_ht NUMERIC NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Vérifier que toutes les colonnes essentielles existent
DO $$
BEGIN
  -- Colonne designation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'base_prix' AND column_name = 'designation'
  ) THEN
    ALTER TABLE base_prix ADD COLUMN designation TEXT NOT NULL;
  END IF;

  -- Colonne unite
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'base_prix' AND column_name = 'unite'
  ) THEN
    ALTER TABLE base_prix ADD COLUMN unite TEXT NOT NULL DEFAULT 'pièce';
  END IF;

  -- Colonne categorie
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'base_prix' AND column_name = 'categorie'
  ) THEN
    ALTER TABLE base_prix ADD COLUMN categorie TEXT;
  END IF;

  -- Colonne notes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'base_prix' AND column_name = 'notes'
  ) THEN
    ALTER TABLE base_prix ADD COLUMN notes TEXT;
  END IF;

  -- Colonne usage_count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'base_prix' AND column_name = 'usage_count'
  ) THEN
    ALTER TABLE base_prix ADD COLUMN usage_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- FIN FIX
-- ============================================
