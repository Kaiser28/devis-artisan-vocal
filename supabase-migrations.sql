-- ============================================
-- MIGRATION 1 : Tables fondations
-- Date: 2026-02-12
-- ============================================

-- 1. Table user_settings (Paramètres artisan)
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Infos entreprise
  raison_sociale TEXT,
  siret TEXT,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  telephone TEXT,
  email TEXT,
  site_web TEXT,
  
  -- Logo
  logo_url TEXT,
  
  -- Assurance / Légal
  assurance_decennale_compagnie TEXT,
  assurance_decennale_numero TEXT,
  assurance_decennale_validite DATE,
  mentions_legales TEXT DEFAULT 'En cas de litige, les tribunaux français seront seuls compétents. Devis valable sous réserve d''acceptation.',
  
  -- Paramètres devis par défaut
  tva_defaut NUMERIC DEFAULT 20,
  conditions_paiement_defaut TEXT DEFAULT 'Acompte de 30% à la commande, solde à réception des travaux.',
  validite_devis_jours INTEGER DEFAULT 30,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pour user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. Table clients
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  nom TEXT NOT NULL,
  prenom TEXT,
  email TEXT,
  telephone TEXT,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Éviter doublons (même email pour même user)
  CONSTRAINT unique_user_email UNIQUE(user_id, email)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(user_id, nom);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(user_id, email);

-- RLS pour clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. Enrichir base_prix (colonnes supplémentaires)
-- ============================================
ALTER TABLE base_prix 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS tva_taux NUMERIC DEFAULT 20,
ADD COLUMN IF NOT EXISTS fournisseur TEXT;

COMMENT ON COLUMN base_prix.source IS 'Source: manual, csv, auto';

-- Index pour recherche texte (trigram)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_base_prix_designation_trgm 
ON base_prix USING gin (designation gin_trgm_ops);

-- ============================================
-- 4. Enrichir devis (colonnes supplémentaires)
-- ============================================
ALTER TABLE devis 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS remise_pourcentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS remise_montant NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS acompte_pourcentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS acompte_montant NUMERIC DEFAULT 0;

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_devis_numero ON devis(user_id, numero);
CREATE INDEX IF NOT EXISTS idx_devis_client_nom ON devis(user_id, client_nom);
CREATE INDEX IF NOT EXISTS idx_devis_date ON devis(user_id, date_creation DESC);
CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(user_id, statut);

-- ============================================
-- 5. Fonction pour générer numéro de devis auto
-- ============================================
CREATE OR REPLACE FUNCTION generate_devis_numero(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_count INTEGER;
  v_numero TEXT;
BEGIN
  -- Année en cours
  v_year := TO_CHAR(NOW(), 'YYYY');
  
  -- Compter devis de l'année
  SELECT COUNT(*) + 1 INTO v_count
  FROM devis
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM date_creation) = EXTRACT(YEAR FROM NOW());
  
  -- Format: DEV-YYYY-XXX
  v_numero := 'DEV-' || v_year || '-' || LPAD(v_count::TEXT, 3, '0');
  
  RETURN v_numero;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIN MIGRATION
-- ============================================
