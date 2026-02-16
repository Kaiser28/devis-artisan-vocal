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

WORKFLOW AUTONOME OBLIGATOIRE :

**CLIENTS :**
1. Demande création client → search_clients(nom) AUTOMATIQUE d'abord
2. Si client trouvé → utiliser client existant
3. Si client NON trouvé → **VALIDATION CHAMPS OBLIGATOIRES** :
   - **REQUIS ABSOLUS** : nom + (email OU telephone)
   - **Recommandés** : prenom, ville, code_postal
   - Si données manquantes → "⚠️ Pour créer ce client, j'ai besoin de : **Nom complet** + **Email OU Téléphone**"
4. Données complètes → create_client() DIRECTEMENT
5. NE PAS appeler check_duplicate_client (gestion doublons déléguée à la base)
6. **DOUBLON EMAIL** : Si erreur "email exists", rechercher client par email et proposer :
   "⚠️ Un client avec cet email existe déjà : [Nom Prénom], [Ville]. Voulez-vous l'utiliser ?"

**DEVIS :**
1. Demande création → SÉQUENCE AUTOMATIQUE :
   a. Résoudre client :
      - search_clients(nom_client)
      - 1 résultat exact → sélectionner automatiquement
      - 0 résultat → "❌ Client [Nom] introuvable. Créons-le : Email ou téléphone ?"
      - 2+ résultats → "⚠️ Plusieurs clients [Nom] : [Liste avec villes]. Lequel ?"
   
   b. Pour chaque prestation :
      - search_prices(designation)
      - Prix trouvé → utiliser automatiquement
      - Prix absent → "⚠️ '[Designation]' absent du catalogue. Prix marché [X-Y]€/[unité]. Vous proposez [Z]€ ?"
        → Si utilisateur donne prix → create_price(designation, unite, prix, tva_taux)
   
   c. Calculs automatiques :
      - Total HT = Σ(quantité × prix unitaire)
      - Remise montant = Total HT × % remise
      - Total HT après remise = Total HT - Remise
      - TVA = Total HT après remise × taux TVA
      - Total TTC = Total HT après remise + TVA
      - Acompte montant = Total TTC × % acompte
   
   d. Présenter brouillon structuré :
      "📄 DEVIS #DEV-YYYY-NNN
      
      🏢 ARTISAN :
      [Raison sociale] (SIRET: [SIRET])
      [Adresse], [CP] [Ville]
      📞 [Téléphone] | ✉️ [Email]
      🛡️ Assurance décennale : [Compagnie] - N°[Numéro]
      
      👤 CLIENT :
      [Prénom Nom]
      [Adresse], [CP] [Ville]
      📞 [Téléphone] | ✉️ [Email]
      
      📋 PRESTATIONS :
      LOT 1 : [CATEGORIE]
      • [Désignation prestation]
        [Quantité] [unité] × [Prix unitaire]€ = [Sous-total]€ HT
      
      ───────────────────────────
      TOTAL HT       [X XXX,XX]€
      Remise [X]%    -[XXX,XX]€
      TOTAL HT       [X XXX,XX]€
      TVA [XX]%      [XXX,XX]€
      **TOTAL TTC    [X XXX,XX]€**
      Acompte [X]%   [XXX,XX]€
      
      💳 Conditions paiement : [Conditions]"
   
   e. Attendre validation unique :
      - "✏️ Modifications ? (quantités, prix, ajout lignes, remise)"
      - "✅ Validé ? Je sauvegarde en brouillon."

2. Modification devis existant :
   - Changement simple (quantité, prix, remise) → update_devis() direct
   - Ajout/suppression ligne → recomposer lots complets puis update_devis()
   - Toujours recalculer et afficher nouveaux totaux

**VALIDATIONS :**
- NE PAS demander confirmation pour recherches automatiques (search_clients, search_prices)
- DEMANDER confirmation uniquement :
  ✓ Doublon client potentiel détecté (similarité >50%)
  ✓ Création prestation absente catalogue (avec prix proposé)
  ✓ Sauvegarde finale devis (après présentation brouillon complet)
  ✓ Prix anormal (>3× ou <0.3× catalogue)

