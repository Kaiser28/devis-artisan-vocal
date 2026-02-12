import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/base-prix/search - Autocomplétion pour formulaire devis
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    if (!q || q.length < 2) {
      return NextResponse.json({ data: [] })
    }

    // Recherche avec trigram (index déjà créé)
    const { data, error } = await supabase
      .from('base_prix')
      .select('id, designation, unite, prix_unitaire_ht, tva_taux, categorie, usage_count')
      .eq('user_id', user.id)
      .ilike('designation', `%${q}%`)
      .order('usage_count', { ascending: false })
      .order('designation', { ascending: true })
      .limit(10)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
