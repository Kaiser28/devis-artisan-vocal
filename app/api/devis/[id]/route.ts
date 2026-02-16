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

// PATCH /api/devis/[id] - Modification partielle (pour chat IA)
export async function PATCH(
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
  
  // Récupérer le devis actuel
  const { data: currentDevis, error: fetchError } = await supabase
    .from('devis')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !currentDevis) {
    return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 })
  }

  // Fusionner lots si fournis (modification ligne par ligne)
  let updatedLots = currentDevis.lots || []
  if (body.lots) {
    updatedLots = body.lots
  } else if (body.lot_updates) {
    // Mise à jour ligne par ligne : { lot_index: 0, quantite: 95 }
    body.lot_updates.forEach((update: any) => {
      if (update.lot_index !== undefined && updatedLots[update.lot_index]) {
        updatedLots[update.lot_index] = {
          ...updatedLots[update.lot_index],
          ...update
        }
      }
    })
  }

  // Recalcul totaux si lots modifiés
  let total_ht = 0
  const lotsWithTotals = updatedLots.map((lot: any) => {
    const total_ht_ligne = lot.quantite * lot.prix_unitaire_ht
    total_ht += total_ht_ligne
    return { ...lot, total_ht: parseFloat(total_ht_ligne.toFixed(2)) }
  })

  const remise_pourcentage = body.remise_pourcentage ?? currentDevis.remise_pourcentage ?? 0
  const acompte_pourcentage = body.acompte_pourcentage ?? currentDevis.acompte_pourcentage ?? 0
  const remise_montant = parseFloat(((total_ht * remise_pourcentage) / 100).toFixed(2))
  const total_ht_apres_remise = parseFloat((total_ht - remise_montant).toFixed(2))
  
  const tva_taux = lotsWithTotals[0]?.tva_taux || currentDevis.lots?.[0]?.tva_taux || 20
  const tva_montant = parseFloat((total_ht_apres_remise * tva_taux / 100).toFixed(2))
  const total_ttc = parseFloat((total_ht_apres_remise + tva_montant).toFixed(2))
  const acompte_montant = parseFloat((total_ttc * acompte_pourcentage / 100).toFixed(2))

  // Préparer update
  const updateData = {
    lots: lotsWithTotals,
    total_ht: parseFloat(total_ht.toFixed(2)),
    tva_montant,
    total_ttc,
    remise_pourcentage,
    remise_montant,
    acompte_pourcentage,
    acompte_montant,
    updated_at: new Date().toISOString(),
    // Autres champs optionnels
    ...(body.statut && { statut: body.statut }),
    ...(body.conditions_paiement && { conditions_paiement: body.conditions_paiement })
  }

  const { data, error } = await supabase
    .from('devis')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    success: true,
    data,
    message: 'Devis mis à jour avec succès'
  }, { status: 200 })
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
