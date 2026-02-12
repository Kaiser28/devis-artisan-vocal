import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/base-prix - Liste des prix avec filtres
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categorie = searchParams.get('categorie') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('base_prix')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('usage_count', { ascending: false })
      .order('designation', { ascending: true })

    if (search) {
      query = query.ilike('designation', `%${search}%`)
    }

    if (categorie) {
      query = query.eq('categorie', categorie)
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/base-prix - Créer un nouveau prix
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      designation,
      categorie,
      unite,
      prix_unitaire_ht,
      tva_taux,
      notes,
      fournisseur
    } = body

    // Validation
    if (!designation || !unite || prix_unitaire_ht === undefined) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('base_prix')
      .insert({
        user_id: user.id,
        designation,
        categorie: categorie || null,
        unite,
        prix_unitaire_ht: parseFloat(prix_unitaire_ht),
        tva_taux: tva_taux ? parseFloat(tva_taux) : 20,
        notes: notes || null,
        fournisseur: fournisseur || null,
        source: 'manual',
        usage_count: 0
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
