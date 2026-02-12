import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/devis - Liste des devis avec filtres
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const statut = searchParams.get('statut') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = supabase
      .from('devis')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date_creation', { ascending: false })

    // Recherche par numéro ou nom client
    if (search) {
      query = query.or(`numero.ilike.%${search}%,client_nom.ilike.%${search}%`)
    }

    // Filtre par statut
    if (statut) {
      query = query.eq('statut', statut)
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

// POST /api/devis - Créer un nouveau devis
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()

    // Générer le numéro de devis automatiquement
    const { data: numeroData } = await supabase.rpc('generate_devis_numero', {
      p_user_id: user.id
    })

    const devisData = {
      user_id: user.id,
      numero: numeroData || `DEV-${new Date().getFullYear()}-001`,
      date_creation: new Date().toISOString(),
      
      // Client
      client_id: body.client_id || null,
      client_nom: body.client_nom || '',
      client_prenom: body.client_prenom || '',
      client_email: body.client_email || '',
      client_telephone: body.client_telephone || '',
      client_adresse: body.client_adresse || '',
      client_code_postal: body.client_code_postal || '',
      client_ville: body.client_ville || '',
      
      // Artisan
      artisan_raison_sociale: body.artisan_raison_sociale || '',
      artisan_siret: body.artisan_siret || '',
      artisan_adresse: body.artisan_adresse || '',
      artisan_code_postal: body.artisan_code_postal || '',
      artisan_ville: body.artisan_ville || '',
      artisan_telephone: body.artisan_telephone || '',
      artisan_email: body.artisan_email || '',
      
      // Assurance
      assurance_compagnie: body.assurance_compagnie || '',
      assurance_numero_police: body.assurance_numero_police || '',
      assurance_telephone: body.assurance_telephone || '',
      
      // Lots (lignes de devis)
      lots: body.lots || [],
      
      // Montants
      total_ht: parseFloat(body.total_ht || '0'),
      tva_montant: parseFloat(body.tva_montant || '0'),
      total_ttc: parseFloat(body.total_ttc || '0'),
      remise_pourcentage: parseFloat(body.remise_pourcentage || '0'),
      remise_montant: parseFloat(body.remise_montant || '0'),
      acompte_pourcentage: parseFloat(body.acompte_pourcentage || '0'),
      acompte_montant: parseFloat(body.acompte_montant || '0'),
      
      // Conditions
      conditions_paiement: body.conditions_paiement || '',
      
      // Statut
      statut: body.statut || 'brouillon'
    }

    const { data, error } = await supabase
      .from('devis')
      .insert(devisData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
