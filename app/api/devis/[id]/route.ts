import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/devis/[id] - Récupérer un devis
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: devis, error } = await supabase
    .from('devis')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!devis) {
    return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 })
  }

  return NextResponse.json({ data: devis })
}

// PUT /api/devis/[id] - Mettre à jour un devis
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()

  // Préparer les données
  const devisData = {
    // Client
    client_id: body.client_id,
    client_nom: body.client_nom,
    client_prenom: body.client_prenom,
    client_email: body.client_email || null,
    client_telephone: body.client_telephone || null,
    client_adresse: body.client_adresse || null,
    client_code_postal: body.client_code_postal || null,
    client_ville: body.client_ville || null,
    
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
    
    // Lots
    lots: body.lots || [],
    
    // Montants
    total_ht: parseFloat(body.total_ht) || 0,
    tva_montant: parseFloat(body.tva_montant) || 0,
    total_ttc: parseFloat(body.total_ttc) || 0,
    remise_pourcentage: parseFloat(body.remise_pourcentage) || 0,
    remise_montant: parseFloat(body.remise_montant) || 0,
    acompte_pourcentage: parseFloat(body.acompte_pourcentage) || 0,
    acompte_montant: parseFloat(body.acompte_montant) || 0,
    
    // Conditions
    conditions_paiement: body.conditions_paiement || '',
    
    // Statut
    statut: body.statut || 'brouillon',
    
    // Date de mise à jour
    updated_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('devis')
    .update(devisData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 200 })
}

// DELETE /api/devis/[id] - Supprimer un devis
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { error } = await supabase
    .from('devis')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
