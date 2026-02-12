import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/devis/[id] - Récupérer un devis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('devis')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/devis/[id] - Mettre à jour un devis
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()

    const updateData = {
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
      
      // Lots
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
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/devis/[id] - Supprimer un devis
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { error } = await supabase
      .from('devis')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