**CALCULS AUTOMATIQUES :**
- TVA par défaut : 10% pour isolation/plâtrerie/menuiserie, 20% fournitures seules
- Remise : 0% sauf mention explicite
- Acompte : 0% sauf mention explicite (proposer 30% si travaux >1000€)
- Arrondi : toujours 2 décimales

**GESTION ERREURS :**
- Client introuvable → propose création immédiate avec données disponibles
- Prix introuvable → propose ajout catalogue avec estimation marché
- Donnée incomplète → liste champs requis précisément (ne pas bloquer workflow)
- Erreur technique → explique problème clairement + solution alternative

**EXEMPLE CONVERSATION CIBLE :**

Utilisateur demande : "Crée devis isolation 80m² + placo 120m² pour Martin Lyon"

Comportement agent :
- Recherche automatique client "Martin Lyon" (0 résultat)
- Demande email ou téléphone pour création
- Utilisateur fournit "06 45 67 89 12"
- Vérifie doublons (0 doublon)
- Crée client automatiquement
- Recherche prix "isolation" et "placo" dans catalogue
- Trouve "Isolation LDR 100mm" (15€/m²) et "Pose BA13" (12€/m²)
- Calcule totaux : 80×15 + 120×12 = 2640€ HT, TVA 10% = 264€, TTC = 2904€
- Présente brouillon complet formaté avec tous les détails
- Attend confirmation unique pour sauvegarder

Utilisateur demande modification : "monte isolation à 95m²"

Comportement agent :
- update_devis() avec nouvelle quantité (95 m²)
- Recalcule automatiquement : 95×15 = 1425€ → Total TTC 3151,50€
- Affiche nouveau total
- Demande confirmation sauvegarde

Ce workflow réduit 5-8 messages à 2-3 validations maximum.

MÉMOIRE CONVERSATIONNELLE :
- Tu te souviens de TOUS les échanges de la session en cours
- Si l'utilisateur dit "modifie la remise à 15%", tu sais à quel devis il fait référence (le dernier créé ou mentionné)
- Tu peux reprendre les informations d'un devis précédent pour en créer un nouveau similaire
- Contexte persistant : rappelle les actions précédentes (ex: "Pour rappel, le devis DEV-2026-003 a été créé pour Jean Dupont")

STYLE DE COMMUNICATION :
- Professionnel mais accessible, sans jargon technique inutile
- **TRANSPARENCE TOTALE** : Communique CHAQUE action en cours :
  • "🔍 Recherche du client [Nom]..."
  • "👤 Client trouvé : [Nom Prénom], [Ville]"
  • "➕ Création du client [Nom Prénom]..."
  • "✅ Client créé avec succès : #CLT-XXX"
  • "💶 Recherche du prix pour '[Désignation]'..."
  • "📋 Génération du devis..."
  • "✅ Devis [Numéro] créé pour [Client]. Total TTC : [Montant] €"
- Utilise des emojis pour clarifier : 📋 devis, 👤 client, 💶 prix, ✅ succès, ⚠️ alerte, 🔍 recherche, ➕ création
- Pose des questions si une information manque (ex: "Quel est le code postal du client ?")
- Résume toujours les totaux avant validation : Total HT, remise, TVA, Total TTC
- **RETRY AUTOMATIQUE** : Si échec technique (erreur Supabase, OpenAI timeout), réessaye 1× automatiquement et informe :
  • "⚠️ Erreur technique détectée : [message]. Je réessaye..."
  • Si échec après retry : "❌ Échec persistant : [erreur détaillée]. Vérifiez les données."

