// API Chat simplifiée avec OpenAI Chat Completions (sans Assistants API)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// Instructions système pour l'IA
const SYSTEM_PROMPT = `Tu es un assistant IA spécialisé dans la gestion de devis BTP pour artisans français.

RÈGLES BTP :
- Mentions obligatoires : date, raison sociale, SIREN, client, détail prestations, prix HT/TTC, TVA
- TVA : 20% (normal), 10% (rénovation), 5.5% (efficacité énergétique)
- Unités : m² (surface), ml (longueur), u (unité), heure (main-d'œuvre)

FONCTIONS DISPONIBLES :
1. search_clients(query) - Recherche clients par nom/ville/téléphone
2. search_prices(query) - Recherche dans le catalogue de prix
3. create_client(nom, prenom, telephone, ville, email?, adresse?, code_postal?) - Crée un nouveau client
4. add_price(designation, prix_unitaire_ht, unite, categorie?, tva_taux?) - Ajoute un prix dans le catalogue
5. create_devis(client_id, lots, remise_pourcentage, acompte_pourcentage, statut) - Crée un devis
6. get_devis(numero_or_id) - Récupère un devis existant

COMPORTEMENT :
- Analyse automatique des demandes de devis
- Correction automatique des fautes
- Calculs automatiques (HT, TVA, TTC, remise, acompte)
- Mémoire conversationnelle (rappelle le contexte)
- Confirme toujours les actions importantes

STYLE :
- Professionnel mais accessible
- Utilise des emojis : 📋 devis, 👤 client, 💶 prix, ✅ succès
- Résume toujours les totaux avant validation

IMPORTANT : Utilise TOUJOURS les fonctions disponibles plutôt que de deviner.`

