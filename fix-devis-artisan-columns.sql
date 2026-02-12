-- ============================================
-- FIX : Ajouter colonnes artisan manquantes dans table devis
-- Date: 2026-02-12
-- ============================================

ALTER TABLE devis 
ADD COLUMN IF NOT EXISTS artisan_code_postal TEXT,
ADD COLUMN IF NOT EXISTS artisan_ville TEXT,
ADD COLUMN IF NOT EXISTS artisan_telephone TEXT,
ADD COLUMN IF NOT EXISTS artisan_email TEXT;

-- ============================================
-- FIN FIX
-- ============================================
