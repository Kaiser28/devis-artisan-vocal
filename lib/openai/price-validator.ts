// Validateur de prix pour l'IA
// Garantit que les prix générés sont cohérents avec les fourchettes BTP 2026

interface PriceRange {
  designation: string
  categorie: string
  unite: string
  min_ht: number
  max_ht: number
  tva_taux: number
  source: string
}

// Base de référence BTP 2026 (données réelles)
const PRICE_REFERENCES: PriceRange[] = [
  // Peinture
  {
    designation: 'Peinture intérieure murs',
    categorie: 'Peinture',
    unite: 'm²',
    min_ht: 15,
    max_ht: 40,
    tva_taux: 10,
    source: 'Travaux.com 2026'
  },
  {
    designation: 'Peinture plafond',
    categorie: 'Peinture',
    unite: 'm²',
    min_ht: 25,
    max_ht: 35,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Peinture extérieure',
    categorie: 'Peinture',
    unite: 'm²',
    min_ht: 20,
    max_ht: 45,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  
  // Carrelage
  {
    designation: 'Carrelage ciment',
    categorie: 'Carrelage',
    unite: 'm²',
    min_ht: 50,
    max_ht: 150,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Carrelage mosaïque',
    categorie: 'Carrelage',
    unite: 'm²',
    min_ht: 15,
    max_ht: 70,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Carrelage marbre',
    categorie: 'Carrelage',
    unite: 'm²',
    min_ht: 45,
    max_ht: 150,
    tva_taux: 10,
    source: 'Obat.fr 2026'
  },
  {
    designation: 'Pose carrelage standard',
    categorie: 'Carrelage',
    unite: 'm²',
    min_ht: 30,
    max_ht: 60,
    tva_taux: 10,
    source: 'Estimations BTP 2026'
  },
  
  // Plomberie
  {
    designation: 'Plomberie rénovation',
    categorie: 'Plomberie',
    unite: 'm²',
    min_ht: 70,
    max_ht: 150,
    tva_taux: 20,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Remplacement robinetterie',
    categorie: 'Plomberie',
    unite: 'u',
    min_ht: 80,
    max_ht: 200,
    tva_taux: 20,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Réparation chasse d\'eau',
    categorie: 'Plomberie',
    unite: 'u',
    min_ht: 60,
    max_ht: 120,
    tva_taux: 20,
    source: 'helloArtisan 2026'
  },
  {
    designation: 'Remplacement WC',
    categorie: 'Plomberie',
    unite: 'u',
    min_ht: 200,
    max_ht: 400,
    tva_taux: 20,
    source: 'helloArtisan 2026'
  },
  
  // Électricité
  {
    designation: 'Point électrique',
    categorie: 'Électricité',
    unite: 'u',
    min_ht: 80,
    max_ht: 150,
    tva_taux: 20,
    source: 'Estimations BTP 2026'
  },
  {
    designation: 'Tableau électrique',
    categorie: 'Électricité',
    unite: 'u',
    min_ht: 800,
    max_ht: 1500,
    tva_taux: 20,
    source: 'Estimations BTP 2026'
  },
  
  // Main-d'œuvre
  {
    designation: 'Main-d\'œuvre artisan',
    categorie: 'Main-d\'œuvre',
    unite: 'heure',
    min_ht: 40,
    max_ht: 70,
    tva_taux: 20,
    source: 'Obat.fr 2026'
  }
]

// Système de validation
export interface PriceValidationResult {
  isValid: boolean
  confidence: 'high' | 'medium' | 'low'
  warnings: string[]
  suggestions?: {
    min_suggested: number
    max_suggested: number
    reference?: PriceRange
  }
}

export function validatePrice(
  designation: string,
  prix_ht: number,
  unite: string,
  categorie?: string
): PriceValidationResult {
  const result: PriceValidationResult = {
    isValid: true,
    confidence: 'medium',
    warnings: []
  }

  // 1. Recherche dans la base de référence
  const reference = findBestMatch(designation, categorie, unite)

  if (reference) {
    // Prix dans la fourchette
    if (prix_ht >= reference.min_ht && prix_ht <= reference.max_ht) {
      result.confidence = 'high'
      result.suggestions = {
        min_suggested: reference.min_ht,
        max_suggested: reference.max_ht,
        reference
      }
    }
    // Prix en dehors de la fourchette
    else if (prix_ht < reference.min_ht * 0.7 || prix_ht > reference.max_ht * 1.3) {
      result.isValid = false
      result.confidence = 'low'
      result.warnings.push(
        `⚠️ Prix suspect : ${prix_ht}€/${unite} pour "${designation}".\n` +
        `Fourchette habituelle : ${reference.min_ht}-${reference.max_ht}€/${unite} (${reference.source})`
      )
      result.suggestions = {
        min_suggested: reference.min_ht,
        max_suggested: reference.max_ht,
        reference
      }
    }
    // Prix légèrement en dehors (tolérance 30%)
    else {
      result.confidence = 'medium'
      result.warnings.push(
        `💡 Prix inhabituel mais acceptable : ${prix_ht}€/${unite}.\n` +
        `Fourchette standard : ${reference.min_ht}-${reference.max_ht}€/${unite}`
      )
      result.suggestions = {
        min_suggested: reference.min_ht,
        max_suggested: reference.max_ht,
        reference
      }
    }
  } else {
    // Pas de référence : validation basique
    result.confidence = 'low'
    result.warnings.push(
      `ℹ️ Aucune référence trouvée pour "${designation}".\n` +
      `Merci de vérifier manuellement le prix : ${prix_ht}€/${unite}`
    )

    // Détection de prix aberrants (heuristiques générales)
    if (prix_ht < 1) {
      result.isValid = false
      result.warnings.push('❌ Prix anormalement bas (< 1€)')
    } else if (prix_ht > 10000) {
      result.warnings.push('⚠️ Prix très élevé (> 10 000€), vérifiez l\'unité')
    }
  }

  return result
}

// Recherche de correspondance floue
function findBestMatch(
  designation: string,
  categorie: string | undefined,
  unite: string
): PriceRange | null {
  const designationLower = designation.toLowerCase()
  const categorieLower = categorie?.toLowerCase()

  // Correspondance exacte ou partielle
  for (const ref of PRICE_REFERENCES) {
    const refDesignationLower = ref.designation.toLowerCase()
    const refCategorieLower = ref.categorie.toLowerCase()

    // Correspondance complète
    if (refDesignationLower.includes(designationLower) || designationLower.includes(refDesignationLower)) {
      if (ref.unite === unite) {
        return ref
      }
    }

    // Correspondance par catégorie + mots-clés
    if (categorieLower && refCategorieLower === categorieLower) {
      const keywords = designationLower.split(' ')
      const refKeywords = refDesignationLower.split(' ')
      const commonWords = keywords.filter(k => refKeywords.some(rk => rk.includes(k) || k.includes(rk)))
      
      if (commonWords.length > 0 && ref.unite === unite) {
        return ref
      }
    }
  }

  return null
}

// Fonction pour ajouter dynamiquement une référence
export function addPriceReference(reference: PriceRange) {
  PRICE_REFERENCES.push(reference)
}

// Export de la base de référence pour l'import dans Supabase
export function getReferences() {
  return PRICE_REFERENCES
}
