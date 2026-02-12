// API : Recherche de clients (fuzzy matching)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/functions/search-clients
 * Recherche fuzzy de clients par nom, prénom, téléphone, ville
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
    const { query, limit = 5 } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Paramètre query manquant' }, { status: 400 })
    }

    console.log(`🔍 Recherche clients : "${query}" (limite: ${limit})`)

    // Recherche avec ILIKE (insensible à la casse)
    const searchPattern = `%${query.trim()}%`
    
    const { data: clients, error: searchError } = await supabase
      .from('clients')
      .select('id, nom, prenom, email, telephone, adresse, code_postal, ville')
      .eq('user_id', user.id) // Sécurité : seulement ses clients
      .or(`nom.ilike.${searchPattern},prenom.ilike.${searchPattern},email.ilike.${searchPattern},telephone.ilike.${searchPattern},ville.ilike.${searchPattern}`)
      .limit(Math.min(Number(limit), 20)) // Max 20 résultats

    if (searchError) {
      console.error('Erreur recherche clients :', searchError)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    console.log(`✅ ${clients?.length || 0} client(s) trouvé(s)`)

    return NextResponse.json({
      clients: clients || [],
      count: clients?.length || 0,
      query
    })

  } catch (error) {
    console.error('Erreur API /api/functions/search-clients :', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
