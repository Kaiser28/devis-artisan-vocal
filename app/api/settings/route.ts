import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: settings, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Si pas de settings, retourner valeurs par défaut
  const defaultSettings = {
    user_id: user.id,
    raison_sociale: '',
    siret: '',
    adresse: '',
    code_postal: '',
    ville: '',
    telephone: '',
    email: user.email || '',
    site_web: '',
    logo_url: null,
    assurance_decennale_compagnie: '',
    assurance_decennale_numero: '',
    assurance_decennale_validite: null,
    mentions_legales: 'En cas de litige, les tribunaux français seront seuls compétents. Devis valable sous réserve d\'acceptation.',
    tva_defaut: 20,
    conditions_paiement_defaut: 'Acompte de 30% à la commande, solde à réception des travaux.',
    validite_devis_jours: 30
  }

  return NextResponse.json({ data: settings || defaultSettings })
}

export async function PUT(req: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()

  // Vérifier si settings existent
  const { data: existing } = await supabase
    .from('user_settings')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Update
    const { data, error } = await supabase
      .from('user_settings')
      .update(body)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } else {
    // Insert
    const { data, error } = await supabase
      .from('user_settings')
      .insert({ ...body, user_id: user.id })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  }
}
