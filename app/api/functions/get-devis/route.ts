// API : Récupération d'un devis par numéro ou ID
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/functions/get-devis
 * Récupère un devis par son numéro (DEV-2026-003) ou son UUID
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
    const { numero_or_id } = body

    if (!numero_or_id || typeof numero_or_id !== 'string') {
      return NextResponse.json({ error: 'Paramètre numero_or_id manquant' }, { status: 400 })
    }

    console.log(`🔍 Recherche devis : "${numero_or_id}"`)

    // Déterminer si c'est un UUID ou un numéro
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(numero_or_id)

    let query = supabase
      .from('devis')
      .select('*')
      .eq('user_id', user.id) // Sécurité : seulement ses devis

    if (isUUID) {
      query = query.eq('id', numero_or_id)
    } else {
      query = query.eq('numero', numero_or_id)
    }

    const { data: devis, error: fetchError } = await query.single()

    if (fetchError || !devis) {
      console.error('Erreur récupération devis :', fetchError)
      return NextResponse.json({ 
        error: 'Devis non trouvé',
        query: numero_or_id
      }, { status: 404 })
    }

    console.log(`✅ Devis trouvé : ${devis.numero} (ID: ${devis.id})`)

    return NextResponse.json({
      success: true,
      devis: {
        id: devis.id,
        numero: devis.numero,
        date_creation: devis.date_creation,
        
        // Client
        client: {
          nom: devis.client_nom,
          prenom: devis.client_prenom,
          email: devis.client_email,
          telephone: devis.client_telephone,
          adresse: devis.client_adresse,
          code_postal: devis.client_code_postal,
          ville: devis.client_ville
        },
        
        // Artisan
        artisan: {
          raison_sociale: devis.artisan_raison_sociale,
          siret: devis.artisan_siret,
          adresse: devis.artisan_adresse,
          code_postal: devis.artisan_code_postal,
          ville: devis.artisan_ville,
          telephone: devis.artisan_telephone,
          email: devis.artisan_email
        },
        
        // Lots
        lots: devis.lots,
        
        // Totaux
        total_ht: devis.total_ht,
        tva_montant: devis.tva_montant,
        total_ttc: devis.total_ttc,
        remise_pourcentage: devis.remise_pourcentage,
        remise_montant: devis.remise_montant,
        acompte_pourcentage: devis.acompte_pourcentage,
        acompte_montant: devis.acompte_montant,
        
        // Autres
        conditions_paiement: devis.conditions_paiement,
        statut: devis.statut
      }
    })

  } catch (error) {
    console.error('Erreur API /api/functions/get-devis :', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
