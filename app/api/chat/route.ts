// API Chat IA (sans streaming) avec function calling
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai/assistant'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Timeout 60 secondes

// Mapping des fonctions
async function executeFunctionCall(
  functionName: string, 
  argsString: string, 
  supabase: any, 
  userId: string
) {
  const args = JSON.parse(argsString)
  
  console.log(`🔧 Exécution fonction : ${functionName}`, args)

  try {
    switch (functionName) {
      case 'search_clients': {
        const { query, limit = 5 } = args
        const searchPattern = `%${query.trim()}%`
        
        const { data: clients, error } = await supabase
          .from('clients')
          .select('id, nom, prenom, email, telephone, adresse, code_postal, ville')
          .eq('user_id', userId)
          .or(`nom.ilike.${searchPattern},prenom.ilike.${searchPattern},ville.ilike.${searchPattern},telephone.ilike.${searchPattern}`)
          .limit(Math.min(Number(limit), 20))

        if (error) throw error

        return {
          success: true,
          clients: clients || [],
          count: clients?.length || 0,
          query
        }
      }

      case 'search_prices': {
        const { query, limit = 10 } = args
        const searchPattern = `%${query.trim()}%`
        
        const { data: prices, error } = await supabase
          .from('base_prix')
          .select('id, designation, unite, prix_unitaire_ht, tva_taux, categorie, fournisseur')
          .eq('user_id', userId)
          .or(`designation.ilike.${searchPattern},categorie.ilike.${searchPattern}`)
          .order('usage_count', { ascending: false })
          .limit(Math.min(Number(limit), 50))

        if (error) throw error

        return {
          success: true,
          prices: prices || [],
          count: prices?.length || 0,
          query
        }
      }

      case 'create_devis': {
        const { 
          client_id, 
          lots, 
          remise_pourcentage = 0, 
          acompte_pourcentage = 0,
          conditions_paiement,
          statut = 'brouillon'
        } = args

        // Vérifier client
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', client_id)
          .eq('user_id', userId)
          .single()

        if (clientError || !client) {
          throw new Error('Client non trouvé')
        }

        // Récupérer settings
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single()

        // Calculs
        let total_ht = 0
        const lotsWithTotals = lots.map((lot: any) => {
          const total_ht_ligne = lot.quantite * lot.prix_unitaire_ht
          total_ht += total_ht_ligne
          return { ...lot, total_ht: parseFloat(total_ht_ligne.toFixed(2)) }
        })

        const remise_montant = parseFloat(((total_ht * remise_pourcentage) / 100).toFixed(2))
        const total_ht_apres_remise = parseFloat((total_ht - remise_montant).toFixed(2))
        const tva_taux = lots[0]?.tva_taux || 20
        const tva_montant = parseFloat((total_ht_apres_remise * tva_taux / 100).toFixed(2))
        const total_ttc = parseFloat((total_ht_apres_remise + tva_montant).toFixed(2))
        const acompte_montant = parseFloat((total_ttc * acompte_pourcentage / 100).toFixed(2))

        // Générer numéro
        const year = new Date().getFullYear()
        const { count: devisCount } = await supabase
          .from('devis')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .like('numero', `DEV-${year}-%`)

        const nextNumber = (devisCount || 0) + 1
        const numero = `DEV-${year}-${String(nextNumber).padStart(3, '0')}`

        // Créer devis
        const { data: devis, error: insertError } = await supabase
          .from('devis')
          .insert({
            user_id: userId,
            numero,
            date_creation: new Date().toISOString().split('T')[0],
            client_id: client.id,
            client_nom: client.nom,
            client_prenom: client.prenom,
            client_email: client.email,
            client_telephone: client.telephone,
            client_adresse: client.adresse,
            client_code_postal: client.code_postal,
            client_ville: client.ville,
            artisan_raison_sociale: settings?.artisan_raison_sociale || '',
            artisan_siret: settings?.artisan_siret || '',
            artisan_adresse: settings?.artisan_adresse || '',
            artisan_code_postal: settings?.artisan_code_postal || '',
            artisan_ville: settings?.artisan_ville || '',
            artisan_telephone: settings?.artisan_telephone || '',
            artisan_email: settings?.artisan_email || '',
            assurance_compagnie: settings?.assurance_compagnie || '',
            assurance_numero_police: settings?.assurance_numero_police || '',
            lots: lotsWithTotals,
            total_ht: parseFloat(total_ht.toFixed(2)),
            tva_montant,
            total_ttc,
            remise_pourcentage,
            remise_montant,
            acompte_pourcentage,
            acompte_montant,
            conditions_paiement: conditions_paiement || settings?.conditions_paiement_defaut || 'Paiement à réception',
            statut
          })
          .select()
          .single()

        if (insertError) throw insertError

        return {
          success: true,
          devis: {
            id: devis.id,
            numero: devis.numero,
            client_nom: `${client.prenom} ${client.nom}`,
            total_ttc: devis.total_ttc,
            statut: devis.statut
          }
        }
      }

      case 'get_devis': {
        const { numero_or_id } = args
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(numero_or_id)

        let query = supabase
          .from('devis')
          .select('*')
          .eq('user_id', userId)

        if (isUUID) {
          query = query.eq('id', numero_or_id)
        } else {
          query = query.eq('numero', numero_or_id)
        }

        const { data: devis, error } = await query.single()

        if (error || !devis) throw new Error('Devis non trouvé')

        return {
          success: true,
          devis: {
            id: devis.id,
            numero: devis.numero,
            date_creation: devis.date_creation,
            client: {
              nom: devis.client_nom,
              prenom: devis.client_prenom,
              email: devis.client_email,
              telephone: devis.client_telephone
            },
            lots: devis.lots,
            total_ht: devis.total_ht,
            total_ttc: devis.total_ttc,
            statut: devis.statut
          }
        }
      }

      case 'send_devis_email': {
        // TODO: Implémenter envoi email + PDF
        return {
          success: false,
          error: 'Fonction send_devis_email pas encore implémentée'
        }
      }

      default:
        throw new Error(`Fonction inconnue : ${functionName}`)
    }
  } catch (error) {
    console.error(`❌ Erreur fonction ${functionName} :`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

// Polling du run avec timeout et retry
async function waitForRunCompletion(threadId: string, runId: string, maxAttempts = 60) {
  let attempts = 0
  
  while (attempts < maxAttempts) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId as any)
    
    console.log(`⏳ Run status : ${run.status} (tentative ${attempts + 1}/${maxAttempts})`)
    
    if (run.status === 'completed') {
      return run
    }
    
    if (run.status === 'failed') {
      throw new Error(`Run failed: ${run.last_error?.message || 'Unknown error'}`)
    }
    
    if (run.status === 'cancelled') {
      throw new Error('Run was cancelled')
    }
    
    if (run.status === 'expired') {
      throw new Error('Run expired (timeout > 10 minutes)')
    }
    
    if (run.status === 'requires_action') {
      return run // Retourner pour traiter les function calls
    }
    
    // Attendre 1 seconde avant le prochain check
    await new Promise(resolve => setTimeout(resolve, 1000))
    attempts++
  }
  
  // Timeout atteint
  try {
    await openai.beta.threads.runs.cancel(threadId, runId as any)
  } catch (e) {
    console.error('Erreur annulation run :', e)
  }
  
  throw new Error('Run timeout: exceeded 60 seconds')
}

/**
 * POST /api/chat
 * Envoie un message à l'assistant et retourne la réponse (avec function calling)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { message, conversation_id, thread_id, assistant_id } = body

    if (!message || !thread_id || !assistant_id) {
      return NextResponse.json({ 
        error: 'Paramètres manquants : message, thread_id, assistant_id requis' 
      }, { status: 400 })
    }

    console.log(`📨 Message reçu : "${message.substring(0, 100)}..."`)

    // Créer le message dans le thread OpenAI
    await openai.beta.threads.messages.create(thread_id, {
      role: 'user',
      content: message
    })

    // Sauvegarder le message utilisateur dans Supabase
    if (conversation_id) {
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id,
          role: 'user',
          content: message
        })

      // Mettre à jour last_message_at
      await supabase
        .from('ai_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation_id)
    }

    // Lancer le run
    let run = await openai.beta.threads.runs.create(thread_id, {
      assistant_id
    })

    // Polling avec gestion des function calls
    let functionCallCount = 0
    const MAX_FUNCTION_CALLS = 5

    while (run.status !== 'completed' && functionCallCount < MAX_FUNCTION_CALLS) {
      run = await waitForRunCompletion(thread_id, run.id)

      if (run.status === 'requires_action') {
        const toolCalls = run.required_action?.submit_tool_outputs.tool_calls || []
        
        console.log(`🔧 ${toolCalls.length} fonction(s) à exécuter`)

        const toolOutputs = await Promise.all(
          toolCalls.map(async (tool) => {
            const result = await executeFunctionCall(
              tool.function.name,
              tool.function.arguments,
              supabase,
              user.id
            )

            // Logger l'action
            if (conversation_id) {
              await supabase.from('ai_actions').insert({
                conversation_id,
                action_type: tool.function.name,
                action_data: JSON.parse(tool.function.arguments),
                status: result.success ? 'completed' : 'failed',
                result,
                error_message: result.error || null,
                completed_at: new Date().toISOString()
              })
            }

            return {
              tool_call_id: tool.id,
              output: JSON.stringify(result)
            }
          })
        )

        // Soumettre les résultats via l'API REST directement (contournement du problème TypeScript)
        const response = await fetch(
          `https://api.openai.com/v1/threads/${thread_id}/runs/${run.id}/submit_tool_outputs`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
              'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({ tool_outputs: toolOutputs })
          }
        )
        
        if (!response.ok) {
          throw new Error(`Submit tool outputs failed: ${await response.text()}`)
        }
        
        run = await response.json()


        functionCallCount++
      }
    }

    if (functionCallCount >= MAX_FUNCTION_CALLS) {
      throw new Error('Too many function calls (possible loop)')
    }

    // Récupérer la réponse de l'assistant
    const messages = await openai.beta.threads.messages.list(thread_id, {
      order: 'desc',
      limit: 1
    })

    const assistantMessage = messages.data[0]
    
    if (!assistantMessage || assistantMessage.role !== 'assistant') {
      throw new Error('No assistant message found')
    }

    const textContent = assistantMessage.content.find(c => c.type === 'text')
    const responseText = textContent && textContent.type === 'text' ? textContent.text.value : ''

    // Sauvegarder la réponse dans Supabase
    if (conversation_id && responseText) {
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id,
          role: 'assistant',
          content: responseText,
          message_id: assistantMessage.id
        })
    }

    console.log(`✅ Réponse générée (${responseText.length} caractères)`)

    return NextResponse.json({
      success: true,
      message: responseText,
      message_id: assistantMessage.id
    })

  } catch (error) {
    console.error('❌ Erreur API /api/chat :', error)
    return NextResponse.json(
      { 
        error: 'Erreur traitement message', 
        details: error instanceof Error ? error.message : 'Unknown' 
      },
      { status: 500 }
    )
  }
}
