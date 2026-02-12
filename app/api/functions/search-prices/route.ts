// API : Recherche dans le catalogue de prix
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/functions/search-prices
 * Recherche dans le catalogue de prix par désignation, catégorie ou fournisseur
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les paramètres
    const body = await request.json()
    const { query, limit = 10 } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Paramètre query manquant' }, { status: 400 })
    }

    console.log(`🔍 Recherche prix : "${query}" (limite: ${limit})`)

    // Recherche avec ILIKE (insensible à la casse)
    const searchPattern = `%${query.trim()}%`
    
    const { data: prices, error: searchError } = await supabase
      .from('base_prix')
      .select('id, designation, unite, prix_unitaire_ht, tva_taux, categorie, fournisseur, reference')
      .eq('user_id', user.id) // Sécurité : seulement son catalogue
      .or(`designation.ilike.${searchPattern},categorie.ilike.${searchPattern},fournisseur.ilike.${searchPattern}`)
      .order('usage_count', { ascending: false }) // Trier par popularité
      .limit(Math.min(Number(limit), 50)) // Max 50 résultats

    if (searchError) {
      console.error('Erreur recherche prix :', searchError)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    console.log(`✅ ${prices?.length || 0} prix trouvé(s)`)

    return NextResponse.json({
      prices: prices || [],
      count: prices?.length || 0,
      query
    })

  } catch (error) {
    console.error('Erreur API /api/functions/search-prices :', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
