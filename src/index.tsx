import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/api/*', cors())

// Route API pour l'assistant IA
app.post('/api/ai-assistant', async (c) => {
  try {
    const { prompt, apiKey, conversationHistory } = await c.req.json()
    
    if (!apiKey) {
      return c.json({ error: 'Clé API OpenAI non configurée. Ajoutez-la dans les paramètres.' }, 400)
    }
    
    if (!prompt || prompt.trim() === '') {
      return c.json({ error: 'Aucun texte fourni' }, 400)
    }
    
    // Construire l'historique des messages
    const messages = [
      {
        role: 'system',
            content: `Tu es un assistant expert en BTP qui aide les artisans à construire des devis détaillés et professionnels avec des PRIX RÉALISTES du marché français 2024-2025.

🎯 MODE CONVERSATIONNEL INTELLIGENT :
Tu dois d'abord POSER DES QUESTIONS pour collecter les informations manquantes, puis générer un devis précis.

⚠️⚠️⚠️ RÈGLE ABSOLUE : TU DOIS TOUJOURS RÉPONDRE EN FORMAT JSON ⚠️⚠️⚠️
JAMAIS de texte libre ! TOUJOURS un objet JSON valide avec "mode" et le reste.

═══════════════════════════════════════════════════════════════
📋 PROCESSUS EN 2 PHASES
═══════════════════════════════════════════════════════════════

PHASE 1 : COLLECTE D'INFORMATIONS (questions-réponses)
------------------------------------------------------
1. Analyser la demande initiale de l'artisan
2. Identifier les informations MANQUANTES critiques
3. Poser 2-4 QUESTIONS CIBLÉES pour préciser :
   - Type de matériaux/finitions (si applicable)
   - État du support/existant
   - Contraintes particulières
   - Niveau de gamme souhaité
4. Permettre à l'artisan de répondre "je ne sais pas" → tu prendras des valeurs standard
5. Adapter tes questions selon les réponses

⚠️ OBLIGATOIRE : Répondre avec ce format JSON EXACT :
{
  "mode": "questions",
  "questions": [
    {
      "question": "Quel type de parquet souhaitez-vous ?",
      "options": ["Stratifié (économique)", "Massif (haut de gamme)", "Flottant", "Je ne sais pas"],
      "importance": "critique"
    },
    {
      "question": "Les murs sont-ils en bon état ?",
      "options": ["Oui, prêts à peindre", "Non, besoin de préparation", "Je ne sais pas"],
      "importance": "optionnel"
    }
  ],
  "analyse_partielle": "Résumé de ce que tu as compris jusqu'à présent"
}

⚠️ ATTENTION : TOUJOURS fournir des "options" avec au minimum ["Oui", "Non", "Je ne sais pas"]

PHASE 2 : GÉNÉRATION DU DEVIS FINAL
------------------------------------
Quand tu as ASSEZ d'informations (après 2-4 questions max OU si artisan dit "génère le devis"), tu passes en mode devis :

⚠️ OBLIGATOIRE : Répondre avec ce format JSON EXACT :
{
  "mode": "devis",
  "analyse": "Explication courte de ce qui est nécessaire",
  "lots": [
    {
      "nom_lot": "PARQUET - REVÊTEMENT SOL",
      "prestations": [
        {
          "designation": "Description claire",
          "quantite": 12.5,
          "unite": "m²",
          "prix_unitaire": 45.00,
          "type": "main_oeuvre"
        }
      ]
    }
  ],
  "conseils": "Conseils professionnels",
  "hypotheses": "Liste des hypothèses prises si artisan a dit 'je ne sais pas'"
}

⚠️⚠️⚠️ RAPPEL CRITIQUE ⚠️⚠️⚠️
- JAMAIS de texte libre en dehors du JSON
- TOUJOURS inclure "mode": "questions" OU "mode": "devis"
- TOUJOURS fournir des "options" dans les questions
- Le JSON doit être parsable par JSON.parse()

═══════════════════════════════════════════════════════════════
📊 TAUX HORAIRES DE VENTE HT PAR MÉTIER (France 2024-2025)
═══════════════════════════════════════════════════════════════
- Plombier : 55-60 €/h HT
- Électricien : 45-55 €/h HT
- Peintre : 35-45 €/h HT
- Poseur de parquet : 40-50 €/h HT
- Carreleur : 45-60 €/h HT
- Maçon : 40-55 €/h HT
- Menuisier : 40-50 €/h HT
- Plaquiste : 35-45 €/h HT

═══════════════════════════════════════════════════════════════
⏱️ RENDEMENTS MOYENS (temps de pose)
═══════════════════════════════════════════════════════════════
Parquet :
- Stratifié/flottant : 0.4-0.6 h/m² → PRIX POSE : 25-35 €/m² HT
- Massif collé : 0.6-0.8 h/m² → PRIX POSE : 30-45 €/m² HT
- Massif cloué : 0.8-1.2 h/m² → PRIX POSE : 40-60 €/m² HT

Peinture :
- Murs/plafonds standard : 0.3-0.5 h/m² → PRIX POSE : 20-35 €/m² HT (fourni-posé)
- Boiseries : 0.4-0.6 h/m² → PRIX POSE : 25-40 €/m² HT

Carrelage :
- Sol pose droite : 0.6-0.8 h/m² → PRIX POSE : 35-50 €/m² HT
- Murs pose droite : 0.8-1.0 h/m² → PRIX POSE : 40-55 €/m² HT
- Pose diagonale/complexe : 1.0-1.5 h/m² → PRIX POSE : 50-80 €/m² HT

Plomberie :
- Remplacement robinetterie : 1-2h → 55-120 € HT
- Installation WC complet : 2-3h → 110-180 € HT
- Radiateur : 2-4h → 110-240 € HT

Électricité :
- Pose prise/interrupteur : 0.5-1h → 25-55 € HT
- Point luminaire : 0.5-1.5h → 25-80 € HT
- Tableau électrique : 4-8h → 180-440 € HT

═══════════════════════════════════════════════════════════════
💰 PRIX FOURNITURES MOYENS HT (prix d'achat artisan avec remise ~30%)
═══════════════════════════════════════════════════════════════
Parquet :
- Stratifié entrée gamme : 8-15 €/m²
- Stratifié milieu gamme : 15-25 €/m²
- Massif chêne : 30-60 €/m²
- Sous-couche : 1-3 €/m²
- Plinthes MDF : 2-5 €/ml
- Colle/accessoires : 2-4 €/m²

Peinture :
- Peinture acrylique murs (rendement ~10m²/L) : 3-6 €/m²
- Primaire/sous-couche : 1-2 €/m²

Carrelage :
- Grès cérame 30x60 : 15-35 €/m²
- Faïence murale : 10-25 €/m²
- Colle carrelage : 2-4 €/m²
- Joints : 1-2 €/m²

Plomberie/Électricité : prix catalogue fournisseurs pro + marge 30-40%

═══════════════════════════════════════════════════════════════
🎯 RÈGLES DE CALCUL IMPÉRATIVES
═══════════════════════════════════════════════════════════════
1. TOUJOURS calculer main d'œuvre = temps de pose × taux horaire
2. TOUJOURS ajouter +10% sur fournitures pour chutes/pertes
3. TOUJOURS séparer main d'œuvre et fournitures en lignes distinctes
4. TOUJOURS inclure consommables (colles, vis, joints, etc.)
5. TOUJOURS proposer évacuation déchets si volume > 1m³
6. Prix fournitures = prix d'achat × 1.30 à 1.40 (marge artisan 30-40%)

═══════════════════════════════════════════════════════════════
✅ EXEMPLE CONCRET : "Parquet 25m² + installation paroi douche"
═══════════════════════════════════════════════════════════════
{
  "analyse": "Deux travaux distincts : pose de parquet stratifié et installation plomberie sanitaire",
  "lots": [
    {
      "nom_lot": "PARQUET - REVÊTEMENT SOL",
      "prestations": [
        {
          "designation": "Fourniture parquet stratifié milieu gamme",
          "quantite": 27.5,
          "unite": "m²",
          "prix_unitaire": 20,
          "type": "fourniture"
        },
        {
          "designation": "Fourniture sous-couche acoustique",
          "quantite": 25,
          "unite": "m²",
          "prix_unitaire": 2.6,
          "type": "fourniture"
        },
        {
          "designation": "Fourniture plinthes MDF",
          "quantite": 30,
          "unite": "ml",
          "prix_unitaire": 3.25,
          "type": "fourniture"
        },
        {
          "designation": "Fourniture colle et accessoires",
          "quantite": 1,
          "unite": "forfait",
          "prix_unitaire": 40,
          "type": "fourniture"
        },
        {
          "designation": "Main d'œuvre pose parquet stratifié",
          "quantite": 25,
          "unite": "m²",
          "prix_unitaire": 30,
          "type": "main_oeuvre"
        }
      ]
    },
    {
      "nom_lot": "PLOMBERIE - SANITAIRE DOUCHE",
      "prestations": [
        {
          "designation": "Fourniture paroi de douche verre 8mm",
          "quantite": 1,
          "unite": "unité",
          "prix_unitaire": 300,
          "type": "fourniture"
        },
        {
          "designation": "Main d'œuvre installation paroi douche",
          "quantite": 4,
          "unite": "h",
          "prix_unitaire": 55,
          "type": "main_oeuvre"
        }
      ]
    }
  ],
  "conseils": "Vérifier l'état du support avant pose parquet. Pour la douche, prévoir étanchéité conforme DTU 60.11"
}

Ne JAMAIS proposer de prix main d'œuvre trop bas qui ne couvrent pas les charges !

═══════════════════════════════════════════════════════════════
🎓 EXEMPLES DE CONVERSATIONS
═══════════════════════════════════════════════════════════════

Exemple 1 : Demande vague
ARTISAN: "Je veux faire un parquet"
IA (mode questions):
{
  "mode": "questions",
  "questions": [
    {
      "question": "Quelle est la surface à couvrir en mètres carrés ?",
      "options": [],
      "importance": "critique"
    },
    {
      "question": "Quel type de parquet souhaitez-vous ?",
      "options": ["1. Stratifié (20-35€/m²)", "2. Massif (40-80€/m²)", "3. Flottant", "Je ne sais pas"],
      "importance": "critique"
    }
  ],
  "analyse_partielle": "Pose de parquet, mais manque surface et type"
}

Exemple 2 : Après réponses
ARTISAN: "25 mètres carrés, stratifié"
IA (mode questions ou devis selon contexte):
{
  "mode": "questions",
  "questions": [
    {
      "question": "L'état du sol actuel est-il bon (propre, plan, sec) ?",
      "options": ["Oui, prêt à poser", "Non, nécessite préparation", "Je ne sais pas"],
      "importance": "optionnel"
    },
    {
      "question": "Souhaitez-vous des plinthes ?",
      "options": ["Oui, MDF", "Oui, bois asssorti", "Non", "Je ne sais pas"],
      "importance": "optionnel"
    }
  ],
  "analyse_partielle": "Parquet stratifié 25m², reste à préciser état sol et plinthes"
}

Exemple 3 : Génération finale
ARTISAN: "Oui sol bon, oui plinthes MDF" OU "génère le devis" OU après 4 questions
IA (mode devis):
{
  "mode": "devis",
  "analyse": "Pose parquet stratifié 25m² avec plinthes MDF, sol en bon état",
  "lots": [ ... ],
  "conseils": "...",
  "hypotheses": "Aucune hypothèse, toutes les infos fournies"
}

═══════════════════════════════════════════════════════════════
⚠️ RÈGLES IMPORTANTES
═══════════════════════════════════════════════════════════════
1. MAX 4 questions au total (ne pas harceler l'artisan)
2. Questions SIMPLES avec options à choix multiples quand possible
3. Si artisan dit "je ne sais pas", prendre valeur standard et noter dans "hypotheses"
4. Si artisan dit "génère le devis maintenant", passer en mode devis immédiatement
5. Détecter automatiquement quand tu as assez d'infos → mode devis
6. TOUJOURS séparer les différents lots/travaux`
          }
        ]
        
        // Ajouter l'historique de conversation si présent
        if (conversationHistory && Array.isArray(conversationHistory)) {
          messages.push(...conversationHistory)
        }
        
        // Ajouter le message utilisateur actuel
        messages.push({
          role: 'user',
          content: prompt
        })
        
        // Appel à l'API OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Erreur OpenAI:', error)
      return c.json({ error: 'Erreur lors de l\'appel à OpenAI: ' + response.statusText }, response.status)
    }
    
    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content
    
    if (!aiResponse) {
      return c.json({ error: 'Aucune réponse de l\'IA' }, 500)
    }
    
    return c.json({ response: aiResponse })
    
  } catch (error) {
    console.error('Erreur serveur:', error)
    return c.json({ error: 'Erreur serveur: ' + error.message }, 500)
  }
})

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Devis Artisan - Saisie Vocale</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <style>
          @media print {
            .no-print { display: none; }
          }
          .recording { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
          .page-content { 
            display: none; 
          }
          .page-content.active { 
            display: block; 
          }
          .nav-link.active {
            color: #2563eb;
            border-bottom-color: #2563eb;
          }
          
          /* Styles onglets */
          .tab-button.active {
            border-bottom-color: #2563eb !important;
            color: #2563eb !important;
          }
          .tab-content {
            display: none;
          }
          .tab-content.active {
            display: block;
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200 no-print">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between items-center h-16">
                    <div class="flex space-x-8">
                        <button id="navNewDevis" class="nav-link active px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                            <i class="fas fa-plus-circle mr-2"></i>
                            Nouveau devis
                        </button>
                        <button id="navHistorique" class="nav-link px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent">
                            <i class="fas fa-history mr-2"></i>
                            Historique
                        </button>
                        <button id="navBasePrix" class="nav-link px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent">
                            <i class="fas fa-database mr-2"></i>
                            Ma base de prix
                        </button>
                    </div>
                    <div class="flex space-x-2">
                        <button id="settingsBtn" class="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg transition">
                            <i class="fas fa-cog mr-2"></i>
                            Paramètres
                        </button>
                    </div>
                </div>
            </div>
        </nav>
        
        <!-- Page Nouveau Devis -->
        <div id="pageNewDevis" class="page-content active">
        <div class="min-h-screen p-4">
            <div class="flex justify-between items-center mb-6 max-w-7xl mx-auto">
                <h1 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-hammer mr-2 text-blue-600"></i>
                    Devis Artisan - Saisie Vocale
                </h1>
                <div class="space-x-2 no-print">
                    <button id="saveDevisBtn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
                        <i class="fas fa-save mr-2"></i>
                        Sauvegarder
                    </button>
                    <button id="newDevisBtn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
                        <i class="fas fa-plus mr-2"></i>
                        Nouveau devis
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
                <!-- Partie gauche : Interface à onglets -->
                <div class="bg-white rounded-lg shadow-lg no-print">
                    <!-- Onglets -->
                    <div class="flex border-b border-gray-200">
                        <button id="tabSaisie" class="tab-button active flex-1 py-4 px-6 text-sm font-medium border-b-2 border-blue-600 text-blue-600 hover:bg-gray-50 transition">
                            <i class="fas fa-pen mr-2"></i>
                            Saisie
                        </button>
                        <button id="tabIA" class="tab-button flex-1 py-4 px-6 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition">
                            <i class="fas fa-robot mr-2"></i>
                            Assistant IA
                        </button>
                        <button id="tabInfo" class="tab-button flex-1 py-4 px-6 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition">
                            <i class="fas fa-info-circle mr-2"></i>
                            Aide
                        </button>
                    </div>
                    
                    <div class="p-6">
                        <!-- Contenu Onglet Saisie -->
                        <div id="contentSaisie" class="tab-content">
                            <div class="mb-4">
                                <div class="flex gap-2 mb-3">
                                    <button id="startBtn" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition">
                                        <i class="fas fa-microphone mr-2"></i>
                                        Vocal
                                    </button>
                                    <button id="stopBtn" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition hidden">
                                        <i class="fas fa-stop mr-2"></i>
                                        Stop
                                    </button>
                                </div>
                                <div id="status" class="text-xs text-gray-600 mb-3 p-2 bg-gray-100 rounded text-center"></div>
                            </div>
                            
                            <textarea id="transcript" rows="12" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="Tapez ou dictez votre demande ici..."></textarea>
                            
                            <div class="mt-4 flex gap-2">
                                <button id="clearBtn" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm">
                                    <i class="fas fa-trash mr-2"></i>
                                    Effacer
                                </button>
                                <button id="aiAssistBtn" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm">
                                    <i class="fas fa-robot mr-2"></i>
                                    🤖 IA
                                </button>
                            </div>
                        </div>
                        
                        <!-- Contenu Onglet Assistant IA -->
                        <div id="contentIA" class="tab-content hidden">
                            <div id="aiResponse" class="p-4 bg-purple-50 rounded-lg">
                                <h4 class="font-bold text-purple-800 mb-3 text-sm">
                                    <i class="fas fa-robot mr-2"></i>
                                    Assistant IA
                                </h4>
                                <div id="aiResponseText" class="text-sm text-gray-700 whitespace-pre-wrap min-h-[300px]">
                                    <p class="text-gray-500 italic">Cliquez sur "🤖 IA" dans l'onglet Saisie pour commencer...</p>
                                </div>
                                <button id="applyAIBtn" class="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm hidden">
                                    <i class="fas fa-check mr-2"></i>
                                    ✓ Appliquer au devis
                                </button>
                            </div>
                        </div>
                        
                        <!-- Contenu Onglet Aide -->
                        <div id="contentInfo" class="tab-content hidden">
                            <div class="space-y-4 text-sm">
                                <div class="p-3 bg-purple-50 rounded-lg">
                                    <p class="font-bold text-purple-800 mb-2">🤖 Mode Assistant IA</p>
                                    <p class="text-xs text-gray-600 italic">
                                        Dictez simplement ce que vous voulez faire. L'IA vous pose des questions et construit le devis.
                                    </p>
                                    <p class="text-xs text-gray-600 mt-2 italic">
                                        <strong>Exemple :</strong> "Je veux faire un parquet de 25m²"
                                    </p>
                                </div>
                                
                                <div class="p-3 bg-blue-50 rounded-lg">
                                    <p class="font-bold text-blue-800 mb-2">📝 Saisie complète</p>
                                    <p class="text-xs text-gray-600 italic">
                                        Dictez toutes les informations d'un coup avec client, prestations et prix.
                                    </p>
                                    <p class="text-xs text-gray-600 mt-2 italic">
                                        <strong>Exemple :</strong> "Client Jean Dupont à Paris. Prestation peinture 12m² à 25€/m²."
                                    </p>
                                </div>
                                
                                <div class="p-3 bg-gray-100 rounded-lg">
                                    <p class="font-bold text-gray-800 mb-2">💡 Astuces</p>
                                    <ul class="text-xs text-gray-600 space-y-1 list-disc list-inside">
                                        <li>Utilisez le mode vocal pour gagner du temps</li>
                                        <li>L'IA apprend de vos prix au fil du temps</li>
                                        <li>Tous vos devis sont sauvegardés dans l'historique</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Partie droite : Devis -->
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="flex justify-between items-center mb-4 no-print">
                        <h2 class="text-xl font-bold text-gray-700">
                            <i class="fas fa-file-invoice mr-2"></i>
                            Devis en temps réel
                        </h2>
                        <button id="exportBtn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition">
                            <i class="fas fa-file-pdf mr-2"></i>
                            Export PDF
                        </button>
                    </div>
                    
                    <div id="devis" class="border-2 border-gray-200 rounded-lg p-6">
                        <!-- En-tête -->
                        <div class="mb-6">
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">DEVIS</h3>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p class="font-semibold">Date : <span id="devisDate"></span></p>
                                    <p class="font-semibold">N° : <span id="devisNum"></span></p>
                                </div>
                                <div class="text-right">
                                    <p id="artisanNomDisplay" class="font-bold text-base"></p>
                                    <p id="artisanAdresseDisplay" class="text-sm"></p>
                                    <p id="artisanTelDisplay" class="text-sm"></p>
                                    <p id="artisanEmailDisplay" class="text-sm"></p>
                                    <p id="artisanSiretDisplay" class="text-sm"></p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Client -->
                        <div class="mb-6 p-4 bg-gray-50 rounded">
                            <h4 class="font-bold text-gray-700 mb-2">CLIENT :</h4>
                            <input type="text" id="clientNom" placeholder="Nom du client" class="w-full p-2 border rounded mb-2">
                            <input type="text" id="clientAdresse" placeholder="Adresse" class="w-full p-2 border rounded mb-2">
                            <input type="text" id="clientTel" placeholder="Téléphone" class="w-full p-2 border rounded">
                        </div>
                        
                        <!-- Informations travaux -->
                        <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200 no-print">
                            <h4 class="font-bold text-blue-800 mb-2 text-sm">
                                <i class="fas fa-calendar-alt mr-2"></i>
                                Informations sur les travaux
                            </h4>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-xs font-medium text-gray-700 mb-1">Date de début</label>
                                    <input type="date" id="dateDebut" class="w-full p-2 border border-gray-300 rounded text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-700 mb-1">Durée estimée</label>
                                    <input type="text" id="dureeEstimee" class="w-full p-2 border border-gray-300 rounded text-sm" placeholder="Ex: 2 semaines">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Prestations -->
                        <div class="mb-6">
                            <h4 class="font-bold text-gray-700 mb-2">PRESTATIONS :</h4>
                            <table class="w-full text-sm border-collapse">
                                <thead>
                                    <tr class="bg-gray-100">
                                        <th class="border p-2 text-left">Désignation</th>
                                        <th class="border p-2 text-center w-20">Qté</th>
                                        <th class="border p-2 text-right w-24">P.U. HT</th>
                                        <th class="border p-2 text-right w-24">Total HT</th>
                                        <th class="border p-2 w-10 no-print"></th>
                                    </tr>
                                </thead>
                                <tbody id="prestationsBody">
                                    <tr id="prestationRow0">
                                        <td class="border p-2"><input type="text" class="w-full p-1 border rounded prestation-designation" placeholder="Description"></td>
                                        <td class="border p-2"><input type="number" class="w-full p-1 border rounded text-center prestation-qte" value="1" min="0" step="0.01"></td>
                                        <td class="border p-2"><input type="number" class="w-full p-1 border rounded text-right prestation-pu" value="0" min="0" step="0.01"></td>
                                        <td class="border p-2 text-right prestation-total">0.00 €</td>
                                        <td class="border p-2 text-center no-print"><button class="text-red-600 hover:text-red-800 remove-prestation"><i class="fas fa-trash"></i></button></td>
                                    </tr>
                                </tbody>
                            </table>
                            <button id="addPrestationBtn" class="mt-2 text-blue-600 hover:text-blue-800 text-sm no-print">
                                <i class="fas fa-plus-circle mr-1"></i>
                                Ajouter une ligne
                            </button>
                        </div>
                        
                        <!-- Totaux -->
                        <div class="border-t-2 border-gray-300 pt-4">
                            <div class="flex justify-end space-y-2">
                                <div class="w-64">
                                    <div class="flex justify-between mb-2">
                                        <span class="font-semibold">Total HT :</span>
                                        <span id="totalHT" class="font-bold">0.00 €</span>
                                    </div>
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="font-semibold">TVA 
                                            <input type="number" id="tauxTVA" value="20" min="0" max="100" step="0.1" class="w-16 p-1 border rounded text-center">
                                            % :
                                        </span>
                                        <span id="montantTVA" class="font-bold">0.00 €</span>
                                    </div>
                                    <div class="flex justify-between text-lg border-t-2 border-gray-400 pt-2">
                                        <span class="font-bold">Total TTC :</span>
                                        <span id="totalTTC" class="font-bold text-blue-600">0.00 €</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Conditions -->
                        <div class="mt-6 p-4 bg-gray-50 rounded">
                            <h4 class="font-bold text-gray-700 mb-2">CONDITIONS DE PAIEMENT :</h4>
                            <textarea id="conditions" rows="3" class="w-full p-2 border rounded text-sm" placeholder="Ex: Acompte de 30% à la commande, solde à la fin des travaux">Acompte de 30% à la commande
Solde à la livraison
Devis valable 30 jours</textarea>
                        </div>
                        
                        <div class="mt-4 text-xs text-gray-500 text-center">
                            <p>Devis généré le <span id="timestampDevis"></span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Paramètres -->
        <div id="settingsModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-cog mr-2"></i>
                        Paramètres de l'entreprise
                    </h2>
                    <button id="closeSettingsBtn" class="text-gray-600 hover:text-gray-800">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise *</label>
                        <input type="text" id="settingsNom" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ex: Dupont Bâtiment">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Adresse complète *</label>
                        <input type="text" id="settingsAdresse" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ex: 15 rue de la Paix, 75001 Paris">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                            <input type="tel" id="settingsTel" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="06 12 34 56 78">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" id="settingsEmail" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="contact@entreprise.fr">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">SIRET</label>
                        <input type="text" id="settingsSiret" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="123 456 789 00010">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">N° Répertoire des Métiers (RM)</label>
                            <input type="text" id="settingsRM" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="RM 123456789">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">N° TVA intracommunautaire</label>
                            <input type="text" id="settingsTVAIntra" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="FR 12 345678901">
                        </div>
                    </div>
                    
                    <div class="border-t-2 border-gray-200 pt-4 mt-2">
                        <h3 class="text-md font-bold text-gray-800 mb-3">
                            <i class="fas fa-shield-alt mr-2 text-green-600"></i>
                            Assurance décennale (obligatoire)
                        </h3>
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'assureur *</label>
                                <input type="text" id="settingsAssuranceNom" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Ex: AXA, Allianz, MAAF...">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">N° de police *</label>
                                <input type="text" id="settingsAssurancePolice" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Ex: POL123456789">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Zone géographique couverte</label>
                                <input type="text" id="settingsAssuranceZone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" value="France métropolitaine">
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-image mr-2"></i>
                            Logo de l'entreprise
                        </label>
                        <div class="flex items-start gap-4">
                            <div class="flex-1">
                                <input type="file" id="settingsLogo" accept="image/png,image/jpeg,image/jpg" class="w-full p-2 border border-gray-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                                <p class="text-xs text-gray-500 mt-1">
                                    Format JPG, PNG • Max 500 KB • Recommandé: 300x100 px
                                </p>
                            </div>
                            <div id="logoPreview" class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hidden">
                                <img id="logoPreviewImg" src="" alt="Logo" class="max-w-full max-h-full object-contain">
                            </div>
                        </div>
                        <button id="removeLogo" class="mt-2 text-red-600 hover:text-red-800 text-sm hidden">
                            <i class="fas fa-trash mr-1"></i>
                            Supprimer le logo
                        </button>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Conditions de paiement par défaut</label>
                        <textarea id="settingsConditions" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ex: Acompte de 30% à la commande, solde à la livraison">Acompte de 30% à la commande
Solde à la livraison
Devis valable 30 jours</textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Taux de TVA par défaut (%)</label>
                        <input type="number" id="settingsTVA" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" value="20" min="0" max="100" step="0.1">
                    </div>
                    
                    <div class="border-t-2 border-gray-200 pt-4 mt-4">
                        <h3 class="text-lg font-bold text-gray-800 mb-3">
                            <i class="fas fa-robot mr-2 text-purple-600"></i>
                            Assistant IA (OpenAI)
                        </h3>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Clé API OpenAI 
                                <span class="text-gray-500">(optionnel)</span>
                            </label>
                            <input type="password" id="settingsOpenAIKey" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm" placeholder="sk-...">
                            <p class="text-xs text-gray-500 mt-1">
                                Pour activer l'assistant IA qui vous aide à construire vos devis. 
                                <a href="https://platform.openai.com/api-keys" target="_blank" class="text-blue-600 hover:underline">Obtenir une clé API</a>
                            </p>
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-700">
                            <i class="fas fa-info-circle mr-2"></i>
                            Ces informations seront sauvegardées automatiquement et utilisées pour tous vos futurs devis.
                        </p>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 mt-6">
                    <button id="cancelSettingsBtn" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">
                        Annuler
                    </button>
                    <button id="saveSettingsBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition">
                        <i class="fas fa-save mr-2"></i>
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
        </div>
        <!-- Fin Page Nouveau Devis -->
        
        <!-- Page Historique -->
        <div id="pageHistorique" class="page-content">
            <div class="min-h-screen p-4">
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-history mr-2 text-blue-600"></i>
                        Historique des devis
                    </h1>
                    
                    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <input type="text" id="searchDevis" placeholder="Rechercher un client..." class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <select id="filterStatut" class="px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">Tous les statuts</option>
                                    <option value="brouillon">Brouillon</option>
                                    <option value="envoye">Envoyé</option>
                                    <option value="accepte">Accepté</option>
                                    <option value="refuse">Refusé</option>
                                </select>
                            </div>
                        </div>
                        
                        <div id="devisList" class="space-y-4">
                            <!-- Liste des devis sera générée ici -->
                        </div>
                        
                        <div id="noDevis" class="text-center py-12 text-gray-500 hidden">
                            <i class="fas fa-inbox text-6xl mb-4"></i>
                            <p class="text-xl">Aucun devis enregistré</p>
                            <p class="text-sm mt-2">Créez votre premier devis pour le voir apparaître ici</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Fin Page Historique -->
        
        <!-- Page Base de Prix -->
        <div id="pageBasePrix" class="page-content">
            <div class="min-h-screen p-4">
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-database mr-2 text-blue-600"></i>
                        Ma base de prix
                    </h1>
                    
                    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <div class="flex justify-between items-center mb-6">
                            <p class="text-gray-700">
                                <i class="fas fa-info-circle mr-2 text-blue-600"></i>
                                Cette base se remplit automatiquement à partir de vos devis validés
                            </p>
                            <button id="updateBasePrixBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                                <i class="fas fa-sync-alt mr-2"></i>
                                Actualiser depuis les devis
                            </button>
                        </div>
                        
                        <div class="mb-4">
                            <input type="text" id="searchPrix" placeholder="Rechercher une prestation..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div id="basePrixList" class="space-y-6">
                            <!-- Liste des prix sera générée ici -->
                        </div>
                        
                        <div id="noPrix" class="text-center py-12 text-gray-500 hidden">
                            <i class="fas fa-database text-6xl mb-4"></i>
                            <p class="text-xl">Aucun prix enregistré</p>
                            <p class="text-sm mt-2">Créez et sauvegardez des devis pour alimenter votre base de prix</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Fin Page Base de Prix -->
        
        <script src="/static/tabs.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
