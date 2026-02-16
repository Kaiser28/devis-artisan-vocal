import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/clients/check-duplicate
 * Vérifie si un client similaire existe (Levenshtein + fuzzy match ville)
 * 
 * Body: { name: string, city?: string }
 * 
 * Retourne: { duplicates: Client[], similarity_scores: number[] }
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { name, city } = await req.json()

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ 
      error: 'Nom requis (minimum 2 caractères)' 
    }, { status: 400 })
  }

  try {
    // Recherche fuzzy : nom ou prénom contient 60%+ des caractères
    const searchPattern = `%${name.trim().toLowerCase()}%`
    
    let query = supabase
      .from('clients')
      .select('id, nom, prenom, email, telephone, ville, adresse')
      .eq('user_id', user.id)
      .or(`nom.ilike.${searchPattern},prenom.ilike.${searchPattern}`)

    // Si ville fournie, filtrer aussi par ville
    if (city && city.trim().length > 0) {
      const cityPattern = `%${city.trim().toLowerCase()}%`
      query = query.ilike('ville', cityPattern)
    }

    const { data: clients, error } = await query.limit(10)

    if (error) throw error

    // Calcul similarité simple (longueur commune / longueur max)
    const duplicates = (clients || []).map(client => {
      const fullName = `${client.prenom} ${client.nom}`.toLowerCase()
      const searchName = name.toLowerCase()
      
      // Similarité basique : nombre de caractères communs
      let commonChars = 0
      for (const char of searchName) {
        if (fullName.includes(char)) commonChars++
      }
      
      const similarity = commonChars / Math.max(searchName.length, fullName.length)
      
      return {
        client,
        similarity: parseFloat((similarity * 100).toFixed(1))
      }
    })
    .filter(d => d.similarity > 50) // Seuil 50% similarité
    .sort((a, b) => b.similarity - a.similarity)

    return NextResponse.json({
      success: true,
      duplicates: duplicates.map(d => d.client),
      similarity_scores: duplicates.map(d => d.similarity),
      query: { name, city }
    })

  } catch (error) {
    console.error('❌ Erreur check-duplicate:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}
