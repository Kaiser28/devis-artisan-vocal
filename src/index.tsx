import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/api/*', cors())

// Route API pour l'assistant IA
app.post('/api/ai-assistant', async (c) => {
  try {
    const { prompt, apiKey } = await c.req.json()
    
    if (!apiKey) {
      return c.json({ error: 'Clé API OpenAI non configurée. Ajoutez-la dans les paramètres.' }, 400)
    }
    
    if (!prompt || prompt.trim() === '') {
      return c.json({ error: 'Aucun texte fourni' }, 400)
    }
    
    // Appel à l'API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant expert en BTP qui aide les artisans à construire des devis détaillés et professionnels.

Ton rôle :
1. Analyser la demande de l'artisan
2. Identifier tous les postes de travaux nécessaires
3. Proposer des quantités réalistes avec marges (ex: +10% pour chutes)
4. Suggérer des prix moyens du marché français (2024)
5. Détailler TOUTES les prestations : main d'œuvre, fournitures, accessoires

Format de réponse OBLIGATOIRE en JSON :
{
  "analyse": "Explication courte de ce qui est nécessaire",
  "prestations": [
    {
      "designation": "Description claire",
      "quantite": 12.5,
      "unite": "m²",
      "prix_unitaire": 25.00,
      "type": "main_oeuvre" ou "fourniture"
    }
  ],
  "conseils": "Conseils professionnels pour l'artisan"
}

Prix moyens 2024 France (indicatifs) :
- Parquet stratifié : 20-35€/m² fourniture, 15-25€/m² pose
- Parquet massif : 40-80€/m² fourniture, 25-40€/m² pose  
- Peinture murs : 3-6€/m² fourniture, 15-25€/m² main d'œuvre
- Plomberie : 40-60€/h main d'œuvre
- Électricité : 40-70€/h main d'œuvre
- Carrelage : 20-50€/m² fourniture, 30-50€/m² pose

TOUJOURS inclure :
- Main d'œuvre séparée des fournitures
- Consommables (colle, vis, etc.)
- Évacuation déchets si pertinent
- Préparation surface si nécessaire`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
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
        </style>
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen p-4">
            <div class="flex justify-between items-center mb-6 max-w-7xl mx-auto">
                <h1 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-hammer mr-2 text-blue-600"></i>
                    Devis Artisan - Saisie Vocale
                </h1>
                <div class="space-x-2 no-print">
                    <button id="settingsBtn" class="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg transition">
                        <i class="fas fa-cog mr-2"></i>
                        Paramètres
                    </button>
                    <button id="newDevisBtn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
                        <i class="fas fa-plus mr-2"></i>
                        Nouveau devis
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
                <!-- Partie gauche : Saisie vocale -->
                <div class="bg-white rounded-lg shadow-lg p-6 no-print">
                    <h2 class="text-xl font-bold text-gray-700 mb-4">
                        <i class="fas fa-microphone mr-2"></i>
                        Saisie Vocale
                    </h2>
                    
                    <div class="mb-4">
                        <button id="startBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition">
                            <i class="fas fa-microphone mr-2"></i>
                            Commencer la dictée
                        </button>
                        <button id="stopBtn" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition hidden">
                            <i class="fas fa-stop mr-2"></i>
                            Arrêter la dictée
                        </button>
                    </div>
                    
                    <div id="status" class="text-sm text-gray-600 mb-4 p-3 bg-gray-100 rounded"></div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Texte dicté :</label>
                        <textarea id="transcript" rows="8" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Le texte dicté apparaîtra ici..."></textarea>
                    </div>
                    
                    <div class="space-y-3">
                        <button id="clearBtn" class="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition">
                            <i class="fas fa-trash mr-2"></i>
                            Effacer
                        </button>
                        <button id="aiAssistBtn" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition">
                            <i class="fas fa-robot mr-2"></i>
                            Assistant IA - Construire le devis
                        </button>
                        <button id="analyzeBtn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
                            <i class="fas fa-magic mr-2"></i>
                            Analyser et remplir le devis
                        </button>
                    </div>
                    
                    <div id="aiResponse" class="mt-4 p-4 bg-purple-50 rounded-lg hidden">
                        <h4 class="font-bold text-purple-800 mb-2">
                            <i class="fas fa-robot mr-2"></i>
                            Réponse de l'assistant IA :
                        </h4>
                        <div id="aiResponseText" class="text-sm text-gray-700 whitespace-pre-wrap"></div>
                        <button id="applyAiBtn" class="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition">
                            <i class="fas fa-check mr-2"></i>
                            Appliquer au devis
                        </button>
                    </div>
                    
                    <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p class="text-sm text-gray-700"><strong>💡 Mode Assistant IA :</strong></p>
                        <p class="text-xs text-gray-600 mt-2 italic">
                            Dictez simplement ce que vous voulez faire. L'IA vous guidera et construira le devis pour vous !
                        </p>
                        <p class="text-xs text-gray-600 mt-1 italic">
                            Exemple : "Je veux faire un parquet dans une chambre de 12 mètres carrés"
                        </p>
                        <hr class="my-2 border-blue-200">
                        <p class="text-sm text-gray-700 mt-2"><strong>💡 Mode Analyse classique :</strong></p>
                        <p class="text-xs text-gray-600 mt-1 italic">
                            "Client Jean Dupont, 15 rue de la Paix Paris. Prestation peinture chambre 12 mètres carrés à 25 euros le mètre carré."
                        </p>
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
        
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
