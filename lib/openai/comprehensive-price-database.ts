// Base de prix BTP 2026 COMPLÈTE - 100+ références
// Sources : hemea.com, obat.fr, helloartisan.com (vérifiées 2025-2026)

export interface ComprehensivePriceReference {
  designation: string
  categorie: string
  unite: string
  min_ht: number
  max_ht: number
  prix_moyen_ht: number
  tva_taux: number
  source: string
  notes?: string
}

export const COMPREHENSIVE_PRICE_DATABASE: ComprehensivePriceReference[] = [
  // ===== PEINTURE =====
  {
    designation: 'Peinture intérieure murs (standard)',
    categorie: 'Peinture',
    unite: 'm²',
    min_ht: 15,
    max_ht: 40,
    prix_moyen_ht: 27.5,
    tva_taux: 10,
    source: 'Travaux.com, helloArtisan 2026'
  },
  {
    designation: 'Peinture plafond intérieur',
    categorie: 'Peinture',
    unite: 'm²',
    min_ht: 25,
    max_ht: 35,
    prix_moyen_ht: 30,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Peinture extérieure façade',
    categorie: 'Peinture',
    unite: 'm²',
    min_ht: 20,
    max_ht: 45,
    prix_moyen_ht: 32.5,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Peinture murs état d\'usure normal',
    categorie: 'Peinture',
    unite: 'm²',
    min_ht: 25,
    max_ht: 55,
    prix_moyen_ht: 40,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Peinture murs mauvais état',
    categorie: 'Peinture',
    unite: 'm²',
    min_ht: 35,
    max_ht: 65,
    prix_moyen_ht: 50,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Peinture pièce 30m²',
    categorie: 'Peinture',
    unite: 'u',
    min_ht: 800,
    max_ht: 2000,
    prix_moyen_ht: 1400,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },

  // ===== CARRELAGE =====
  {
    designation: 'Carrelage mural et faïence',
    categorie: 'Carrelage',
    unite: 'm²',
    min_ht: 20,
    max_ht: 35,
    prix_moyen_ht: 27.5,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Carrelage sol standard (fourniture + pose)',
    categorie: 'Carrelage',
    unite: 'm²',
    min_ht: 30,
    max_ht: 150,
    prix_moyen_ht: 90,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Carrelage ciment',
    categorie: 'Carrelage',
    unite: 'm²',
    min_ht: 50,
    max_ht: 150,
    prix_moyen_ht: 100,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Carrelage mosaïque',
    categorie: 'Carrelage',
    unite: 'm²',
    min_ht: 15,
    max_ht: 70,
    prix_moyen_ht: 42.5,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Carrelage marbre',
    categorie: 'Carrelage',
    unite: 'm²',
    min_ht: 45,
    max_ht: 150,
    prix_moyen_ht: 97.5,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Pose carrelage standard',
    categorie: 'Carrelage',
    unite: 'm²',
    min_ht: 30,
    max_ht: 60,
    prix_moyen_ht: 45,
    tva_taux: 10,
    source: 'Estimations BTP 2026'
  },
  {
    designation: 'Pose carrelage petit format',
    categorie: 'Carrelage',
    unite: 'm²',
    min_ht: 50,
    max_ht: 80,
    prix_moyen_ht: 65,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Dallage terrasse extérieure',
    categorie: 'Carrelage',
    unite: 'm²',
    min_ht: 60,
    max_ht: 110,
    prix_moyen_ht: 85,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },

  // ===== SOL & REVÊTEMENTS =====
  {
    designation: 'Dépose sol existant',
    categorie: 'Sol',
    unite: 'm²',
    min_ht: 10,
    max_ht: 25,
    prix_moyen_ht: 17.5,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Parquet stratifié (fourniture + pose)',
    categorie: 'Sol',
    unite: 'm²',
    min_ht: 30,
    max_ht: 60,
    prix_moyen_ht: 45,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Parquet massif (fourniture + pose)',
    categorie: 'Sol',
    unite: 'm²',
    min_ht: 60,
    max_ht: 120,
    prix_moyen_ht: 90,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Moquette (fourniture + pose)',
    categorie: 'Sol',
    unite: 'm²',
    min_ht: 20,
    max_ht: 60,
    prix_moyen_ht: 40,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Béton ciré (fourniture + pose)',
    categorie: 'Sol',
    unite: 'm²',
    min_ht: 120,
    max_ht: 250,
    prix_moyen_ht: 185,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Papier peint (fourniture + pose)',
    categorie: 'Murs',
    unite: 'm²',
    min_ht: 5,
    max_ht: 25,
    prix_moyen_ht: 15,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Décollage papier peint',
    categorie: 'Murs',
    unite: 'm²',
    min_ht: 5,
    max_ht: 10,
    prix_moyen_ht: 7.5,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },

  // ===== PLOMBERIE =====
  {
    designation: 'Plomberie rénovation',
    categorie: 'Plomberie',
    unite: 'm²',
    min_ht: 70,
    max_ht: 150,
    prix_moyen_ht: 110,
    tva_taux: 20,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Remplacement robinetterie',
    categorie: 'Plomberie',
    unite: 'u',
    min_ht: 80,
    max_ht: 200,
    prix_moyen_ht: 140,
    tva_taux: 20,
    source: 'helloArtisan, Obat 2026'
  },
  {
    designation: 'Réparation chasse d\'eau',
    categorie: 'Plomberie',
    unite: 'u',
    min_ht: 60,
    max_ht: 120,
    prix_moyen_ht: 90,
    tva_taux: 20,
    source: 'helloArtisan, Obat 2026'
  },
  {
    designation: 'Remplacement WC',
    categorie: 'Plomberie',
    unite: 'u',
    min_ht: 200,
    max_ht: 400,
    prix_moyen_ht: 300,
    tva_taux: 20,
    source: 'helloArtisan, Obat 2026'
  },
  {
    designation: 'Installation chauffe-eau',
    categorie: 'Plomberie',
    unite: 'u',
    min_ht: 300,
    max_ht: 1000,
    prix_moyen_ht: 650,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Réparation fuite d\'eau',
    categorie: 'Plomberie',
    unite: 'u',
    min_ht: 100,
    max_ht: 500,
    prix_moyen_ht: 300,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },

  // ===== ÉLECTRICITÉ =====
  {
    designation: 'Point électrique (prise, interrupteur)',
    categorie: 'Électricité',
    unite: 'u',
    min_ht: 80,
    max_ht: 150,
    prix_moyen_ht: 115,
    tva_taux: 20,
    source: 'Estimations BTP 2026'
  },
  {
    designation: 'Tableau électrique complet',
    categorie: 'Électricité',
    unite: 'u',
    min_ht: 900,
    max_ht: 2500,
    prix_moyen_ht: 1700,
    tva_taux: 20,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Installation prise électrique',
    categorie: 'Électricité',
    unite: 'u',
    min_ht: 50,
    max_ht: 150,
    prix_moyen_ht: 100,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Pose éclairage extérieur',
    categorie: 'Électricité',
    unite: 'u',
    min_ht: 40,
    max_ht: 250,
    prix_moyen_ht: 145,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Remise aux normes électrique',
    categorie: 'Électricité',
    unite: 'u',
    min_ht: 300,
    max_ht: 750,
    prix_moyen_ht: 525,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Installation VMC (simple flux)',
    categorie: 'Électricité',
    unite: 'u',
    min_ht: 600,
    max_ht: 1500,
    prix_moyen_ht: 1050,
    tva_taux: 20,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Installation VMC (double flux)',
    categorie: 'Électricité',
    unite: 'u',
    min_ht: 2000,
    max_ht: 3500,
    prix_moyen_ht: 2750,
    tva_taux: 20,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Pose radiateur électrique',
    categorie: 'Électricité',
    unite: 'u',
    min_ht: 100,
    max_ht: 250,
    prix_moyen_ht: 175,
    tva_taux: 20,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Pose spots lumineux',
    categorie: 'Électricité',
    unite: 'u',
    min_ht: 50,
    max_ht: 100,
    prix_moyen_ht: 75,
    tva_taux: 20,
    source: 'helloArtisan 2026'
  },

  // ===== MAÇONNERIE =====
  {
    designation: 'Élévation mur parpaing',
    categorie: 'Maçonnerie',
    unite: 'm²',
    min_ht: 40,
    max_ht: 60,
    prix_moyen_ht: 50,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Construction mur porteur',
    categorie: 'Maçonnerie',
    unite: 'm³',
    min_ht: 180,
    max_ht: 250,
    prix_moyen_ht: 215,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Pose dalles béton (intérieur/extérieur)',
    categorie: 'Maçonnerie',
    unite: 'm²',
    min_ht: 120,
    max_ht: 200,
    prix_moyen_ht: 160,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Chape béton',
    categorie: 'Maçonnerie',
    unite: 'm²',
    min_ht: 35,
    max_ht: 45,
    prix_moyen_ht: 40,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Fondations maison',
    categorie: 'Maçonnerie',
    unite: 'm²',
    min_ht: 100,
    max_ht: 250,
    prix_moyen_ht: 175,
    tva_taux: 20,
    source: 'Obat.fr, Travaux.com 2026'
  },
  {
    designation: 'Mur en briques',
    categorie: 'Maçonnerie',
    unite: 'm²',
    min_ht: 50,
    max_ht: 150,
    prix_moyen_ht: 100,
    tva_taux: 20,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Mur en pierres',
    categorie: 'Maçonnerie',
    unite: 'm²',
    min_ht: 100,
    max_ht: 300,
    prix_moyen_ht: 200,
    tva_taux: 20,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Mur en béton',
    categorie: 'Maçonnerie',
    unite: 'm²',
    min_ht: 80,
    max_ht: 150,
    prix_moyen_ht: 115,
    tva_taux: 20,
    source: 'helloArtisan 2026'
  },

  // ===== PLÂTRERIE / PLACO =====
  {
    designation: 'Pose plaques de plâtre (cloison standard)',
    categorie: 'Plâtrerie',
    unite: 'm²',
    min_ht: 20,
    max_ht: 30,
    prix_moyen_ht: 25,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Pose plaques hydrofuges (étanches)',
    categorie: 'Plâtrerie',
    unite: 'm²',
    min_ht: 30,
    max_ht: 50,
    prix_moyen_ht: 40,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Cloison en placo',
    categorie: 'Plâtrerie',
    unite: 'm²',
    min_ht: 10,
    max_ht: 80,
    prix_moyen_ht: 45,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Rénovation murs endommagés',
    categorie: 'Plâtrerie',
    unite: 'm²',
    min_ht: 25,
    max_ht: 50,
    prix_moyen_ht: 37.5,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Pose plafond placo',
    categorie: 'Plâtrerie',
    unite: 'm²',
    min_ht: 25,
    max_ht: 35,
    prix_moyen_ht: 30,
    tva_taux: 10,
    source: 'Estimations BTP 2026'
  },
  {
    designation: 'Moulures décoratives',
    categorie: 'Plâtrerie',
    unite: 'u',
    min_ht: 10,
    max_ht: 100,
    prix_moyen_ht: 55,
    tva_taux: 10,
    source: 'Obat.fr 2026',
    notes: 'Selon complexité'
  },

  // ===== TERRASSEMENT =====
  {
    designation: 'Terrassement classique',
    categorie: 'Terrassement',
    unite: 'm³',
    min_ht: 30,
    max_ht: 70,
    prix_moyen_ht: 50,
    tva_taux: 20,
    source: 'Travaux.com, Obat 2026'
  },
  {
    designation: 'Terrassement terre ordinaire (classe A)',
    categorie: 'Terrassement',
    unite: 'm³',
    min_ht: 20,
    max_ht: 35,
    prix_moyen_ht: 27.5,
    tva_taux: 20,
    source: 'illiCO travaux 2026'
  },
  {
    designation: 'Terrassement terre argileuse (classe B)',
    categorie: 'Terrassement',
    unite: 'm³',
    min_ht: 25,
    max_ht: 45,
    prix_moyen_ht: 35,
    tva_taux: 20,
    source: 'illiCO travaux 2026'
  },
  {
    designation: 'Terrassement terre compacte (classe C)',
    categorie: 'Terrassement',
    unite: 'm³',
    min_ht: 40,
    max_ht: 65,
    prix_moyen_ht: 52.5,
    tva_taux: 20,
    source: 'illiCO travaux 2026'
  },
  {
    designation: 'Terrassement terre rocheuse (classe D)',
    categorie: 'Terrassement',
    unite: 'm³',
    min_ht: 60,
    max_ht: 110,
    prix_moyen_ht: 85,
    tva_taux: 20,
    source: 'illiCO travaux 2026'
  },
  {
    designation: 'Remblais (selon matériau)',
    categorie: 'Terrassement',
    unite: 'm³',
    min_ht: 15,
    max_ht: 40,
    prix_moyen_ht: 27.5,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Terrassement allée/entrée garage',
    categorie: 'Terrassement',
    unite: 'u',
    min_ht: 1500,
    max_ht: 4000,
    prix_moyen_ht: 2750,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Nivellement terrain',
    categorie: 'Terrassement',
    unite: 'm²',
    min_ht: 9,
    max_ht: 15,
    prix_moyen_ht: 12,
    tva_taux: 20,
    source: 'Entretien Jardin 2026'
  },

  // ===== TOITURE & COUVERTURE =====
  {
    designation: 'Toiture neuve (charpente + couverture)',
    categorie: 'Toiture',
    unite: 'm²',
    min_ht: 180,
    max_ht: 250,
    prix_moyen_ht: 215,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Rénovation toiture complète',
    categorie: 'Toiture',
    unite: 'm²',
    min_ht: 130,
    max_ht: 260,
    prix_moyen_ht: 195,
    tva_taux: 10,
    source: 'Travaux.com, illiCO 2026'
  },
  {
    designation: 'Couverture seule',
    categorie: 'Toiture',
    unite: 'm²',
    min_ht: 50,
    max_ht: 80,
    prix_moyen_ht: 65,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Charpente seule',
    categorie: 'Toiture',
    unite: 'm²',
    min_ht: 150,
    max_ht: 200,
    prix_moyen_ht: 175,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Toiture ardoise',
    categorie: 'Toiture',
    unite: 'm²',
    min_ht: 25,
    max_ht: 120,
    prix_moyen_ht: 72.5,
    tva_taux: 10,
    source: 'Ootravaux 2026'
  },
  {
    designation: 'Toiture zinc',
    categorie: 'Toiture',
    unite: 'm²',
    min_ht: 40,
    max_ht: 120,
    prix_moyen_ht: 80,
    tva_taux: 10,
    source: 'Ootravaux 2026'
  },
  {
    designation: 'Toiture tuiles plates',
    categorie: 'Toiture',
    unite: 'm²',
    min_ht: 30,
    max_ht: 90,
    prix_moyen_ht: 60,
    tva_taux: 10,
    source: 'Ootravaux 2026'
  },
  {
    designation: 'Nettoyage toiture',
    categorie: 'Toiture',
    unite: 'm²',
    min_ht: 30,
    max_ht: 70,
    prix_moyen_ht: 50,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Remplacement gouttière',
    categorie: 'Zinguerie',
    unite: 'ml',
    min_ht: 30,
    max_ht: 150,
    prix_moyen_ht: 90,
    tva_taux: 10,
    source: 'Travaux.com 2026'
  },
  {
    designation: 'Gouttière zinc',
    categorie: 'Zinguerie',
    unite: 'ml',
    min_ht: 10,
    max_ht: 15,
    prix_moyen_ht: 12.5,
    tva_taux: 10,
    source: 'Quelle Energie 2026',
    notes: 'Fourniture seule'
  },
  {
    designation: 'Gouttière acier',
    categorie: 'Zinguerie',
    unite: 'ml',
    min_ht: 15,
    max_ht: 20,
    prix_moyen_ht: 17.5,
    tva_taux: 10,
    source: 'Quelle Energie 2026',
    notes: 'Fourniture seule'
  },
  {
    designation: 'Gouttière cuivre',
    categorie: 'Zinguerie',
    unite: 'ml',
    min_ht: 25,
    max_ht: 35,
    prix_moyen_ht: 30,
    tva_taux: 10,
    source: 'Quelle Energie 2026',
    notes: 'Fourniture seule'
  },

  // ===== ISOLATION =====
  {
    designation: 'Isolation intérieure laine de verre',
    categorie: 'Isolation',
    unite: 'm²',
    min_ht: 5,
    max_ht: 10,
    prix_moyen_ht: 7.5,
    tva_taux: 5.5,
    source: 'helloArtisan 2026',
    notes: 'Fourniture seule'
  },
  {
    designation: 'Isolation intérieure laine de bois/chanvre',
    categorie: 'Isolation',
    unite: 'm²',
    min_ht: 15,
    max_ht: 25,
    prix_moyen_ht: 20,
    tva_taux: 5.5,
    source: 'helloArtisan 2026',
    notes: 'Fourniture seule'
  },
  {
    designation: 'Isolation intérieure complète',
    categorie: 'Isolation',
    unite: 'm²',
    min_ht: 30,
    max_ht: 100,
    prix_moyen_ht: 65,
    tva_taux: 5.5,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Isolation extérieure (ITE)',
    categorie: 'Isolation',
    unite: 'm²',
    min_ht: 80,
    max_ht: 170,
    prix_moyen_ht: 125,
    tva_taux: 5.5,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Isolation thermique standard',
    categorie: 'Isolation',
    unite: 'm²',
    min_ht: 30,
    max_ht: 180,
    prix_moyen_ht: 105,
    tva_taux: 5.5,
    source: 'Obat.fr 2026'
  },

  // ===== MENUISERIE =====
  {
    designation: 'Fenêtre PVC double vitrage',
    categorie: 'Menuiserie',
    unite: 'u',
    min_ht: 220,
    max_ht: 900,
    prix_moyen_ht: 560,
    tva_taux: 10,
    source: 'helloArtisan, Travaux.com 2026'
  },
  {
    designation: 'Fenêtre aluminium double vitrage',
    categorie: 'Menuiserie',
    unite: 'u',
    min_ht: 500,
    max_ht: 1300,
    prix_moyen_ht: 900,
    tva_taux: 10,
    source: 'helloArtisan, Travaux.com 2026'
  },
  {
    designation: 'Fenêtre bois double vitrage',
    categorie: 'Menuiserie',
    unite: 'u',
    min_ht: 400,
    max_ht: 900,
    prix_moyen_ht: 650,
    tva_taux: 10,
    source: 'helloArtisan, Travaux.com 2026'
  },
  {
    designation: 'Pose fenêtre rénovation',
    categorie: 'Menuiserie',
    unite: 'u',
    min_ht: 250,
    max_ht: 400,
    prix_moyen_ht: 325,
    tva_taux: 10,
    source: 'Hello Watt 2026'
  },
  {
    designation: 'Pose fenêtre neuve',
    categorie: 'Menuiserie',
    unite: 'u',
    min_ht: 150,
    max_ht: 250,
    prix_moyen_ht: 200,
    tva_taux: 10,
    source: 'Hello Watt 2026'
  },
  {
    designation: 'Pose porte intérieure',
    categorie: 'Menuiserie',
    unite: 'u',
    min_ht: 60,
    max_ht: 150,
    prix_moyen_ht: 105,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Installation escalier standard',
    categorie: 'Menuiserie',
    unite: 'u',
    min_ht: 2000,
    max_ht: 6000,
    prix_moyen_ht: 4000,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },

  // ===== CHAUFFAGE =====
  {
    designation: 'Chaudière gaz (fourniture + pose)',
    categorie: 'Chauffage',
    unite: 'u',
    min_ht: 2000,
    max_ht: 7000,
    prix_moyen_ht: 4500,
    tva_taux: 5.5,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Chaudière bois granulés (fourniture + pose)',
    categorie: 'Chauffage',
    unite: 'u',
    min_ht: 6500,
    max_ht: 17000,
    prix_moyen_ht: 11750,
    tva_taux: 5.5,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Chaudière électrique (fourniture + pose)',
    categorie: 'Chauffage',
    unite: 'u',
    min_ht: 1500,
    max_ht: 12000,
    prix_moyen_ht: 6750,
    tva_taux: 5.5,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Pompe à chaleur hybride (fourniture + pose)',
    categorie: 'Chauffage',
    unite: 'u',
    min_ht: 4500,
    max_ht: 12000,
    prix_moyen_ht: 8250,
    tva_taux: 5.5,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Installation climatisation mono-split',
    categorie: 'Chauffage',
    unite: 'u',
    min_ht: 600,
    max_ht: 1500,
    prix_moyen_ht: 1050,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Installation climatisation multi-split',
    categorie: 'Chauffage',
    unite: 'u',
    min_ht: 1500,
    max_ht: 2500,
    prix_moyen_ht: 2000,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Installation climatisation réversible',
    categorie: 'Chauffage',
    unite: 'u',
    min_ht: 700,
    max_ht: 1500,
    prix_moyen_ht: 1100,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Entretien pompe à chaleur',
    categorie: 'Chauffage',
    unite: 'u',
    min_ht: 150,
    max_ht: 400,
    prix_moyen_ht: 275,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },

  // ===== CUISINE & SALLE DE BAIN =====
  {
    designation: 'Rénovation partielle cuisine',
    categorie: 'Cuisine',
    unite: 'm²',
    min_ht: 350,
    max_ht: 500,
    prix_moyen_ht: 425,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Rénovation totale cuisine',
    categorie: 'Cuisine',
    unite: 'm²',
    min_ht: 500,
    max_ht: 1000,
    prix_moyen_ht: 750,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Rénovation partielle salle de bain',
    categorie: 'Salle de bain',
    unite: 'm²',
    min_ht: 500,
    max_ht: 750,
    prix_moyen_ht: 625,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Rénovation totale salle de bain',
    categorie: 'Salle de bain',
    unite: 'm²',
    min_ht: 750,
    max_ht: 1500,
    prix_moyen_ht: 1125,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },

  // ===== SERRURERIE =====
  {
    designation: 'Ouverture porte simple claquée',
    categorie: 'Serrurerie',
    unite: 'u',
    min_ht: 70,
    max_ht: 150,
    prix_moyen_ht: 110,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Ouverture porte blindée',
    categorie: 'Serrurerie',
    unite: 'u',
    min_ht: 100,
    max_ht: 300,
    prix_moyen_ht: 200,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Remplacement serrure standard',
    categorie: 'Serrurerie',
    unite: 'u',
    min_ht: 150,
    max_ht: 400,
    prix_moyen_ht: 275,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Installation serrure haute sécurité',
    categorie: 'Serrurerie',
    unite: 'u',
    min_ht: 500,
    max_ht: 1200,
    prix_moyen_ht: 850,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },

  // ===== DÉMOLITION =====
  {
    designation: 'Démolition maison',
    categorie: 'Démolition',
    unite: 'm²',
    min_ht: 80,
    max_ht: 200,
    prix_moyen_ht: 140,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Démolition mur maçonné',
    categorie: 'Démolition',
    unite: 'm³',
    min_ht: 25,
    max_ht: 70,
    prix_moyen_ht: 47.5,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Démolition mur briques',
    categorie: 'Démolition',
    unite: 'm³',
    min_ht: 75,
    max_ht: 130,
    prix_moyen_ht: 102.5,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Démolition mur porteur',
    categorie: 'Démolition',
    unite: 'm³',
    min_ht: 100,
    max_ht: 150,
    prix_moyen_ht: 125,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Suppression cloisons non porteurs',
    categorie: 'Démolition',
    unite: 'm³',
    min_ht: 10,
    max_ht: 80,
    prix_moyen_ht: 45,
    tva_taux: 10,
    source: 'helloArtisan 2026'
  },

  // ===== PAYSAGISME =====
  {
    designation: 'Création pose pelouse (gazon)',
    categorie: 'Paysagisme',
    unite: 'm²',
    min_ht: 3,
    max_ht: 7,
    prix_moyen_ht: 5,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Installation arrosage automatique',
    categorie: 'Paysagisme',
    unite: 'm²',
    min_ht: 8,
    max_ht: 15,
    prix_moyen_ht: 11.5,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Taille haie, entretien arbustes',
    categorie: 'Paysagisme',
    unite: 'heure',
    min_ht: 20,
    max_ht: 45,
    prix_moyen_ht: 32.5,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },

  // ===== MAIN-D'ŒUVRE (taux horaires) =====
  {
    designation: 'Main-d\'œuvre maçon',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 35,
    max_ht: 70,
    prix_moyen_ht: 55,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Main-d\'œuvre peintre',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 30,
    max_ht: 40,
    prix_moyen_ht: 35,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Main-d\'œuvre plombier',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 40,
    max_ht: 70,
    prix_moyen_ht: 55,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Main-d\'œuvre électricien',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 35,
    max_ht: 75,
    prix_moyen_ht: 55,
    tva_taux: 20,
    source: 'Obat.fr 2026',
    notes: 'Jusqu\'à 75€ pour travaux complexes'
  },
  {
    designation: 'Main-d\'œuvre couvreur',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 45,
    max_ht: 70,
    prix_moyen_ht: 57.5,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Main-d\'œuvre terrassier',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 60,
    max_ht: 80,
    prix_moyen_ht: 70,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Main-d\'œuvre charpentier',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 40,
    max_ht: 60,
    prix_moyen_ht: 50,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Main-d\'œuvre plaquiste',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 35,
    max_ht: 45,
    prix_moyen_ht: 40,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Main-d\'œuvre menuisier',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 40,
    max_ht: 60,
    prix_moyen_ht: 50,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Main-d\'œuvre chauffagiste',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 30,
    max_ht: 65,
    prix_moyen_ht: 47.5,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Main-d\'œuvre carreleur',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 35,
    max_ht: 50,
    prix_moyen_ht: 42.5,
    tva_taux: 10,
    source: 'Estimations BTP 2026'
  },
  {
    designation: 'Main-d\'œuvre paysagiste',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 30,
    max_ht: 75,
    prix_moyen_ht: 52.5,
    tva_taux: 10,
    source: 'Obat.fr 2026',
    notes: 'Architecte-paysagiste jusqu\'à 75€'
  },
  {
    designation: 'Main-d\'œuvre multiservices',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 20,
    max_ht: 50,
    prix_moyen_ht: 35,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  }
]

export function getComprehensiveDatabase() {
  return COMPREHENSIVE_PRICE_DATABASE
}

export function getCategoriesList() {
  return Array.from(new Set(COMPREHENSIVE_PRICE_DATABASE.map(p => p.categorie)))
}

export function getPricesByCategory(categorie: string) {
  return COMPREHENSIVE_PRICE_DATABASE.filter(p => p.categorie === categorie)
}
