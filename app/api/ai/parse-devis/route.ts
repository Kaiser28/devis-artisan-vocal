import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface ParsedDevis {
  client: {
    nom: string
    prenom: string
    telephone: string | null
    adresse: string | null
    code_postal: string | null
    ville: string | null
    client_existant: boolean
    client_id: string | null
  }
  lots: Array<{
    designation: string
    quantite: number
    unite: string
    prix_unitaire_ht: number | null
    prix_suggere: number | null
    source: 'manuel' | 'catalogue'
    tva_taux: number
    alerte: string | null
  }>
  remise_pourcentage: number | null
  acompte_pourcentage: number | null
  notes: string | null
  alertes: string[]
}

export async function POST(req: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const { transcript } = await req.json()

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: 'Transcript vide' }, { status: 400 })
    }

    // Récupérer le catalogue de prix de l'utilisateur
    const { data: basePrix } = await supabase
      .from('base_prix')
      .select('designation, categorie, unite, prix_unitaire_ht, tva_taux, fournisseur, usage_count')
      .eq('user_id', user.id)
      .order('usage_count', { ascending: false })
      .limit(100)

    // Récupérer les clients existants
    const { data: clients } = await supabase
      .from('clients')
      .select('id, nom, prenom, email, telephone, adresse, code_postal, ville')
      .eq('user_id', user.id)
      .limit(50)

    // Construire le contexte catalogue
    const catalogueContext = basePrix && basePrix.length > 0
      ? `CATALOGUE DE PRIX DE L'ARTISAN (${basePrix.length} références) :\n\n` +
        basePrix.map(p => 
          `- ${p.designation} (${p.categorie || 'Divers'}) : ${p.prix_unitaire_ht}€/${p.unite}, TVA ${p.tva_taux}%${p.fournisseur ? ` [${p.fournisseur}]` : ''} [Utilisé ${p.usage_count || 0}x]`
        ).join('\n')
      : 'CATALOGUE VIDE : Aucun prix enregistré.'

    // Construire le contexte clients
    const clientsContext = clients && clients.length > 0
      ? `CLIENTS CONNUS (${clients.length} clients) :\n\n` +
        clients.map(c => 
          `- ${c.prenom} ${c.nom}, ${c.adresse || ''} ${c.code_postal || ''} ${c.ville || ''}, Tél: ${c.telephone || 'N/A'}, Email: ${c.email || 'N/A'} [ID: ${c.id}]`
        ).join('\n')
      : 'AUCUN CLIENT ENREGISTRÉ.'

    // Prompt système avec expertise BTP
    const systemPrompt = `Tu es un assistant intelligent spécialisé dans le BTP français. Tu dois extraire des informations structurées depuis la dictée vocale d'un artisan pour créer un devis conforme aux règles de l'art.

${catalogueContext}

${clientsContext}

RÈGLES D'EXTRACTION :

1. CLIENT :
   - Si nom/prénom mentionné → chercher dans CLIENTS CONNUS (correspondance floue acceptée)
   - Si trouvé → utiliser toutes ses données (adresse, téléphone, email) et indiquer client_existant=true + client_id
   - Si nouveau → extraire toutes infos mentionnées, client_existant=false, client_id=null
   - Format téléphone : normaliser en 10 chiffres sans espaces (0612345678)
   - Si "Monsieur" ou "Madame" sans prénom → extraire uniquement le nom

2. LIGNES DE DEVIS (LOTS) :
   - Chaque ligne = désignation + quantité + unité + prix_unitaire_ht
   - Unités BTP standard : m² (mètres carrés), m (mètres linéaires), heure, unité, kg, litre
   - Si prix NON mentionné → chercher dans CATALOGUE (correspondance floue sur désignation)
   - Si trouvé dans catalogue → utiliser prix_suggere + source="catalogue"
   - Si prix mentionné → utiliser prix_unitaire_ht + source="manuel"
   - Si désignation vague → utiliser désignation exacte du CATALOGUE (ex: "peinture" → "Peinture acrylique blanc mat")
   - Si unité manquante → déduire du CATALOGUE ou des standards BTP :
     * Peinture, enduit, carrelage, parquet → m²
     * Plomberie, électricité, menuiserie → m ou heure
     * Main d'œuvre → heure
   - TVA par défaut :
     * Travaux neufs / construction → 20%
     * Rénovation/amélioration locaux > 2 ans → 10%
     * Rénovation énergétique → 5.5%
     * Défaut si non précisé → 20%

3. CORRECTIONS AUTOMATIQUES (sans confirmation) :
   - Orthographe : "pinte" → "peinture", "careau" → "carrelage", "placo" → "plâtre", "elec" → "électricité"
   - Noms clients : chercher correspondance floue dans CLIENTS CONNUS (ex: "Dupon" → "Dupont")
   - Unités : "mètre carré" → "m²", "mètres carrés" → "m²", "heures" → "heure", "m2" → "m²"
   - Prix : normaliser "12 euros 50" → 12.50, "trente-cinq euros" → 35.00

4. ALERTES (signaler mais ne pas bloquer) :
   - Prix anormal : si prix manuel > 3× ou < 0.3× prix catalogue → alerte sur la ligne
   - Unité incohérente : ex "carrelage en kg" → alerte + correction automatique vers m²
   - Désignation très vague : ex "travaux" sans précision → alerte
   - Client introuvable : si nom mentionné mais pas dans CLIENTS CONNUS → alerte globale

5. REMISE / ACOMPTE :
   - Si "remise de X%" → extraire X
   - Si "acompte de X%" → extraire X  
   - Si montant en euros → convertir en % du total estimé
   - Standard BTP : acompte 30% si non précisé

6. NOTES :
   - Toute information supplémentaire non structurée (ex: "client préfère marque Dulux", "travaux à faire en urgence")

FORMAT JSON STRICT (OBLIGATOIRE) :
{
  "client": {
    "nom": string,
    "prenom": string,
    "telephone": string | null,
    "adresse": string | null,
    "code_postal": string | null,
    "ville": string | null,
    "client_existant": boolean,
    "client_id": string | null
  },
  "lots": [
    {
      "designation": string,
      "quantite": number,
      "unite": string,
      "prix_unitaire_ht": number | null,
      "prix_suggere": number | null,
      "source": "manuel" | "catalogue",
      "tva_taux": number,
      "alerte": string | null
    }
  ],
  "remise_pourcentage": number | null,
  "acompte_pourcentage": number | null,
  "notes": string | null,
  "alertes": string[]
}

IMPORTANT :
- TOUJOURS retourner un JSON valide, même si transcript incomplet
- Si client non mentionné → laisser champs à null sauf nom/prenom (mettre "Client" / "Non précisé")
- Si aucune ligne → lots = []
- Si incertitude → utiliser catalogue comme référence prioritaire
- Privilégier les prix du catalogue (plus fiables que vocal)
- Corriger automatiquement sans demander confirmation`

    // Appel OpenAI GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Voici la dictée vocale de l'artisan :\n\n"${transcript}"\n\nExtrait les informations structurées pour créer le devis.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Bas pour cohérence
      max_tokens: 2000
    })

    const parsedContent = completion.choices[0].message.content
    
    if (!parsedContent) {
      throw new Error('Réponse IA vide')
    }

    const parsedDevis: ParsedDevis = JSON.parse(parsedContent)

    // Validation basique
    if (!parsedDevis.client || !parsedDevis.lots) {
      throw new Error('Format de réponse IA invalide')
    }

    return NextResponse.json({ 
      success: true,
      data: parsedDevis 
    })

  } catch (error: any) {
    console.error('Erreur parsing AI:', error)
    return NextResponse.json({ 
      error: error.message || 'Erreur lors du parsing IA',
      details: error.toString()
    }, { status: 500 })
  }
}
