// Validateur de prix pour l'IA
// Garantit que les prix générés sont cohérents avec les fourchettes BTP 2026
// Base de données : 112 prix réels (sources : hemea, obat, helloArtisan, travaux.com)

import { COMPREHENSIVE_PRICE_DATABASE, type ComprehensivePriceReference } from './comprehensive-price-database'

export interface PriceValidationResult {
  isValid: boolean
  confidence: 'high' | 'medium' | 'low'
  warnings: string[]
  suggestions?: {
    min_suggested: number
    max_suggested: number
    reference?: ComprehensivePriceReference
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

  // 1. Recherche dans la base de référence (112 prix)
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
        `Fourchette habituelle 2026 : ${reference.min_ht}-${reference.max_ht}€/${unite} (${reference.source})`
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
        `Fourchette standard 2026 : ${reference.min_ht}-${reference.max_ht}€/${unite}`
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

// Recherche de correspondance floue dans la base de 112 prix
function findBestMatch(
  designation: string,
  categorie: string | undefined,
  unite: string
): ComprehensivePriceReference | null {
  const designationLower = designation.toLowerCase()
  const categorieLower = categorie?.toLowerCase()

  // Correspondance exacte ou partielle
  for (const ref of COMPREHENSIVE_PRICE_DATABASE) {
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

// Export de la base de référence pour l'import dans Supabase
export function getReferences() {
  return COMPREHENSIVE_PRICE_DATABASE
}