// Définition des fonctions pour le function calling
const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_clients',
      description: 'Recherche des clients existants par nom, prénom, téléphone ou ville',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Texte de recherche : nom, prénom, téléphone, ou ville'
          },
          limit: {
            type: 'number',
            description: 'Nombre maximum de résultats (défaut: 5)',
            default: 5
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_client',
      description: 'Crée un nouveau client dans la base de données. Utilisé quand le client n\'existe pas.',
      parameters: {
        type: 'object',
        properties: {
          nom: {
            type: 'string',
            description: 'Nom de famille du client'
          },
          prenom: {
            type: 'string',
            description: 'Prénom du client'
          },
          email: {
            type: 'string',
            description: 'Email du client (optionnel)'
          },
          telephone: {
            type: 'string',
            description: 'Téléphone du client'
          },
          adresse: {
            type: 'string',
            description: 'Adresse complète du client (optionnel)'
          },
          code_postal: {
            type: 'string',
            description: 'Code postal (optionnel)'
          },
          ville: {
            type: 'string',
            description: 'Ville du client'
          }
        },
        required: ['nom', 'prenom', 'telephone', 'ville']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_prices',
      description: 'Recherche dans le catalogue de prix par désignation ou catégorie',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Désignation ou mot-clé (ex: "peinture", "carrelage")'
          },
          limit: {
            type: 'number',
            description: 'Nombre maximum de résultats (défaut: 10)',
            default: 10
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_price',
      description: 'Ajoute un nouveau prix dans le catalogue. Utilisé pour enregistrer une nouvelle prestation ou un nouveau tarif.',
      parameters: {
        type: 'object',
        properties: {
          designation: {
            type: 'string',
            description: 'Désignation de la prestation (ex: "Peinture acrylique murs")'
          },
          prix_unitaire_ht: {
            type: 'number',
            description: 'Prix unitaire HT en euros'
          },
          unite: {
            type: 'string',
            description: 'Unité (m², ml, u, heure)'
          },
          categorie: {
            type: 'string',
            description: 'Catégorie de la prestation (ex: "Peinture", "Carrelage", "Plomberie")'
          },
          tva_taux: {
            type: 'number',
            description: 'Taux de TVA par défaut en % (20, 10, 5.5 ou 0)',
            default: 20
          }
        },
        required: ['designation', 'prix_unitaire_ht', 'unite']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_devis',
      description: 'Crée un nouveau devis avec calculs automatiques. IMPORTANT : Vérifier que le client existe via search_clients avant.',
      parameters: {
        type: 'object',
        properties: {
          client_id: {
            type: 'string',
            description: 'UUID du client (obtenu via search_clients)'
          },
          lots: {
            type: 'array',
            description: 'Lignes du devis',
            items: {
              type: 'object',
              properties: {
                designation: { type: 'string', description: 'Description de la prestation' },
                quantite: { type: 'number', description: 'Quantité' },
                unite: { type: 'string', description: 'Unité (m², ml, u, heure)' },
                prix_unitaire_ht: { type: 'number', description: 'Prix unitaire HT en euros' },
                tva_taux: { type: 'number', description: 'Taux TVA en % (20, 10, 5.5 ou 0)' }
              },
              required: ['designation', 'quantite', 'unite', 'prix_unitaire_ht', 'tva_taux']
            }
          },
          remise_pourcentage: {
            type: 'number',
            description: 'Remise en % (optionnel, défaut: 0)',
            default: 0
          },
          acompte_pourcentage: {
            type: 'number',
            description: 'Acompte en % (optionnel, défaut: 0)',
            default: 0
          },
          statut: {
            type: 'string',
            enum: ['brouillon', 'envoye'],
            description: 'Statut du devis',
            default: 'brouillon'
          }
        },
        required: ['client_id', 'lots']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_devis',
      description: 'Récupère un devis existant par son numéro (ex: DEV-2026-003) ou UUID',
      parameters: {
        type: 'object',
        properties: {
          numero_or_id: {
            type: 'string',
            description: 'Numéro du devis (ex: "DEV-2026-003") ou UUID'
          }
        },
        required: ['numero_or_id']
      }
    }
  }
]

// Exécution des fonctions
async function executeFunctionCall(
  functionName: string,
  args: any,
  supabase: any,
  userId: string
) {
  console.log(`🔧 Exécution : ${functionName}`, args)

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
        return { success: true, clients: clients || [], count: clients?.length || 0 }
      }

      case 'create_client': {
        const { nom, prenom, email, telephone, adresse, code_postal, ville } = args
        
        const { data: client, error } = await supabase
          .from('clients')
          .insert({
            user_id: userId,
            nom,
            prenom,
            email: email || '',
            telephone,
            adresse: adresse || '',
            code_postal: code_postal || '',
            ville
          })
          .select()
          .single()

        if (error) throw error
        return {
          success: true,
          client: {
            id: client.id,
            nom: client.nom,
            prenom: client.prenom,
            ville: client.ville,
            telephone: client.telephone
          }
        }
      }

      case 'search_prices': {
        const { query, limit = 10 } = args
        const searchPattern = `%${query.trim()}%`
        
        const { data: prices, error } = await supabase
          .from('base_prix')
          .select('id, designation, unite, prix_unitaire_ht, tva_taux, categorie')
          .eq('user_id', userId)
          .or(`designation.ilike.${searchPattern},categorie.ilike.${searchPattern}`)
          .order('usage_count', { ascending: false })
          .limit(Math.min(Number(limit), 50))

        if (error) throw error
        return { success: true, prices: prices || [], count: prices?.length || 0 }
      }

      case 'add_price': {
        const { designation, prix_unitaire_ht, unite, categorie = 'Autre', tva_taux = 20 } = args
        
        const { data: price, error } = await supabase
          .from('base_prix')
          .insert({
            user_id: userId,
            designation,
            prix_unitaire_ht: parseFloat(prix_unitaire_ht),
            unite,
            categorie,
            tva_taux: parseFloat(tva_taux),
            usage_count: 0
          })
          .select()
          .single()

        if (error) throw error
        return {
          success: true,
          price: {
            id: price.id,
            designation: price.designation,
            prix_unitaire_ht: price.prix_unitaire_ht,
            unite: price.unite,
            categorie: price.categorie,
            tva_taux: price.tva_taux
          }
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

        // Vérifier que le client existe
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', client_id)
          .eq('user_id', userId)
          .single()

        if (clientError || !client) {
          throw new Error('Client non trouvé')
        }

        // Récupérer les paramètres artisan
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

        // Générer le numéro de devis
        const year = new Date().getFullYear()
        const { count: devisCount } = await supabase
          .from('devis')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .like('numero', `DEV-${year}-%`)

        const nextNumber = (devisCount || 0) + 1
        const numero = `DEV-${year}-${String(nextNumber).padStart(3, '0')}`

        // Créer le devis
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
            total_ht: devis.total_ht,
            total_ttc: devis.total_ttc,
            acompte_montant: devis.acompte_montant,
            statut: devis.statut
          }
        }
      }

      case 'get_devis': {
        const { numero_or_id } = args
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(numero_or_id)

        let query = supabase.from('devis').select('*').eq('user_id', userId)
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
            client_nom: `${devis.client_prenom} ${devis.client_nom}`,
            lots: devis.lots,
            total_ht: devis.total_ht,
            total_ttc: devis.total_ttc,
            statut: devis.statut
          }
        }
      }

      default:
        throw new Error(`Fonction inconnue : ${functionName}`)
    }
  } catch (error) {
    console.error(`❌ Erreur ${functionName}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * POST /api/chat/simple
 * Version simplifiée avec Chat Completions (pas d'Assistants API)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { message, conversation_id } = body

    if (!message) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 })
    }

    console.log(`📨 Message : "${message.substring(0, 100)}..."`)

    // Récupérer l'historique de conversation
    let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ]

    if (conversation_id) {
      const { data: history } = await supabase
        .from('ai_messages')
        .select('role, content')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: true })
        .limit(20) // Derniers 20 messages

      if (history) {
        messages.push(...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })))
      }
    }

    // Ajouter le nouveau message
    messages.push({ role: 'user', content: message })

    // Sauvegarder le message utilisateur
    if (conversation_id) {
      await supabase.from('ai_messages').insert({
        conversation_id,
        role: 'user',
        content: message
      })
    }

    // Appel OpenAI avec function calling
    let response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.7
    })

    let assistantMessage = response.choices[0].message

    // Gérer les function calls (max 5 itérations)
    let functionCallCount = 0
    const MAX_FUNCTION_CALLS = 5

    while (assistantMessage.tool_calls && functionCallCount < MAX_FUNCTION_CALLS) {
      console.log(`🔧 ${assistantMessage.tool_calls.length} fonction(s) à exécuter`)

      // Ajouter le message de l'assistant avec tool_calls
      messages.push(assistantMessage)

      // Exécuter les fonctions
      const toolResults = await Promise.all(
        assistantMessage.tool_calls.map(async (toolCall: any) => {
          const result = await executeFunctionCall(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments),
            supabase,
            user.id
          )

          return {
            role: 'tool' as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          }
        })
      )

      // Ajouter les résultats
      messages.push(...toolResults)

      // Nouvel appel avec les résultats
      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.7
      })

      assistantMessage = response.choices[0].message
      functionCallCount++
    }

    const finalResponse = assistantMessage.content || 'Désolé, je n\'ai pas pu générer de réponse.'

    // Sauvegarder la réponse
    if (conversation_id) {
      await supabase.from('ai_messages').insert({
        conversation_id,
        role: 'assistant',
        content: finalResponse
      })

      await supabase
        .from('ai_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation_id)
    }

    console.log(`✅ Réponse générée (${finalResponse.length} caractères)`)

    return NextResponse.json({
      success: true,
      message: finalResponse
    })

  } catch (error) {
    console.error('❌ Erreur /api/chat/simple :', error)
    return NextResponse.json(
      { error: 'Erreur traitement message', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
