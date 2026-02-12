-- ============================================
-- FIX : Ajouter TOUTES les colonnes client manquantes dans table devis
-- Date: 2026-02-12
-- ============================================

ALTER TABLE devis 
ADD COLUMN IF NOT EXISTS client_code_postal TEXT,
ADD COLUMN IF NOT EXISTS client_ville TEXT,
ADD COLUMN IF NOT EXISTS client_adresse TEXT;

-- ============================================
-- FIN FIX
-- ============================================
