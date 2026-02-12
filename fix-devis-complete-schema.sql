-- ============================================
-- FIX COMPLET : Ajouter TOUTES les colonnes manquantes dans table devis
-- Date: 2026-02-12
-- ============================================

-- Colonnes client
ALTER TABLE devis 
ADD COLUMN IF NOT EXISTS client_nom TEXT,
ADD COLUMN IF NOT EXISTS client_prenom TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS client_telephone TEXT,
ADD COLUMN IF NOT EXISTS client_adresse TEXT,
ADD COLUMN IF NOT EXISTS client_code_postal TEXT,
ADD COLUMN IF NOT EXISTS client_ville TEXT;

-- Colonnes artisan
ALTER TABLE devis 
ADD COLUMN IF NOT EXISTS artisan_raison_sociale TEXT,
ADD COLUMN IF NOT EXISTS artisan_siret TEXT,
ADD COLUMN IF NOT EXISTS artisan_adresse TEXT,
ADD COLUMN IF NOT EXISTS artisan_code_postal TEXT,
ADD COLUMN IF NOT EXISTS artisan_ville TEXT,
ADD COLUMN IF NOT EXISTS artisan_telephone TEXT,
ADD COLUMN IF NOT EXISTS artisan_email TEXT;

-- Colonnes assurance
ALTER TABLE devis 
ADD COLUMN IF NOT EXISTS assurance_compagnie TEXT,
ADD COLUMN IF NOT EXISTS assurance_numero_police TEXT,
ADD COLUMN IF NOT EXISTS assurance_telephone TEXT;

-- Colonnes montants
ALTER TABLE devis 
ADD COLUMN IF NOT EXISTS total_ht NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tva_montant NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_ttc NUMERIC DEFAULT 0;

-- Colonnes conditions
ALTER TABLE devis 
ADD COLUMN IF NOT EXISTS conditions_paiement TEXT;

-- Colonnes statut et dates
ALTER TABLE devis 
ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'brouillon',
ADD COLUMN IF NOT EXISTS date_creation TIMESTAMPTZ DEFAULT NOW();

-- Colonnes numéro
ALTER TABLE devis 
ADD COLUMN IF NOT EXISTS numero TEXT;

-- Colonne lots (JSON)
ALTER TABLE devis 
ADD COLUMN IF NOT EXISTS lots JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- FIN FIX COMPLET
-- ============================================
