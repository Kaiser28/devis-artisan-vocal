import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/test/create-client
 * Endpoint test création client avec logs détaillés
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const body = await req.json()
    console.log('📥 Données reçues:', JSON.stringify(body, null, 2))

    const { nom, prenom, email, telephone, ville, adresse, code_postal } = body

    // Validation
    if (!email && !telephone) {
      const errorMsg = 'Email ou téléphone obligatoire'
      console.error('❌ Validation:', errorMsg)
      return NextResponse.json({ 
        success: false,
        error: errorMsg,
        received: { email, telephone }
      }, { status: 400 })
    }

    console.log('✅ Validation OK')
    console.log('📤 Insertion Supabase:', {
      user_id: user.id,
      nom: nom || '',
      prenom: prenom || '',
      email: email || null,
      telephone: telephone || null,
      ville: ville || null
    })

    // Créer client
    const { data: client, error: insertError } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        nom: nom || '',
        prenom: prenom || '',
        email: email || null,
        telephone: telephone || null,
        ville: ville || null,
        adresse: adresse || null,
        code_postal: code_postal || null
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erreur Supabase:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })

      if (insertError.code === '23505') {
        return NextResponse.json({ 
          success: false,
          error: `Un client avec l'email ${email} existe déjà`,
          supabase_error: insertError
        }, { status: 400 })
      }

      return NextResponse.json({ 
        success: false,
        error: insertError.message,
        supabase_error: insertError
      }, { status: 500 })
    }

    console.log('✅ Client créé:', client.id)

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone,
        ville: client.ville
      },
      message: `✅ Client ${prenom} ${nom} créé`
    })

  } catch (error) {
    console.error('❌ Exception:', error)
    return NextResponse.json(
      { 
        error: 'Erreur création client', 
        details: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
