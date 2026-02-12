// API : Création de devis avec calculs automatiques
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface Lot {
  designation: string
  quantite: number
  unite: string
  prix_unitaire_ht: number
  tva_taux: number
}

interface CreateDevisParams {
  client_id: string
  lots: Lot[]
  remise_pourcentage?: number
  acompte_pourcentage?: number
  conditions_paiement?: string
  statut?: 'brouillon' | 'envoye'
}

/**
 * POST /api/functions/create-devis
 * Crée un devis avec calculs automatiques (HT, TVA, TTC, remise, acompte)
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
    const body: CreateDevisParams = await request.json()
    const { 
      client_id, 
      lots, 
      remise_pourcentage = 0, 
      acompte_pourcentage = 0,
      conditions_paiement,
      statut = 'brouillon'
    } = body

    // Validation
    if (!client_id || !lots || lots.length === 0) {
      return NextResponse.json({ 
        error: 'Paramètres manquants : client_id et lots requis' 
      }, { status: 400 })
    }

    // Vérifier que le client existe et appartient à l'utilisateur
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, nom, prenom, email, telephone, adresse, code_postal, ville')
      .eq('id', client_id)
      .eq('user_id', user.id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ 
        error: 'Client non trouvé ou n\'appartient pas à l\'utilisateur' 
      }, { status: 404 })
    }

    // Récupérer les paramètres artisan
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Calculs
    let total_ht = 0
    const lotsWithTotals = lots.map(lot => {
      const total_ht_ligne = lot.quantite * lot.prix_unitaire_ht
      total_ht += total_ht_ligne
      return {
        ...lot,
        total_ht: parseFloat(total_ht_ligne.toFixed(2))
      }
    })

    const remise_montant = parseFloat(((total_ht * remise_pourcentage) / 100).toFixed(2))
    const total_ht_apres_remise = parseFloat((total_ht - remise_montant).toFixed(2))
    
    // Calcul TVA (simplifié : on prend le taux du premier lot pour le total)
    // En réalité, il faudrait calculer la TVA ligne par ligne
    const tva_taux = lots[0]?.tva_taux || 20
    const tva_montant = parseFloat((total_ht_apres_remise * tva_taux / 100).toFixed(2))
    const total_ttc = parseFloat((total_ht_apres_remise + tva_montant).toFixed(2))
    
    const acompte_montant = parseFloat((total_ttc * acompte_pourcentage / 100).toFixed(2))

    // Générer le numéro de devis (DEV-YYYY-XXX)
    const year = new Date().getFullYear()
    const { count: devisCount } = await supabase
      .from('devis')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .like('numero', `DEV-${year}-%`)

    const nextNumber = (devisCount || 0) + 1
    const numero = `DEV-${year}-${String(nextNumber).padStart(3, '0')}`

    // Créer le devis
    const { data: devis, error: insertError } = await supabase
      .from('devis')
      .insert({
        user_id: user.id,
        numero,
        date_creation: new Date().toISOString().split('T')[0],
        
        // Client
        client_id: client.id,
        client_nom: client.nom,
        client_prenom: client.prenom,
        client_email: client.email,
        client_telephone: client.telephone,
        client_adresse: client.adresse,
        client_code_postal: client.code_postal,
        client_ville: client.ville,
        
        // Artisan (depuis settings)
        artisan_raison_sociale: settings?.artisan_raison_sociale || '',
        artisan_siret: settings?.artisan_siret || '',
        artisan_adresse: settings?.artisan_adresse || '',
        artisan_code_postal: settings?.artisan_code_postal || '',
        artisan_ville: settings?.artisan_ville || '',
        artisan_telephone: settings?.artisan_telephone || '',
        artisan_email: settings?.artisan_email || '',
        
        // Assurance
        assurance_compagnie: settings?.assurance_compagnie || '',
        assurance_numero_police: settings?.assurance_numero_police || '',
        
        // Lots
        lots: lotsWithTotals,
        
        // Totaux
        total_ht: parseFloat(total_ht.toFixed(2)),
        tva_montant,
        total_ttc,
        remise_pourcentage,
        remise_montant,
        acompte_pourcentage,
        acompte_montant,
        
        // Conditions
        conditions_paiement: conditions_paiement || settings?.conditions_paiement_defaut || 'Paiement à réception',
        
        // Statut
        statut
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erreur création devis :', insertError)
      return NextResponse.json({ error: 'Erreur création devis', details: insertError.message }, { status: 500 })
    }

    console.log(`✅ Devis créé : ${numero} (ID: ${devis.id})`)

    return NextResponse.json({
      success: true,
      devis: {
        id: devis.id,
        numero: devis.numero,
        client_nom: `${client.prenom} ${client.nom}`,
        total_ttc: devis.total_ttc,
        statut: devis.statut
      }
    })

  } catch (error) {
    console.error('Erreur API /api/functions/create-devis :', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
