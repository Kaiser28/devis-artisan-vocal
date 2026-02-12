// Configuration de l'Assistant OpenAI pour la gestion de devis BTP
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// Instructions système de l'assistant (référence forums + best practices)
export const ASSISTANT_INSTRUCTIONS = `Tu es un assistant IA spécialisé dans la gestion de devis BTP pour artisans français.

CONTEXTE MÉTIER :
- L'utilisateur est un artisan du bâtiment (peinture, carrelage, plomberie, électricité, etc.)
- Tu dois l'aider à créer, modifier, envoyer des devis conformes à la réglementation française
- Tu as accès au catalogue de prix, à la liste des clients et aux devis existants

RÈGLES DE L'ART BTP :
- Mentions obligatoires (16) : date, raison sociale, SIREN, client, détail prestations, prix HT/TTC, TVA, durée validité, conditions paiement
- TVA : 20% (taux normal), 10% (travaux rénovation), 5.5% (efficacité énergétique), 0% (auto-entrepreneur en franchise base TVA)
- Unités standards : m² (surface), ml (longueur linéaire), u (unité), heure (main-d'œuvre)
- Structure : toujours détailler chaque lot avec quantité + unité + prix unitaire

COMPORTEMENT :
1. **Analyse automatique** : dès qu'un message contient une demande de devis, extrais les informations (client, prestations, quantités, prix)
2. **Correction automatique** : corrige les fautes d'orthographe, normalise les unités (ex: "mètre carré" → "m²", "heure" → "heure")
3. **Recherche intelligente** :
   - Client : recherche par nom/prénom (fuzzy matching), propose les correspondances
   - Prix : recherche dans le catalogue par désignation (ex: "peinture" → "Peinture acrylique")
4. **Calculs automatiques** : 
   - Total HT = Σ(quantité × prix unitaire)
   - TVA = Total HT × taux TVA
   - Total TTC = Total HT + TVA
   - Remise = Total HT × % remise
   - Acompte = Total TTC × % acompte
5. **Alertes qualité** :
   - Prix > 3× ou < 0.3× catalogue → alerte "⚠️ Prix anormal détecté"
   - Client inconnu → propose "Voulez-vous créer un nouveau client ?"
   - Unité incohérente → suggère correction (ex: "carrelage en heure" → suggérer "m²")

MÉMOIRE CONVERSATIONNELLE :
- Tu te souviens de TOUS les échanges de la session en cours
- Si l'utilisateur dit "modifie la remise à 15%", tu sais à quel devis il fait référence (le dernier créé ou mentionné)
- Tu peux reprendre les informations d'un devis précédent pour en créer un nouveau similaire
- Contexte persistant : rappelle les actions précédentes (ex: "Pour rappel, le devis DEV-2026-003 a été créé pour Jean Dupont")

STYLE DE COMMUNICATION :
- Professionnel mais accessible, sans jargon technique inutile
- Confirme TOUJOURS les actions importantes (ex: "✅ Devis DEV-2026-003 créé pour Jean Dupont. Total TTC : 1 431 €")
- Utilise des emojis pour clarifier : 📋 devis, 👤 client, 💶 prix, ✅ succès, ⚠️ alerte, 🔍 recherche
- Pose des questions si une information manque (ex: "Quel est le code postal du client ?")
- Résume toujours les totaux avant validation : Total HT, remise, TVA, Total TTC

GESTION DES ERREURS :
- Si une fonction échoue, explique clairement le problème et propose une solution
- Si un client n'existe pas, propose de le créer ou de fournir plus d'informations
- Si un prix semble anormal, demande confirmation avant de créer le devis

EXEMPLE D'INTERACTION :
User: "Devis pour Dupont, 50 m² peinture, 20 m² carrelage, remise 10%"
Assistant: "🔍 Recherche du client Dupont...
✅ Client trouvé : Jean Dupont (06 12 34 56 78, Versailles 78000)
📋 Lignes du devis :
• Peinture acrylique : 50 m² × 12,50 € = 625 € HT (TVA 20%)
• Carrelage grès cérame : 20 m² × 35,00 € = 700 € HT (TVA 20%)

💰 Totaux :
Total HT : 1 325 €
Remise 10% : -132,50 €
Total HT après remise : 1 192,50 €
TVA 20% : 238,50 €
**Total TTC : 1 431 €**

Voulez-vous créer ce devis ?"

IMPORTANT : Utilise TOUJOURS les fonctions disponibles (search_clients, search_prices, create_devis) plutôt que de deviner les informations.`