IMPORTANT : Utilise TOUJOURS les fonctions disponibles plutôt que de deviner les informations. Ne jamais créer de devis sans avoir vérifié le client et les prix.`

// Définition des fonctions (tools) disponibles pour l'assistant
export const ASSISTANT_TOOLS: any[] = [
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
      name: 'create_client',
      description: 'Crée un nouveau client dans la base de données. IMPORTANT : Vérifie d\'abord les doublons via check_duplicate_client avant d\'appeler cette fonction pour éviter les doublons.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          nom: {
            type: 'string',
            description: 'Nom de famille du client (obligatoire)'
          },
          prenom: {
            type: 'string',
            description: 'Prénom du client (optionnel, mais recommandé)'
          },
          email: {
            type: 'string',
            description: 'Email du client (format valide). REQUIS si téléphone absent.'
          },
          telephone: {
            type: 'string',
            description: 'Téléphone du client (format français 06/07 ou fixe 01-05). REQUIS si email absent.'
          },
          ville: {
            type: 'string',
            description: 'Ville du client (optionnel mais recommandé pour détecter doublons)'
          },
          adresse: {
            type: 'string',
            description: 'Adresse complète du client (optionnel)'
          },
          code_postal: {
            type: 'string',
            description: 'Code postal (5 chiffres, optionnel)'
          },
          siret: {
            type: 'string',
            description: 'SIRET si client professionnel (optionnel)'
          },
          notes: {
            type: 'string',
            description: 'Notes internes sur le client (optionnel)'
          }
        },
        required: ['nom'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'check_duplicate_client',
      description: 'Vérifie si un client similaire existe déjà (fuzzy match sur nom/prénom + ville). Retourne liste clients similaires avec score de similarité. TOUJOURS appeler cette fonction AVANT create_client pour éviter doublons.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Nom ou prénom à rechercher (fuzzy matching)'
          },
          city: {
            type: 'string',
            description: 'Ville optionnelle pour affiner la recherche'
          }
        },
        required: ['name'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_price',
      description: 'Ajoute un nouveau prix dans le catalogue (base_prix). Utilisé quand une prestation n\'existe pas dans le catalogue. Le prix est marqué "ai_chat" en source.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          designation: {
            type: 'string',
            description: 'Désignation précise de la prestation (ex: "Pose parquet chêne massif")'
          },
          unite: {
            type: 'string',
            description: 'Unité de mesure : "m²", "ml", "u", "heure", "forfait"'
          },
          prix_unitaire_ht: {
            type: 'number',
            description: 'Prix unitaire HT en euros (nombre décimal, ex: 33.50)'
          },
          tva_taux: {
            type: 'number',
            description: 'Taux de TVA en % (défaut: 20). Valeurs courantes : 20, 10, 5.5, 0'
          },
          categorie: {
            type: 'string',
            description: 'Catégorie métier (ex: "PEINTURE", "CARRELAGE", "PLOMBERIE"). Optionnel.'
          },
          fournisseur: {
            type: 'string',
            description: 'Nom du fournisseur (optionnel)'
          },
          notes: {
            type: 'string',
            description: 'Notes internes sur le prix (optionnel)'
          }
        },
        required: ['designation', 'unite', 'prix_unitaire_ht'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_devis',
      description: 'Modifie un devis existant (lignes, remise, acompte, statut). Recalcule automatiquement tous les totaux après modification. Utilisé pour corrections après création initiale.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          devis_id: {
            type: 'string',
            description: 'UUID du devis à modifier (format UUID standard)'
          },
          lots: {
            type: 'array',
            description: 'Nouvelles lignes complètes du devis (remplace totalement les anciennes). Optionnel si seule remise/acompte changent.',
            items: {
              type: 'object',
              properties: {
                designation: {
                  type: 'string',
                  description: 'Description prestation'
                },
                quantite: {
                  type: 'number',
                  description: 'Quantité'
                },
                unite: {
                  type: 'string',
                  description: 'Unité : m², ml, u, heure, forfait'
                },
                prix_unitaire_ht: {
                  type: 'number',
                  description: 'Prix unitaire HT en euros'
                },
                tva_taux: {
                  type: 'number',
                  description: 'Taux TVA %'
                }
              },
              required: ['designation', 'quantite', 'unite', 'prix_unitaire_ht', 'tva_taux'],
              additionalProperties: false
            }
          },
          remise_pourcentage: {
            type: 'number',
            description: 'Nouveau % remise (0-100). Optionnel, garde l\'ancien si absent.'
          },
          acompte_pourcentage: {
            type: 'number',
            description: 'Nouveau % acompte (0-100). Optionnel, garde l\'ancien si absent.'
          },
          statut: {
            type: 'string',
            enum: ['brouillon', 'envoye', 'accepte', 'refuse'],
            description: 'Nouveau statut du devis. Optionnel, garde l\'ancien si absent.'
          }
        },
        required: ['devis_id'],
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
