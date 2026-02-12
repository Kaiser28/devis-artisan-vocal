-- ============================================
-- FIX : Ajouter TOUTES les colonnes manquantes dans table devis
-- Date: 2026-02-12
-- ============================================

ALTER TABLE devis 
ADD COLUMN IF NOT EXISTS artisan_raison_sociale TEXT,
ADD COLUMN IF NOT EXISTS artisan_siret TEXT,
ADD COLUMN IF NOT EXISTS artisan_adresse TEXT,
ADD COLUMN IF NOT EXISTS artisan_code_postal TEXT,
ADD COLUMN IF NOT EXISTS artisan_ville TEXT,
ADD COLUMN IF NOT EXISTS artisan_telephone TEXT,
ADD COLUMN IF NOT EXISTS artisan_email TEXT,
ADD COLUMN IF NOT EXISTS assurance_compagnie TEXT,
ADD COLUMN IF NOT EXISTS assurance_numero_police TEXT,
ADD COLUMN IF NOT EXISTS assurance_telephone TEXT,
ADD COLUMN IF NOT EXISTS conditions_paiement TEXT;

-- ============================================
-- FIN FIX
-- ============================================