// Définition des fonctions (tools) disponibles pour l'assistant
export const ASSISTANT_TOOLS: OpenAI.Beta.AssistantCreateParams.AssistantToolsFunction[] = [
  {
    type: 'function',
    function: {
      name: 'search_clients',
      description: 'Recherche des clients existants par nom, prénom, téléphone ou ville. Utilisé pour auto-complétion avant création devis. Retourne une liste de clients correspondants avec leurs coordonnées complètes.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Texte de recherche : nom, prénom, téléphone, ou ville du client'
          },
          limit: {
            type: 'number',
            description: 'Nombre maximum de résultats à retourner (défaut: 5, max: 20)'
          }
        },
        required: ['query'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_prices',
      description: 'Recherche dans le catalogue de prix (base_prix) par désignation, catégorie ou fournisseur. Retourne prix unitaire HT, taux TVA, unité standard, et informations complémentaires.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Désignation ou mot-clé de recherche (ex: "peinture", "carrelage", "plomberie")'
          },
          limit: {
            type: 'number',
            description: 'Nombre maximum de résultats à retourner (défaut: 10, max: 50)'
          }
        },
        required: ['query'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_devis',
      description: 'Crée un nouveau devis dans la base de données. Génère automatiquement le numéro (format DEV-YYYY-XXX), calcule tous les totaux (HT, TVA, TTC, remise, acompte). IMPORTANT : Vérifie d\'abord que le client existe via search_clients, sinon la création échouera.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          client_id: {
            type: 'string',
            description: 'UUID du client (obtenu via search_clients). OBLIGATOIRE : le client doit exister en base.'
          },
          lots: {
            type: 'array',
            description: 'Lignes du devis (prestations). Minimum 1 ligne, maximum 50 lignes.',
            items: {
              type: 'object',
              properties: {
                designation: {
                  type: 'string',
                  description: 'Description précise de la prestation (ex: "Peinture acrylique blanc mat")'
                },
                quantite: {
                  type: 'number',
                  description: 'Quantité (nombre décimal, ex: 50.5)'
                },
                unite: {
                  type: 'string',
                  description: 'Unité de mesure : "m²", "ml", "u", "heure", "forfait"'
                },
                prix_unitaire_ht: {
                  type: 'number',
                  description: 'Prix unitaire HT en euros (nombre décimal, ex: 12.50)'
                },
                tva_taux: {
                  type: 'number',
                  description: 'Taux de TVA en % : 20 (normal), 10 (rénovation), 5.5 (efficacité énergétique), ou 0 (franchise)'
                }
              },
              required: ['designation', 'quantite', 'unite', 'prix_unitaire_ht', 'tva_taux'],
              additionalProperties: false
            }
          },
          remise_pourcentage: {
            type: 'number',
            description: 'Remise commerciale globale en % (optionnel, défaut: 0). Valeur entre 0 et 100.'
          },
          acompte_pourcentage: {
            type: 'number',
            description: 'Acompte demandé en % du TTC (optionnel, défaut: 0). Valeur entre 0 et 100.'
          },
          conditions_paiement: {
            type: 'string',
            description: 'Conditions de paiement personnalisées (optionnel, ex: "Paiement à 30 jours fin de mois", "Chèque ou virement bancaire")'
          },
          statut: {
            type: 'string',
            enum: ['brouillon', 'envoye'],
            description: 'Statut du devis : "brouillon" (sauvegarde simple) ou "envoye" (création + changement statut pour envoi ultérieur)'
          }
        },
        required: ['client_id', 'lots'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_devis',
      description: 'Récupère les détails complets d\'un devis existant par son numéro (ex: DEV-2026-003) ou son UUID. Retourne toutes les informations : client, lignes, totaux, statut, dates.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          numero_or_id: {
            type: 'string',
            description: 'Numéro du devis (ex: "DEV-2026-003") ou UUID (ex: "123e4567-e89b-12d3-a456-426614174000")'
          }
        },
        required: ['numero_or_id'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'send_devis_email',
      description: 'Envoie le devis par email au client avec le PDF en pièce jointe. ATTENTION : Le devis doit exister et avoir un statut valide ("envoye", "accepte" ou "brouillon"). Le statut passera automatiquement à "envoye" après l\'envoi.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          devis_id: {
            type: 'string',
            description: 'UUID du devis à envoyer (format UUID standard)'
          },
          custom_message: {
            type: 'string',
            description: 'Message personnalisé à inclure dans l\'email (optionnel). Exemple : "Merci de votre confiance. N\'hésitez pas à me contacter pour toute question."'
          }
        },
        required: ['devis_id'],
        additionalProperties: false
      }
    }
  }
]

// Fonction pour créer ou récupérer l'assistant
export async function getOrCreateAssistant(): Promise<OpenAI.Beta.Assistant> {
  const assistantName = 'Devis BTP Assistant'
  
  try {
    // Vérifier si un assistant existe déjà (stocké en variable d'environnement)
    if (process.env.OPENAI_ASSISTANT_ID) {
      try {
        const assistant = await openai.beta.assistants.retrieve(process.env.OPENAI_ASSISTANT_ID)
        console.log('✅ Assistant existant récupéré :', assistant.id)
        return assistant
      } catch (error) {
        console.warn('⚠️  Assistant ID invalide, création d\'un nouveau...')
      }
    }

    // Créer un nouvel assistant
    const assistant = await openai.beta.assistants.create({
      name: assistantName,
      instructions: ASSISTANT_INSTRUCTIONS,
      model: 'gpt-4o-mini',
      tools: ASSISTANT_TOOLS,
      temperature: 0.7, // Un peu de créativité pour les formulations
      metadata: {
        version: '1.0',
        created_at: new Date().toISOString()
      }
    })

    console.log('✅ Nouvel assistant créé :', assistant.id)
    console.log('💡 Ajoutez cette variable à .env.local :')
    console.log(`OPENAI_ASSISTANT_ID=${assistant.id}`)

    return assistant
  } catch (error) {
    console.error('❌ Erreur création assistant :', error)
    throw error
  }
}

// Fonction pour créer un nouveau thread (conversation)
export async function createThread(): Promise<string> {
  try {
    const thread = await openai.beta.threads.create()
    console.log('✅ Thread créé :', thread.id)
    return thread.id
  } catch (error) {
    console.error('❌ Erreur création thread :', error)
    throw error
  }
}

// Export du client OpenAI pour usage direct si besoin
export { openai }
