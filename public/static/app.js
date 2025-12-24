// Variables globales
let recognition;
let isRecording = false;
let prestationCount = 1;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    initSpeechRecognition();
    initDevisDate();
    setupEventListeners();
    calculateTotals();
    setupNavigation();
    
    // Vérifier au chargement s'il y a un devis à charger
    const devisACharger = localStorage.getItem('devis_a_charger');
    if (devisACharger) {
        loadDevisFromHistory(devisACharger);
        localStorage.removeItem('devis_a_charger');
    }
});

// Initialisation de la reconnaissance vocale
function initSpeechRecognition() {
    const statusEl = document.getElementById('status');
    const startBtn = document.getElementById('startBtn');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        statusEl.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p class="text-red-800 font-bold mb-2">❌ Reconnaissance vocale non disponible</p>
                <p class="text-red-700 text-sm">Votre navigateur ne supporte pas la reconnaissance vocale.</p>
                <p class="text-red-700 text-sm mt-2"><strong>Solutions :</strong></p>
                <ul class="list-disc list-inside text-red-700 text-sm ml-2">
                    <li>Utilisez <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong></li>
                    <li>Vérifiez que vous êtes en <strong>HTTPS</strong> (URL doit commencer par https://)</li>
                    <li>Sinon, utilisez la saisie manuelle dans le champ texte</li>
                </ul>
            </div>
        `;
        startBtn.disabled = true;
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = function() {
        isRecording = true;
        statusEl.innerHTML = `
            <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                <p class="text-green-800 font-bold">🎤 Enregistrement en cours...</p>
                <p class="text-green-700 text-sm">Parlez maintenant, je vous écoute !</p>
            </div>
        `;
        startBtn.classList.add('hidden');
        document.getElementById('stopBtn').classList.remove('hidden');
    };
    
    recognition.onend = function() {
        isRecording = false;
        statusEl.innerHTML = `
            <div class="bg-gray-50 border-l-4 border-gray-400 p-3 rounded">
                <p class="text-gray-800">⏸️ Enregistrement arrêté</p>
                <p class="text-gray-600 text-sm">Cliquez sur "Commencer la dictée" pour reprendre</p>
            </div>
        `;
        startBtn.classList.remove('hidden');
        document.getElementById('stopBtn').classList.add('hidden');
    };
    
    recognition.onerror = function(event) {
        isRecording = false;
        let errorMessage = '';
        let solutions = [];
        
        switch(event.error) {
            case 'no-speech':
                errorMessage = 'Aucune parole détectée';
                solutions = [
                    'Vérifiez que votre microphone fonctionne',
                    'Parlez plus fort et plus près du micro',
                    'Testez votre micro dans les paramètres système'
                ];
                break;
            case 'audio-capture':
                errorMessage = 'Microphone non accessible';
                solutions = [
                    'Vérifiez que votre microphone est branché',
                    'Autorisez l\'accès au micro dans votre navigateur (icône 🔒 dans la barre d\'adresse)',
                    'Vérifiez les paramètres de confidentialité de votre système'
                ];
                break;
            case 'not-allowed':
                errorMessage = 'Permission microphone refusée';
                solutions = [
                    'Cliquez sur l\'icône 🔒 dans la barre d\'adresse',
                    'Autorisez l\'accès au microphone pour ce site',
                    'Rechargez la page après avoir donné la permission'
                ];
                break;
            case 'network':
                errorMessage = 'Erreur réseau';
                solutions = [
                    'Vérifiez votre connexion internet',
                    'La reconnaissance vocale nécessite une connexion active'
                ];
                break;
            default:
                errorMessage = 'Erreur: ' + event.error;
                solutions = [
                    'Essayez de recharger la page',
                    'Utilisez la saisie manuelle en attendant'
                ];
        }
        
        statusEl.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p class="text-red-800 font-bold mb-2">❌ ${errorMessage}</p>
                <p class="text-red-700 text-sm mt-2"><strong>Solutions :</strong></p>
                <ul class="list-disc list-inside text-red-700 text-sm ml-2">
                    ${solutions.map(s => `<li>${s}</li>`).join('')}
                </ul>
                <p class="text-red-600 text-sm mt-3 font-semibold">
                    💡 Vous pouvez aussi taper directement dans le champ texte ci-dessous
                </p>
            </div>
        `;
        
        startBtn.classList.remove('hidden');
        document.getElementById('stopBtn').classList.add('hidden');
    };
    
    recognition.onresult = function(event) {
        let interimTranscript = '';
        let finalTranscript = document.getElementById('transcript').value;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        document.getElementById('transcript').value = finalTranscript;
    };
    
    recognition.onerror = function(event) {
        console.error('Erreur de reconnaissance vocale:', event.error);
        document.getElementById('status').innerHTML = '<span class="text-red-600">❌ Erreur: ' + event.error + '</span>';
    };
}

// Initialisation de la date du devis
function initDevisDate() {
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR');
    const timeStr = today.toLocaleString('fr-FR');
    
    // Récupération ou initialisation du compteur de devis
    let devisCounter = parseInt(localStorage.getItem('devisCounter') || '0');
    devisCounter++;
    localStorage.setItem('devisCounter', devisCounter.toString());
    
    const devisNum = 'DEV-' + today.getFullYear() + 
                     (today.getMonth() + 1).toString().padStart(2, '0') + 
                     today.getDate().toString().padStart(2, '0') + '-' + 
                     devisCounter.toString().padStart(4, '0');
    
    document.getElementById('devisDate').textContent = dateStr;
    document.getElementById('devisNum').textContent = devisNum;
    document.getElementById('timestampDevis').textContent = timeStr;
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Boutons de reconnaissance vocale
    document.getElementById('startBtn').addEventListener('click', function() {
        if (recognition) {
            recognition.start();
        }
    });
    
    document.getElementById('stopBtn').addEventListener('click', function() {
        if (recognition) {
            recognition.stop();
        }
    });
    
    // Bouton effacer
    document.getElementById('clearBtn').addEventListener('click', function() {
        document.getElementById('transcript').value = '';
    });
    
    // Bouton assistant IA
    document.getElementById('aiAssistBtn').addEventListener('click', function() {
        callAIAssistant();
    });
    
    // Bouton appliquer réponse IA
    document.getElementById('applyAiBtn').addEventListener('click', function() {
        applyAIResponse();
    });
    
    // Bouton analyser
    document.getElementById('analyzeBtn').addEventListener('click', function() {
        analyzeTranscript();
    });
    
    // Bouton ajouter prestation
    document.getElementById('addPrestationBtn').addEventListener('click', function() {
        addPrestationRow();
    });
    
    // Bouton export PDF
    document.getElementById('exportBtn').addEventListener('click', function() {
        exportToPDF();
    });
    
    // Bouton sauvegarde
    document.getElementById('saveDevisBtn').addEventListener('click', function() {
        const devis = saveCurrentDevis('brouillon');
        if (devis) {
            alert('✅ Devis sauvegardé dans l\'historique !');
        }
    });
    
    // Bouton nouveau devis
    document.getElementById('newDevisBtn').addEventListener('click', function() {
        if (confirm('Voulez-vous créer un nouveau devis ? Le devis actuel sera effacé.')) {
            newDevis();
        }
    });
    
    // Boutons modal paramètres
    document.getElementById('settingsBtn').addEventListener('click', function() {
        openSettingsModal();
    });
    
    document.getElementById('closeSettingsBtn').addEventListener('click', function() {
        closeSettingsModal();
    });
    
    document.getElementById('cancelSettingsBtn').addEventListener('click', function() {
        closeSettingsModal();
    });
    
    document.getElementById('saveSettingsBtn').addEventListener('click', function() {
        saveSettings();
    });
    
    // Fermer le modal en cliquant en dehors
    document.getElementById('settingsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSettingsModal();
        }
    });
    
    // Calcul automatique des totaux
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('prestation-qte') || 
            e.target.classList.contains('prestation-pu') ||
            e.target.id === 'tauxTVA') {
            calculateTotals();
        }
    });
    
    // Suppression de prestation
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-prestation')) {
            const row = e.target.closest('tr');
            if (document.querySelectorAll('#prestationsBody tr').length > 1) {
                row.remove();
                calculateTotals();
            } else {
                alert('Il doit rester au moins une ligne de prestation');
            }
        }
    });
}

// Analyse du texte dicté et remplissage du devis
function analyzeTranscript() {
    const text = document.getElementById('transcript').value.toLowerCase();
    
    if (!text.trim()) {
        alert('Aucun texte à analyser. Dictez d\'abord votre devis.');
        return;
    }
    
    // Extraction du nom du client
    const clientPatterns = [
        /client\s+([a-zàâäéèêëïîôùûüÿœæç\s-]+?)(?:\s*,|\s+\d|\s+adresse|\s+habite|\s+situé)/i,
        /pour\s+([a-zàâäéèêëïîôùûüÿœæç\s-]+?)(?:\s*,|\s+\d|\s+adresse|\s+habite|\s+situé)/i,
        /monsieur\s+([a-zàâäéèêëïîôùûüÿœæç\s-]+?)(?:\s*,|\s+\d|\s+adresse|\s+habite|\s+situé)/i,
        /madame\s+([a-zàâäéèêëïîôùûüÿœæç\s-]+?)(?:\s*,|\s+\d|\s+adresse|\s+habite|\s+situé)/i
    ];
    
    for (let pattern of clientPatterns) {
        const match = text.match(pattern);
        if (match) {
            document.getElementById('clientNom').value = capitalizeWords(match[1].trim());
            break;
        }
    }
    
    // Extraction de l'adresse
    const adressePatterns = [
        /(?:adresse|habite|situé|domicilié)\s*:?\s*([0-9]+[^.!?\n]+(?:rue|avenue|boulevard|place|chemin|allée|impasse)[^.!?\n]+)/i,
        /([0-9]+[^.!?\n]+(?:rue|avenue|boulevard|place|chemin|allée|impasse)[^.!?\n]+)/i
    ];
    
    for (let pattern of adressePatterns) {
        const match = text.match(pattern);
        if (match) {
            document.getElementById('clientAdresse').value = capitalizeWords(match[1].trim());
            break;
        }
    }
    
    // Extraction du téléphone
    const telPattern = /(?:téléphone|tél|tel|portable|mobile)\s*:?\s*((?:0|\+33)[0-9\s.]{9,})/i;
    const telMatch = text.match(telPattern);
    if (telMatch) {
        document.getElementById('clientTel').value = telMatch[1].trim().replace(/\s+/g, '');
    }
    
    // Extraction des prestations
    const prestationPatterns = [
        /prestation\s+([a-zàâäéèêëïîôùûüÿœæç\s-]+?)\s+(\d+(?:[.,]\d+)?)\s*(?:mètres?|m2|m²|unités?|pièces?|heures?|jours?)?\s*(?:à|au prix de)\s*(\d+(?:[.,]\d+)?)\s*euros?/gi,
        /fourniture\s+([a-zàâäéèêëïîôùûüÿœæç\s-]+?)\s+(\d+(?:[.,]\d+)?)\s*(?:unités?|pièces?|pots?)?\s*(?:à|au prix de)\s*(\d+(?:[.,]\d+)?)\s*euros?/gi,
        /([a-zàâäéèêëïîôùûüÿœæç\s-]+?)\s+(\d+(?:[.,]\d+)?)\s*(?:mètres?|m2|m²|unités?|pièces?|heures?|jours?)\s*(?:à|pour)\s*(\d+(?:[.,]\d+)?)\s*euros?/gi
    ];
    
    let foundPrestations = false;
    let prestationIndex = 0;
    
    for (let pattern of prestationPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            if (prestationIndex === 0) {
                // Utiliser la première ligne existante
                document.querySelector('#prestationRow0 .prestation-designation').value = capitalizeWords(match[1].trim());
                document.querySelector('#prestationRow0 .prestation-qte').value = match[2].replace(',', '.');
                document.querySelector('#prestationRow0 .prestation-pu').value = match[3].replace(',', '.');
            } else {
                // Ajouter de nouvelles lignes
                addPrestationRow();
                const newRow = document.getElementById('prestationRow' + prestationIndex);
                newRow.querySelector('.prestation-designation').value = capitalizeWords(match[1].trim());
                newRow.querySelector('.prestation-qte').value = match[2].replace(',', '.');
                newRow.querySelector('.prestation-pu').value = match[3].replace(',', '.');
            }
            prestationIndex++;
            foundPrestations = true;
        }
    }
    
    if (foundPrestations) {
        calculateTotals();
        alert('✅ Devis rempli avec succès ! Vérifiez et ajustez si nécessaire.');
    } else {
        alert('⚠️ Aucune prestation détectée. Essayez de dicter plus clairement.\n\nExemple : "Prestation peinture 12 mètres carrés à 25 euros le mètre carré"');
    }
}

// Ajouter une ligne de prestation
function addPrestationRow() {
    const tbody = document.getElementById('prestationsBody');
    const newRow = document.createElement('tr');
    newRow.id = 'prestationRow' + prestationCount;
    newRow.innerHTML = `
        <td class="border p-2"><input type="text" class="w-full p-1 border rounded prestation-designation" placeholder="Description"></td>
        <td class="border p-2"><input type="number" class="w-full p-1 border rounded text-center prestation-qte" value="1" min="0" step="0.01"></td>
        <td class="border p-2"><input type="number" class="w-full p-1 border rounded text-right prestation-pu" value="0" min="0" step="0.01"></td>
        <td class="border p-2 text-right prestation-total">0.00 €</td>
        <td class="border p-2 text-center no-print"><button class="text-red-600 hover:text-red-800 remove-prestation"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(newRow);
    prestationCount++;
}

// Calculer les totaux
function calculateTotals() {
    const rows = document.querySelectorAll('#prestationsBody tr');
    let totalHT = 0;
    
    rows.forEach(row => {
        // Skip separator rows (lot headers)
        const qteInput = row.querySelector('.prestation-qte');
        const puInput = row.querySelector('.prestation-pu');
        
        if (!qteInput || !puInput) {
            return; // C'est une ligne de séparateur, on la saute
        }
        
        const qte = parseFloat(qteInput.value) || 0;
        const pu = parseFloat(puInput.value) || 0;
        const total = qte * pu;
        
        const totalCell = row.querySelector('.prestation-total');
        if (totalCell) {
            totalCell.textContent = formatPrice(total);
        }
        totalHT += total;
    });
    
    const tauxTVA = parseFloat(document.getElementById('tauxTVA').value) || 0;
    const montantTVA = totalHT * (tauxTVA / 100);
    const totalTTC = totalHT + montantTVA;
    
    document.getElementById('totalHT').textContent = formatPrice(totalHT);
    document.getElementById('montantTVA').textContent = formatPrice(montantTVA);
    document.getElementById('totalTTC').textContent = formatPrice(totalTTC);
}


// Fonctions utilitaires
function formatPrice(value) {
    return value.toFixed(2) + ' €';
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Gestion des paramètres
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('artisanSettings') || '{}');
    
    // Afficher les infos artisan sur le devis
    document.getElementById('artisanNomDisplay').textContent = settings.nom || '';
    document.getElementById('artisanAdresseDisplay').textContent = settings.adresse || '';
    document.getElementById('artisanTelDisplay').textContent = settings.tel || '';
    document.getElementById('artisanEmailDisplay').textContent = settings.email || '';
    document.getElementById('artisanSiretDisplay').textContent = settings.siret ? 'SIRET: ' + settings.siret : '';
    
    // Charger les conditions par défaut
    if (settings.conditions) {
        document.getElementById('conditions').value = settings.conditions;
    }
    
    // Charger le taux de TVA par défaut
    if (settings.tva) {
        document.getElementById('tauxTVA').value = settings.tva;
    }
    
    // Si pas de paramètres, ouvrir le modal au premier chargement
    if (!settings.nom) {
        setTimeout(() => {
            openSettingsModal();
            alert('👋 Bienvenue ! Configurez d\'abord vos informations d\'entreprise.');
        }, 500);
    }
}

function openSettingsModal() {
    const settings = JSON.parse(localStorage.getItem('artisanSettings') || '{}');
    
    // Remplir les champs du modal avec les valeurs existantes
    document.getElementById('settingsNom').value = settings.nom || '';
    document.getElementById('settingsAdresse').value = settings.adresse || '';
    document.getElementById('settingsTel').value = settings.tel || '';
    document.getElementById('settingsEmail').value = settings.email || '';
    document.getElementById('settingsSiret').value = settings.siret || '';
    document.getElementById('settingsConditions').value = settings.conditions || 'Acompte de 30% à la commande\nSolde à la livraison\nDevis valable 30 jours';
    document.getElementById('settingsTVA').value = settings.tva || '20';
    document.getElementById('settingsOpenAIKey').value = settings.openaiKey || '';
    
    // Afficher le modal
    document.getElementById('settingsModal').classList.remove('hidden');
    document.getElementById('settingsModal').classList.add('flex');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.add('hidden');
    document.getElementById('settingsModal').classList.remove('flex');
}

function saveSettings() {
    const nom = document.getElementById('settingsNom').value.trim();
    const adresse = document.getElementById('settingsAdresse').value.trim();
    const tel = document.getElementById('settingsTel').value.trim();
    
    // Validation
    if (!nom || !adresse || !tel) {
        alert('⚠️ Veuillez remplir au moins le nom, l\'adresse et le téléphone de votre entreprise.');
        return;
    }
    
    // Sauvegarder les paramètres
    const settings = {
        nom: nom,
        adresse: adresse,
        tel: tel,
        email: document.getElementById('settingsEmail').value.trim(),
        siret: document.getElementById('settingsSiret').value.trim(),
        conditions: document.getElementById('settingsConditions').value,
        tva: document.getElementById('settingsTVA').value,
        openaiKey: document.getElementById('settingsOpenAIKey').value.trim()
    };
    
    localStorage.setItem('artisanSettings', JSON.stringify(settings));
    
    // Recharger l'affichage
    loadSettings();
    
    closeSettingsModal();
    alert('✅ Paramètres enregistrés avec succès !');
}

function newDevis() {
    // Réinitialiser le formulaire client
    document.getElementById('clientNom').value = '';
    document.getElementById('clientAdresse').value = '';
    document.getElementById('clientTel').value = '';
    
    // Réinitialiser les prestations
    const tbody = document.getElementById('prestationsBody');
    tbody.innerHTML = `
        <tr id="prestationRow0">
            <td class="border p-2"><input type="text" class="w-full p-1 border rounded prestation-designation" placeholder="Description"></td>
            <td class="border p-2"><input type="number" class="w-full p-1 border rounded text-center prestation-qte" value="1" min="0" step="0.01"></td>
            <td class="border p-2"><input type="number" class="w-full p-1 border rounded text-right prestation-pu" value="0" min="0" step="0.01"></td>
            <td class="border p-2 text-right prestation-total">0.00 €</td>
            <td class="border p-2 text-center no-print"><button class="text-red-600 hover:text-red-800 remove-prestation"><i class="fas fa-trash"></i></button></td>
        </tr>
    `;
    prestationCount = 1;
    
    // Réinitialiser le transcript
    document.getElementById('transcript').value = '';
    
    // Cacher la réponse IA si visible
    document.getElementById('aiResponse').classList.add('hidden');
    
    // Réinitialiser l'historique de conversation
    conversationHistory = [];
    currentAIData = null;
    
    // Générer nouveau numéro de devis
    initDevisDate();
    
    // Recalculer les totaux
    calculateTotals();
    
    alert('✅ Nouveau devis créé !');
}

// Appeler l'assistant IA
let currentAIData = null;
let conversationHistory = []; // Historique de la conversation

async function callAIAssistant() {
    console.log('🔍 callAIAssistant() appelée');
    
    const text = document.getElementById('transcript').value.trim();
    console.log('📝 Texte saisi:', text);
    
    if (!text) {
        alert('⚠️ Dictez ou écrivez d\'abord ce que vous voulez faire.\n\nExemple : "Je veux faire un parquet dans une chambre de 12 mètres carrés"');
        return;
    }
    
    // Récupérer la clé API
    const settings = JSON.parse(localStorage.getItem('artisanSettings') || '{}');
    const apiKey = settings.openaiKey;
    
    console.log('🔑 Clé API présente:', apiKey ? 'OUI' : 'NON');
    
    if (!apiKey) {
        alert('⚠️ Clé API OpenAI non configurée.\n\nAllez dans Paramètres > Assistant IA (OpenAI) pour ajouter votre clé API.');
        return;
    }
    
    // Ajouter les prix personnalisés au prompt
    const personalizedPrices = getPersonalizedPricesForAI();
    const enrichedPrompt = text + personalizedPrices;
    
    console.log('📤 Envoi requête à l\'API...');
    
    // Afficher un loader
    const btn = document.getElementById('aiAssistBtn');
    if (!btn) {
        console.error('❌ Bouton aiAssistBtn introuvable !');
        alert('❌ Erreur: Bouton IA introuvable. Rechargez la page.');
        return;
    }
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>L\'IA réfléchit...';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/ai-assistant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: enrichedPrompt,
                apiKey: apiKey,
                conversationHistory: conversationHistory
            })
        });
        
        console.log('📥 Réponse reçue, status:', response.status);
        
        const data = await response.json();
        console.log('📦 Données:', data);
        
        if (!response.ok) {
            throw new Error(data.error || 'Erreur inconnue');
        }
        
        // Ajouter le message utilisateur à l'historique (sans les prix)
        conversationHistory.push({
            role: 'user',
            content: text
        });
        
        // Ajouter la réponse de l'IA à l'historique
        conversationHistory.push({
            role: 'assistant',
            content: data.response
        });
        
        console.log('✅ Historique mis à jour, affichage de la réponse...');
        
        // Effacer le champ de saisie pour la prochaine réponse
        document.getElementById('transcript').value = '';
        
        // Afficher la réponse
        displayAIResponse(data.response);
        
    } catch (error) {
        console.error('❌ Erreur complète:', error);
        
        let errorMsg = '❌ Erreur lors de l\'appel à l\'IA:\n\n';
        
        if (error.message.includes('Failed to fetch')) {
            errorMsg += '🌐 Problème de connexion réseau.\n\nVérifiez:\n- Votre connexion internet\n- Que le serveur est accessible';
        } else if (error.message.includes('API')) {
            errorMsg += '🔑 Problème avec votre clé API OpenAI.\n\nVérifiez:\n- Que votre clé est valide\n- Que vous avez des crédits OpenAI\n- Que la clé n\'est pas expirée';
        } else {
            errorMsg += error.message;
        }
        
        errorMsg += '\n\n💡 Consultez la console (F12) pour plus de détails.';
        
        alert(errorMsg);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        console.log('🔄 Bouton réinitialisé');
    }
}

// Répondre à une question de l'IA en cliquant sur un bouton
async function answerAIQuestion(answer) {
    if (!answer || answer.trim() === '') {
        alert('⚠️ Veuillez entrer une réponse');
        return;
    }
    
    // Mettre la réponse dans le champ transcript
    document.getElementById('transcript').value = answer;
    
    // Appeler automatiquement l'assistant IA
    await callAIAssistant();
}

function displayAIResponse(response) {
    try {
        // Essayer de parser le JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            currentAIData = JSON.parse(jsonMatch[0]);
            
            // Formater l'affichage
            let displayText = '';
            
            // MODE QUESTIONS : L'IA pose des questions
            if (currentAIData.mode === 'questions') {
                // Créer une interface HTML avec des boutons
                let htmlContent = '<div class="space-y-4">';
                
                if (currentAIData.analyse_partielle) {
                    htmlContent += `<div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                        <p class="text-blue-800"><strong>📋 Analyse :</strong> ${currentAIData.analyse_partielle}</p>
                    </div>`;
                }
                
                htmlContent += '<div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">';
                htmlContent += '<p class="text-yellow-800 font-bold mb-2">❓ L\'IA a besoin de plus d\'informations :</p>';
                htmlContent += '</div>';
                
                currentAIData.questions.forEach((q, index) => {
                    const importanceClass = q.importance === 'critique' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50';
                    const importanceIcon = q.importance === 'critique' ? '❗' : '📝';
                    
                    htmlContent += `<div class="border-l-4 ${importanceClass} p-4 rounded">`;
                    htmlContent += `<p class="font-bold text-gray-800 mb-3">${importanceIcon} Question ${index + 1} : ${q.question}</p>`;
                    
                    if (q.options && q.options.length > 0) {
                        htmlContent += '<div class="space-y-2">';
                        q.options.forEach((opt, optIndex) => {
                            htmlContent += `
                                <button onclick="answerAIQuestion('${opt.replace(/'/g, "\\'")}')" 
                                        class="w-full text-left px-4 py-3 bg-white hover:bg-blue-100 border-2 border-blue-300 hover:border-blue-500 rounded-lg transition shadow-sm hover:shadow-md">
                                    <span class="font-semibold text-blue-600">Option ${optIndex + 1}:</span> 
                                    <span class="text-gray-800">${opt}</span>
                                </button>
                            `;
                        });
                        htmlContent += '</div>';
                    } else {
                        // Pas d'options : champ de saisie libre
                        htmlContent += `
                            <div class="flex gap-2 mt-2">
                                <input type="text" id="freeAnswer${index}" placeholder="Votre réponse..." 
                                       class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                <button onclick="answerAIQuestion(document.getElementById('freeAnswer${index}').value)" 
                                        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">
                                    Envoyer
                                </button>
                            </div>
                        `;
                    }
                    
                    htmlContent += '</div>';
                });
                
                // Bouton "Génère le devis maintenant"
                htmlContent += `
                    <div class="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                        <p class="text-green-800 mb-3"><strong>✅ Vous avez assez d'infos ?</strong></p>
                        <button onclick="answerAIQuestion('génère le devis maintenant')" 
                                class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl">
                            <i class="fas fa-check-circle mr-2"></i>
                            Générer le devis maintenant
                        </button>
                    </div>
                `;
                
                // Bouton alternative vocale/texte
                htmlContent += `
                    <div class="mt-4 p-3 bg-gray-50 border border-gray-300 rounded-lg text-center">
                        <p class="text-sm text-gray-600">
                            <i class="fas fa-microphone mr-2"></i>
                            Vous pouvez aussi répondre par <strong>voix</strong> ou <strong>texte</strong> ci-dessus, puis cliquer sur "🤖 Assistant IA"
                        </p>
                    </div>
                `;
                
                htmlContent += '</div>';
                
                document.getElementById('aiResponseText').innerHTML = htmlContent;
                document.getElementById('aiResponse').classList.remove('hidden');
                
                // Cacher le bouton "Appliquer" en mode questions
                document.getElementById('applyAiBtn').classList.add('hidden');
                
                return;
            }
            
            // MODE DEVIS : L'IA génère le devis final
            if (currentAIData.mode === 'devis') {
                if (currentAIData.analyse) {
                    displayText += '📋 ' + currentAIData.analyse + '\n\n';
                }
                
                // Gestion du nouveau format avec lots
                if (currentAIData.lots && currentAIData.lots.length > 0) {
                    displayText += '✅ DEVIS FINAL PAR LOT :\n\n';
                    
                    currentAIData.lots.forEach((lot, lotIndex) => {
                        displayText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                        displayText += `📦 LOT ${lotIndex + 1} : ${lot.nom_lot}\n`;
                        displayText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                        
                        let totalLot = 0;
                        lot.prestations.forEach((p, index) => {
                            const totalPresta = p.quantite * p.prix_unitaire;
                            totalLot += totalPresta;
                            displayText += `${index + 1}. ${p.designation}\n`;
                            displayText += `   Quantité: ${p.quantite} ${p.unite || ''}\n`;
                            displayText += `   Prix unitaire: ${p.prix_unitaire}€\n`;
                            displayText += `   Total: ${totalPresta.toFixed(2)}€\n\n`;
                        });
                        
                        displayText += `   ➡️ SOUS-TOTAL LOT : ${totalLot.toFixed(2)}€ HT\n\n`;
                    });
                }
                
                if (currentAIData.hypotheses) {
                    displayText += '\n⚠️ HYPOTHÈSES PRISES :\n' + currentAIData.hypotheses + '\n\n';
                }
                
                if (currentAIData.conseils) {
                    displayText += '💡 CONSEILS :\n' + currentAIData.conseils;
                }
                
                document.getElementById('aiResponseText').textContent = displayText;
                document.getElementById('aiResponse').classList.remove('hidden');
                
                // Afficher le bouton "Appliquer" en mode devis
                document.getElementById('applyAiBtn').classList.remove('hidden');
                
                return;
            }
            
            // ANCIEN FORMAT (rétrocompatibilité) - avec lots mais sans mode
            if (currentAIData.lots && currentAIData.lots.length > 0) {
                if (currentAIData.analyse) {
                    displayText += '📋 ' + currentAIData.analyse + '\n\n';
                }
                
                displayText += '✅ PRESTATIONS PAR LOT :\n\n';
                
                currentAIData.lots.forEach((lot, lotIndex) => {
                    displayText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                    displayText += `📦 LOT ${lotIndex + 1} : ${lot.nom_lot}\n`;
                    displayText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                    
                    let totalLot = 0;
                    lot.prestations.forEach((p, index) => {
                        const totalPresta = p.quantite * p.prix_unitaire;
                        totalLot += totalPresta;
                        displayText += `${index + 1}. ${p.designation}\n`;
                        displayText += `   Quantité: ${p.quantite} ${p.unite || ''}\n`;
                        displayText += `   Prix unitaire: ${p.prix_unitaire}€\n`;
                        displayText += `   Total: ${totalPresta.toFixed(2)}€\n\n`;
                    });
                    
                    displayText += `   ➡️ SOUS-TOTAL LOT : ${totalLot.toFixed(2)}€ HT\n\n`;
                });
                
                if (currentAIData.conseils) {
                    displayText += '💡 CONSEILS :\n' + currentAIData.conseils;
                }
                
                document.getElementById('aiResponseText').textContent = displayText;
                document.getElementById('aiResponse').classList.remove('hidden');
                document.getElementById('applyAiBtn').classList.remove('hidden');
                
                return;
            }
            
            // Ancien format sans lots (rétrocompatibilité)
            if (currentAIData.prestations && currentAIData.prestations.length > 0) {
                if (currentAIData.analyse) {
                    displayText += '📋 ' + currentAIData.analyse + '\n\n';
                }
                
                displayText += '✅ PRESTATIONS PROPOSÉES :\n\n';
                currentAIData.prestations.forEach((p, index) => {
                    displayText += `${index + 1}. ${p.designation}\n`;
                    displayText += `   Quantité: ${p.quantite} ${p.unite || ''}\n`;
                    displayText += `   Prix unitaire: ${p.prix_unitaire}€\n`;
                    displayText += `   Total: ${(p.quantite * p.prix_unitaire).toFixed(2)}€\n\n`;
                });
                
                if (currentAIData.conseils) {
                    displayText += '💡 CONSEILS :\n' + currentAIData.conseils;
                }
                
                document.getElementById('aiResponseText').textContent = displayText;
                document.getElementById('aiResponse').classList.remove('hidden');
                document.getElementById('applyAiBtn').classList.remove('hidden');
                
                return;
            }
            
        } else {
            // Réponse non JSON
            currentAIData = null;
            document.getElementById('aiResponseText').textContent = response;
            document.getElementById('aiResponse').classList.remove('hidden');
            document.getElementById('applyAiBtn').classList.add('hidden');
        }
    } catch (error) {
        console.error('Erreur parsing:', error);
        currentAIData = null;
        document.getElementById('aiResponseText').textContent = response;
        document.getElementById('aiResponse').classList.remove('hidden');
        document.getElementById('applyAiBtn').classList.add('hidden');
    }
}

function applyAIResponse() {
    // Vérifier que nous sommes en mode devis
    if (!currentAIData || currentAIData.mode === 'questions') {
        alert('⚠️ L\'IA a encore des questions. Répondez d\'abord aux questions posées.');
        return;
    }
    
    // Réinitialiser l'historique de conversation après application
    conversationHistory = [];
    
    // Gérer le nouveau format avec lots
    if (currentAIData && currentAIData.lots && currentAIData.lots.length > 0) {
        // Réinitialiser les prestations
        const tbody = document.getElementById('prestationsBody');
        tbody.innerHTML = '';
        prestationCount = 0;
        
        // Parcourir chaque lot
        currentAIData.lots.forEach((lot, lotIndex) => {
            // Ajouter une ligne de séparateur pour le lot
            const separatorRow = document.createElement('tr');
            separatorRow.className = 'bg-blue-100 font-bold';
            separatorRow.innerHTML = `
                <td colspan="5" class="border-2 border-blue-300 p-3 text-center text-blue-800">
                    <i class="fas fa-folder-open mr-2"></i>
                    ${lot.nom_lot}
                </td>
            `;
            tbody.appendChild(separatorRow);
            
            // Ajouter chaque prestation du lot
            lot.prestations.forEach((prestation) => {
                const row = document.createElement('tr');
                row.id = 'prestationRow' + prestationCount;
                row.innerHTML = `
                    <td class="border p-2"><input type="text" class="w-full p-1 border rounded prestation-designation" value="${prestation.designation}"></td>
                    <td class="border p-2"><input type="number" class="w-full p-1 border rounded text-center prestation-qte" value="${prestation.quantite}" min="0" step="0.01"></td>
                    <td class="border p-2"><input type="number" class="w-full p-1 border rounded text-right prestation-pu" value="${prestation.prix_unitaire}" min="0" step="0.01"></td>
                    <td class="border p-2 text-right prestation-total">0.00 €</td>
                    <td class="border p-2 text-center no-print"><button class="text-red-600 hover:text-red-800 remove-prestation"><i class="fas fa-trash"></i></button></td>
                `;
                tbody.appendChild(row);
                prestationCount++;
            });
        });
        
        // Recalculer les totaux
        calculateTotals();
        
        // Cacher la réponse IA
        document.getElementById('aiResponse').classList.add('hidden');
        
        alert('✅ Devis rempli avec les suggestions de l\'IA par lots !\nVous pouvez maintenant modifier si nécessaire.');
        return;
    }
    
    // Ancien format sans lots (rétrocompatibilité)
    if (!currentAIData || !currentAIData.prestations) {
        alert('⚠️ Impossible d\'appliquer la réponse IA');
        return;
    }
    
    // Réinitialiser les prestations
    const tbody = document.getElementById('prestationsBody');
    tbody.innerHTML = '';
    prestationCount = 0;
    
    // Ajouter chaque prestation
    currentAIData.prestations.forEach((prestation, index) => {
        const row = document.createElement('tr');
        row.id = 'prestationRow' + prestationCount;
        row.innerHTML = `
            <td class="border p-2"><input type="text" class="w-full p-1 border rounded prestation-designation" value="${prestation.designation}"></td>
            <td class="border p-2"><input type="number" class="w-full p-1 border rounded text-center prestation-qte" value="${prestation.quantite}" min="0" step="0.01"></td>
            <td class="border p-2"><input type="number" class="w-full p-1 border rounded text-right prestation-pu" value="${prestation.prix_unitaire}" min="0" step="0.01"></td>
            <td class="border p-2 text-right prestation-total">0.00 €</td>
            <td class="border p-2 text-center no-print"><button class="text-red-600 hover:text-red-800 remove-prestation"><i class="fas fa-trash"></i></button></td>
        `;
        tbody.appendChild(row);
        prestationCount++;
    });
    
    // Recalculer les totaux
    calculateTotals();
    
    // Cacher la réponse IA
    document.getElementById('aiResponse').classList.add('hidden');
    
    alert('✅ Devis rempli avec les suggestions de l\'IA !\nVous pouvez maintenant modifier si nécessaire.');
}

// ============================================
// GESTION HISTORIQUE & SAUVEGARDE
// ============================================

// Sauvegarder automatiquement le devis actuel
function saveCurrentDevis(statut = 'brouillon') {
    const devisData = collectDevisData();
    if (!devisData) {
        alert('⚠️ Impossible de sauvegarder : données incomplètes');
        return null;
    }
    
    // Ajouter des métadonnées
    devisData.id = devisData.id || Date.now().toString();
    devisData.statut = statut;
    devisData.date_creation = devisData.date_creation || new Date().toISOString();
    devisData.date_modification = new Date().toISOString();
    
    // Charger l'historique existant
    const historique = JSON.parse(localStorage.getItem('historique_devis') || '[]');
    
    // Vérifier si le devis existe déjà (mise à jour)
    const existingIndex = historique.findIndex(d => d.numero === devisData.numero);
    
    if (existingIndex !== -1) {
        // Mise à jour
        historique[existingIndex] = devisData;
    } else {
        // Nouveau devis
        historique.push(devisData);
    }
    
    // Sauvegarder
    localStorage.setItem('historique_devis', JSON.stringify(historique));
    
    // Extraire les prix vers la base de prix
    extractPrixFromCurrentDevis(devisData);
    
    return devisData;
}

// Collecter toutes les données du devis actuel
function collectDevisData() {
    // Informations artisan
    const settings = JSON.parse(localStorage.getItem('artisan_settings') || '{}');
    
    // Informations client
    const clientNom = document.getElementById('clientNom')?.value.trim();
    const clientAdresse = document.getElementById('clientAdresse')?.value.trim();
    const clientTel = document.getElementById('clientTel')?.value.trim();
    
    if (!clientNom) {
        return null; // Devis incomplet
    }
    
    // Numéro et date
    const numero = document.getElementById('devisNum')?.textContent;
    const date = document.getElementById('devisDate')?.textContent;
    
    // Prestations avec détection des lots
    const tbody = document.getElementById('prestationsBody');
    const rows = tbody.querySelectorAll('tr');
    
    const lots = [];
    let currentLot = null;
    
    rows.forEach(row => {
        // Vérifier si c'est un séparateur de lot
        if (row.classList.contains('bg-blue-100')) {
            const lotName = row.textContent.trim();
            currentLot = {
                nom_lot: lotName,
                prestations: []
            };
            lots.push(currentLot);
        } else {
            // C'est une prestation
            const designation = row.querySelector('.prestation-designation')?.value.trim();
            const qte = parseFloat(row.querySelector('.prestation-qte')?.value) || 0;
            const pu = parseFloat(row.querySelector('.prestation-pu')?.value) || 0;
            
            if (designation && qte > 0) {
                const prestation = {
                    designation,
                    quantite: qte,
                    unite: 'm²', // Détection automatique à améliorer
                    prix_unitaire: pu,
                    type: designation.toLowerCase().includes('main d\'oeuvre') || designation.toLowerCase().includes('pose') ? 'main_oeuvre' : 'fourniture'
                };
                
                if (currentLot) {
                    currentLot.prestations.push(prestation);
                } else {
                    // Pas de lot défini, créer un lot par défaut
                    if (lots.length === 0) {
                        lots.push({
                            nom_lot: 'PRESTATIONS',
                            prestations: []
                        });
                        currentLot = lots[0];
                    }
                    currentLot.prestations.push(prestation);
                }
            }
        }
    });
    
    // Totaux
    const totalHT = parseFloat(document.getElementById('totalHT')?.textContent) || 0;
    const tvaTaux = parseFloat(document.getElementById('tva')?.value) || 20;
    const tvaMontant = parseFloat(document.getElementById('montantTVA')?.textContent) || 0;
    const totalTTC = parseFloat(document.getElementById('totalTTC')?.textContent) || 0;
    
    // Conditions de paiement
    const conditionsPaiement = document.getElementById('conditionsPaiement')?.value.trim();
    
    return {
        id: Date.now().toString(),
        numero,
        date_creation: new Date().toISOString(),
        client_nom: clientNom,
        client_adresse: clientAdresse,
        client_tel: clientTel,
        artisan_nom: settings.artisanName || '',
        artisan_adresse: settings.artisanAddress || '',
        artisan_tel: settings.artisanPhone || '',
        artisan_email: settings.artisanEmail || '',
        artisan_siret: settings.artisanSiret || '',
        lots,
        total_ht: totalHT,
        tva_taux: tvaTaux,
        tva_montant: tvaMontant,
        total_ttc: totalTTC,
        conditions_paiement: conditionsPaiement,
        statut: 'brouillon'
    };
}

// Extraire les prix du devis actuel vers la base de prix
function extractPrixFromCurrentDevis(devisData) {
    const basePrix = JSON.parse(localStorage.getItem('base_prix') || '[]');
    let newPrixCount = 0;
    
    function addOrUpdatePrix(prestation) {
        const designation = prestation.designation.trim();
        
        // Chercher si ce prix existe déjà
        const existingPrix = basePrix.find(p => 
            p.designation.toLowerCase() === designation.toLowerCase()
        );
        
        if (existingPrix) {
            // Mettre à jour le compteur d'usage
            existingPrix.usage_count = (existingPrix.usage_count || 0) + 1;
            existingPrix.date_modification = new Date().toISOString();
            // Mettre à jour le prix si différent
            if (Math.abs(existingPrix.prix_unitaire - prestation.prix_unitaire) > 0.01) {
                existingPrix.prix_unitaire = prestation.prix_unitaire;
            }
        } else {
            // Ajouter un nouveau prix
            const newPrix = {
                id: Date.now().toString() + Math.random(),
                designation: designation,
                categorie: deduceCategorie(designation),
                type: prestation.type || 'main_oeuvre',
                prix_unitaire: parseFloat(prestation.prix_unitaire) || 0,
                unite: prestation.unite || 'm²',
                notes: `Extrait du devis ${devisData.numero}`,
                usage_count: 1,
                date_creation: new Date().toISOString(),
                date_modification: new Date().toISOString()
            };
            basePrix.push(newPrix);
            newPrixCount++;
        }
    }
    
    // Extraire depuis les lots
    if (devisData.lots && devisData.lots.length > 0) {
        devisData.lots.forEach(lot => {
            lot.prestations.forEach(prestation => {
                addOrUpdatePrix(prestation);
            });
        });
    }
    
    localStorage.setItem('base_prix', JSON.stringify(basePrix));
    
    if (newPrixCount > 0) {
        console.log(`✅ ${newPrixCount} nouveaux prix ajoutés à votre base`);
    }
}

// Déduire la catégorie depuis la désignation
function deduceCategorie(designation) {
    const lower = designation.toLowerCase();
    
    if (lower.includes('parquet')) return 'parquet';
    if (lower.includes('peinture') || lower.includes('peintre')) return 'peinture';
    if (lower.includes('carrelage') || lower.includes('carreau')) return 'carrelage';
    if (lower.includes('plomberie') || lower.includes('douche') || lower.includes('robinet')) return 'plomberie';
    if (lower.includes('électric') || lower.includes('éléctric')) return 'electricite';
    if (lower.includes('maçon') || lower.includes('béton') || lower.includes('ciment')) return 'maconnerie';
    
    return 'autre';
}

// Exporter en PDF
function exportToPDF() {
    // Sauvegarder d'abord le devis
    const devis = saveCurrentDevis('envoye');
    
    if (!devis) {
        alert('⚠️ Impossible d\'exporter : veuillez remplir au minimum le nom du client');
        return;
    }
    
    // Vérifier que jsPDF est chargé
    if (typeof window.jspdf === 'undefined') {
        alert('❌ Erreur : bibliothèque PDF non chargée');
        return;
    }
    
    // Fonction pour nettoyer le texte (supprimer emojis et caractères spéciaux problématiques)
    function cleanText(text) {
        if (!text) return '';
        // Supprimer les emojis et caractères Unicode problématiques
        return text.replace(/[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
                   .trim();
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        
        let yPosition = margin;
        
        // ========================================
        // EN-TÊTE ENTREPRISE
        // ========================================
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 78, 121); // Bleu foncé
        doc.text(cleanText(devis.artisan_nom) || 'Entreprise', margin, yPosition);
        
        yPosition += 7;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        if (devis.artisan_adresse) {
            doc.text(cleanText(devis.artisan_adresse), margin, yPosition);
            yPosition += 5;
        }
        
        const contactLine = [];
        if (devis.artisan_tel) contactLine.push('Tel: ' + cleanText(devis.artisan_tel));
        if (devis.artisan_email) contactLine.push('Email: ' + cleanText(devis.artisan_email));
        if (contactLine.length > 0) {
            doc.text(contactLine.join(' - '), margin, yPosition);
            yPosition += 5;
        }
        
        if (devis.artisan_siret) {
            doc.text('SIRET: ' + cleanText(devis.artisan_siret), margin, yPosition);
            yPosition += 5;
        }
        
        // Ligne de séparation
        yPosition += 3;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
        
        // ========================================
        // TITRE DEVIS
        // ========================================
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 78, 121);
        doc.text('DEVIS', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
        
        // ========================================
        // INFO DEVIS ET CLIENT (2 COLONNES)
        // ========================================
        const col1X = margin;
        const col2X = pageWidth / 2 + 5;
        let col1Y = yPosition;
        let col2Y = yPosition;
        
        // Colonne gauche : Info devis
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Numero:', col1X, col1Y);
        col1Y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(cleanText(devis.numero), col1X, col1Y);
        col1Y += 8;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Date:', col1X, col1Y);
        col1Y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(new Date(devis.date_creation).toLocaleDateString('fr-FR'), col1X, col1Y);
        
        // Colonne droite : Info client
        doc.setFont('helvetica', 'bold');
        doc.text('Client:', col2X, col2Y);
        col2Y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(cleanText(devis.client_nom), col2X, col2Y);
        col2Y += 6;
        
        if (devis.client_adresse) {
            const addrLines = doc.splitTextToSize(cleanText(devis.client_adresse), contentWidth / 2 - 10);
            addrLines.forEach(line => {
                doc.text(line, col2X, col2Y);
                col2Y += 5;
            });
        }
        
        if (devis.client_tel) {
            doc.text('Tel: ' + cleanText(devis.client_tel), col2X, col2Y);
            col2Y += 5;
        }
        
        yPosition = Math.max(col1Y, col2Y) + 10;
        
        // ========================================
        // PRESTATIONS PAR LOT
        // ========================================
        if (devis.lots && devis.lots.length > 0) {
            devis.lots.forEach((lot, lotIndex) => {
                // Vérifier s'il reste assez de place pour le lot
                if (yPosition > pageHeight - 60) {
                    doc.addPage();
                    yPosition = margin;
                }
                
                // En-tête du lot (sans emoji)
                const lotTitle = 'LOT ' + (lotIndex + 1) + ' : ' + cleanText(lot.nom_lot).toUpperCase();
                doc.setFillColor(59, 130, 246); // Bleu
                doc.rect(margin, yPosition, contentWidth, 8, 'F');
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(255, 255, 255);
                doc.text(lotTitle, margin + 3, yPosition + 5.5);
                yPosition += 10;
                
                // Tableau des prestations du lot
                const tableData = lot.prestations.map(p => [
                    cleanText(p.designation),
                    p.quantite.toString(),
                    cleanText(p.unite) || '',
                    p.prix_unitaire.toFixed(2) + ' EUR',
                    (p.quantite * p.prix_unitaire).toFixed(2) + ' EUR'
                ]);
                
                // Calculer la hauteur estimée du tableau
                const estimatedHeight = (tableData.length + 1) * 8 + 10;
                
                // Si le tableau ne rentre pas, nouvelle page
                if (yPosition + estimatedHeight > pageHeight - 40) {
                    doc.addPage();
                    yPosition = margin;
                    
                    // Répéter l'en-tête du lot sur la nouvelle page
                    doc.setFillColor(59, 130, 246);
                    doc.rect(margin, yPosition, contentWidth, 8, 'F');
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(255, 255, 255);
                    doc.text(lotTitle + ' (suite)', margin + 3, yPosition + 5.5);
                    yPosition += 10;
                }
                
                // En-tête du tableau
                doc.setFillColor(240, 240, 240);
                doc.rect(margin, yPosition, contentWidth, 7, 'F');
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                
                const colWidths = [contentWidth * 0.45, contentWidth * 0.12, contentWidth * 0.12, contentWidth * 0.15, contentWidth * 0.16];
                let xPos = margin;
                
                ['Designation', 'Qte', 'Unite', 'P.U. HT', 'Total HT'].forEach((header, i) => {
                    doc.text(header, xPos + 2, yPosition + 5);
                    xPos += colWidths[i];
                });
                yPosition += 7;
                
                // Lignes du tableau
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                tableData.forEach((row, rowIndex) => {
                    // Vérifier si on doit passer à la page suivante
                    if (yPosition > pageHeight - 30) {
                        doc.addPage();
                        yPosition = margin;
                        
                        // Répéter l'en-tête sur nouvelle page
                        doc.setFillColor(240, 240, 240);
                        doc.rect(margin, yPosition, contentWidth, 7, 'F');
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'bold');
                        
                        xPos = margin;
                        ['Designation', 'Qte', 'Unite', 'P.U. HT', 'Total HT'].forEach((header, i) => {
                            doc.text(header, xPos + 2, yPosition + 5);
                            xPos += colWidths[i];
                        });
                        yPosition += 7;
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(8);
                    }
                    
                    // Fond alterné
                    if (rowIndex % 2 === 0) {
                        doc.setFillColor(250, 250, 250);
                        doc.rect(margin, yPosition, contentWidth, 6, 'F');
                    }
                    
                    xPos = margin;
                    row.forEach((cell, i) => {
                        const align = i > 0 ? 'right' : 'left';
                        const cellX = i > 0 ? xPos + colWidths[i] - 2 : xPos + 2;
                        doc.text(cell, cellX, yPosition + 4, { align: align });
                        xPos += colWidths[i];
                    });
                    yPosition += 6;
                });
                
                yPosition += 5;
            });
        }
        
        // ========================================
        // TOTAUX
        // ========================================
        // S'assurer qu'il reste de la place pour les totaux
        if (yPosition > pageHeight - 50) {
            doc.addPage();
            yPosition = margin;
        }
        
        yPosition += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
        
        const totalX = pageWidth - margin - 50;
        const labelX = totalX - 40;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Total HT:', labelX, yPosition, { align: 'right' });
        doc.text(devis.total_ht.toFixed(2) + ' EUR', totalX, yPosition, { align: 'right' });
        yPosition += 6;
        
        doc.text('TVA (' + devis.tva_taux + '%):', labelX, yPosition, { align: 'right' });
        doc.text(devis.tva_montant.toFixed(2) + ' EUR', totalX, yPosition, { align: 'right' });
        yPosition += 8;
        
        // Total TTC mis en valeur
        doc.setFillColor(59, 130, 246);
        doc.rect(labelX - 45, yPosition - 5, 95, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('Total TTC:', labelX, yPosition, { align: 'right' });
        doc.text(devis.total_ttc.toFixed(2) + ' EUR', totalX, yPosition, { align: 'right' });
        yPosition += 10;
        
        // ========================================
        // CONDITIONS DE PAIEMENT
        // ========================================
        if (devis.conditions_paiement) {
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            yPosition += 5;
            
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = margin;
            }
            
            doc.text('Conditions de paiement:', margin, yPosition);
            yPosition += 6;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const conditionsLines = doc.splitTextToSize(cleanText(devis.conditions_paiement), contentWidth);
            conditionsLines.forEach(line => {
                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = margin;
                }
                doc.text(line, margin, yPosition);
                yPosition += 5;
            });
        }
        
        // ========================================
        // PIED DE PAGE (sur toutes les pages)
        // ========================================
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(120, 120, 120);
            doc.text(
                'Devis valable 30 jours - Page ' + i + ' sur ' + pageCount,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }
        
        // Sauvegarder le PDF
        doc.save(`Devis_${cleanText(devis.numero)}.pdf`);
        
        alert('✅ Devis exporté en PDF et sauvegardé dans l\'historique !\n\n💡 Consultez l\'historique pour gérer vos devis.');
        
    } catch (error) {
        console.error('Erreur export PDF:', error);
        alert('❌ Erreur lors de l\'export PDF: ' + error.message);
    }
}
function loadDevisFromHistory(devisId) {
    const historique = JSON.parse(localStorage.getItem('historique_devis') || '[]');
    const devis = historique.find(d => d.id === devisId);
    
    if (!devis) {
        alert('⚠️ Devis introuvable');
        return;
    }
    
    // Remplir les champs client
    document.getElementById('clientNom').value = devis.client_nom || '';
    document.getElementById('clientAdresse').value = devis.client_adresse || '';
    document.getElementById('clientTel').value = devis.client_tel || '';
    
    // Remplir le numéro et la date
    document.getElementById('devisNum').textContent = devis.numero;
    document.getElementById('devisDate').textContent = new Date(devis.date_creation).toLocaleDateString('fr-FR');
    
    // Remplir les prestations
    const tbody = document.getElementById('prestationsBody');
    tbody.innerHTML = '';
    prestationCount = 0;
    
    if (devis.lots && devis.lots.length > 0) {
        devis.lots.forEach(lot => {
            // Ajouter le séparateur de lot
            const separatorRow = document.createElement('tr');
            separatorRow.className = 'bg-blue-100 font-bold';
            separatorRow.innerHTML = `
                <td colspan="5" class="border-2 border-blue-300 p-3 text-center text-blue-800">
                    <i class="fas fa-folder-open mr-2"></i>
                    ${lot.nom_lot}
                </td>
            `;
            tbody.appendChild(separatorRow);
            
            // Ajouter les prestations
            lot.prestations.forEach(prestation => {
                const row = document.createElement('tr');
                row.id = 'prestationRow' + prestationCount;
                row.innerHTML = `
                    <td class="border p-2"><input type="text" class="w-full p-1 border rounded prestation-designation" value="${prestation.designation}"></td>
                    <td class="border p-2"><input type="number" class="w-full p-1 border rounded text-center prestation-qte" value="${prestation.quantite}" min="0" step="0.01"></td>
                    <td class="border p-2"><input type="number" class="w-full p-1 border rounded text-right prestation-pu" value="${prestation.prix_unitaire}" min="0" step="0.01"></td>
                    <td class="border p-2 text-right prestation-total">0.00 €</td>
                    <td class="border p-2 text-center no-print"><button class="text-red-600 hover:text-red-800 remove-prestation"><i class="fas fa-trash"></i></button></td>
                `;
                tbody.appendChild(row);
                prestationCount++;
            });
        });
    }
    
    // Remplir les conditions de paiement
    document.getElementById('conditionsPaiement').value = devis.conditions_paiement || '';
    
    // Recalculer les totaux
    calculateTotals();
    
    alert('✅ Devis chargé avec succès !');
}

// ============================================
// NAVIGATION ENTRE LES PAGES
// ============================================

function setupNavigation() {
    const pages = {
        'navNewDevis': 'pageNewDevis',
        'navHistorique': 'pageHistorique',
        'navBasePrix': 'pageBasePrix'
    };
    
    Object.keys(pages).forEach(navId => {
        const navBtn = document.getElementById(navId);
        if (navBtn) {
            navBtn.addEventListener('click', function() {
                showPage(pages[navId]);
                
                // Mettre à jour les boutons actifs
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active', 'text-blue-600', 'border-blue-600');
                    link.classList.add('text-gray-600', 'border-transparent');
                });
                navBtn.classList.add('active', 'text-blue-600', 'border-blue-600');
                navBtn.classList.remove('text-gray-600', 'border-transparent');
            });
        }
    });
    
    // Charger l'historique au clic sur l'onglet historique
    const navHistorique = document.getElementById('navHistorique');
    if (navHistorique) {
        navHistorique.addEventListener('click', function() {
            loadHistorique();
        });
    }
    
    // Charger la base de prix au clic sur l'onglet
    const navBasePrix = document.getElementById('navBasePrix');
    if (navBasePrix) {
        navBasePrix.addEventListener('click', function() {
            loadBasePrixUI();
        });
    }
    
    // Bouton actualiser base de prix
    const updateBasePrixBtn = document.getElementById('updateBasePrixBtn');
    if (updateBasePrixBtn) {
        updateBasePrixBtn.addEventListener('click', function() {
            updateBasePrixFromDevis();
        });
    }
}

function showPage(pageId) {
    // Masquer toutes les pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Afficher la page sélectionnée
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// Charger et afficher l'historique des devis
function loadHistorique() {
    const historique = JSON.parse(localStorage.getItem('historique_devis') || '[]');
    const devisList = document.getElementById('devisList');
    const noDevis = document.getElementById('noDevis');
    
    if (historique.length === 0) {
        devisList.innerHTML = '';
        noDevis.classList.remove('hidden');
        return;
    }
    
    noDevis.classList.add('hidden');
    
    // Trier par date décroissante
    historique.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
    
    devisList.innerHTML = historique.map(devis => {
        const statutClass = {
            'brouillon': 'bg-gray-100 text-gray-800',
            'envoye': 'bg-yellow-100 text-yellow-800',
            'accepte': 'bg-green-100 text-green-800',
            'refuse': 'bg-red-100 text-red-800'
        }[devis.statut] || 'bg-gray-100 text-gray-800';
        
        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="text-lg font-bold text-blue-600">${devis.numero}</span>
                            <span class="px-3 py-1 rounded-full text-sm ${statutClass}">
                                ${devis.statut.charAt(0).toUpperCase() + devis.statut.slice(1)}
                            </span>
                        </div>
                        <div class="text-gray-800 font-semibold mb-1">${devis.client_nom}</div>
                        <div class="text-sm text-gray-600">${devis.client_adresse || ''}</div>
                        <div class="text-xs text-gray-500 mt-2">
                            ${new Date(devis.date_creation).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-gray-800">${devis.total_ttc.toFixed(2)} €</div>
                        <div class="text-sm text-gray-600">TTC</div>
                        <div class="flex gap-2 mt-3">
                            <button onclick="duplicateDevisFromHistorique('${devis.id}')" 
                                    class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                                <i class="fas fa-copy"></i> Dupliquer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Dupliquer un devis depuis l'historique
function duplicateDevisFromHistorique(devisId) {
    const historique = JSON.parse(localStorage.getItem('historique_devis') || '[]');
    const devis = historique.find(d => d.id === devisId);
    
    if (!devis) {
        alert('⚠️ Devis introuvable');
        return;
    }
    
    // Basculer vers la page nouveau devis
    showPage('pageNewDevis');
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'text-blue-600', 'border-blue-600');
        link.classList.add('text-gray-600', 'border-transparent');
    });
    document.getElementById('navNewDevis').classList.add('active', 'text-blue-600', 'border-blue-600');
    
    // Créer un nouveau numéro de devis
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const counter = parseInt(localStorage.getItem('devisCounter') || '0') + 1;
    localStorage.setItem('devisCounter', counter.toString());
    const newNumero = `DEV-${dateStr}-${String(counter).padStart(4, '0')}`;
    
    // Charger les données du devis
    loadDevisFromHistory(devisId);
    
    // Changer le numéro
    document.getElementById('devisNum').textContent = newNumero;
    document.getElementById('devisDate').textContent = today.toLocaleDateString('fr-FR');
    
    alert(`✅ Devis ${newNumero} créé depuis ${devis.numero} !\nVous pouvez maintenant le modifier.`);
}

// Charger et afficher la base de prix
function loadBasePrixUI() {
    const basePrix = JSON.parse(localStorage.getItem('base_prix') || '[]');
    const basePrixList = document.getElementById('basePrixList');
    const noPrix = document.getElementById('noPrix');
    
    if (basePrix.length === 0) {
        basePrixList.innerHTML = '';
        noPrix.classList.remove('hidden');
        return;
    }
    
    noPrix.classList.add('hidden');
    
    // Grouper par catégorie
    const grouped = {};
    basePrix.forEach(prix => {
        if (!grouped[prix.categorie]) {
            grouped[prix.categorie] = [];
        }
        grouped[prix.categorie].push(prix);
    });
    
    basePrixList.innerHTML = Object.keys(grouped).map(categorie => {
        const prixInCategorie = grouped[categorie];
        
        return `
            <div class="border border-gray-200 rounded-lg overflow-hidden">
                <div class="bg-blue-50 px-4 py-3 font-bold text-blue-800 border-b">
                    <i class="fas fa-folder mr-2"></i>
                    ${categorie.charAt(0).toUpperCase() + categorie.slice(1)}
                    <span class="text-sm font-normal text-blue-600 ml-2">(${prixInCategorie.length} prix)</span>
                </div>
                <div class="p-4 space-y-3">
                    ${prixInCategorie.map(prix => {
                        const typeClass = prix.type === 'main_oeuvre' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800';
                        
                        return `
                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
                                <div class="flex-1">
                                    <div class="font-semibold text-gray-800">${prix.designation}</div>
                                    <div class="text-xs text-gray-600 mt-1">
                                        <span class="px-2 py-1 rounded text-xs ${typeClass}">
                                            ${prix.type === 'main_oeuvre' ? 'Main d\'œuvre' : 'Fourniture'}
                                        </span>
                                        <span class="ml-2 text-purple-600">
                                            <i class="fas fa-chart-line"></i> Utilisé ${prix.usage_count || 0}x
                                        </span>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xl font-bold text-gray-800">${prix.prix_unitaire.toFixed(2)} €</div>
                                    <div class="text-sm text-gray-600">/ ${prix.unite}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// Mettre à jour la base de prix depuis tous les devis
function updateBasePrixFromDevis() {
    const historique = JSON.parse(localStorage.getItem('historique_devis') || '[]');
    let totalExtracted = 0;
    
    historique.forEach(devis => {
        extractPrixFromCurrentDevis(devis);
    });
    
    loadBasePrixUI();
    alert('✅ Base de prix actualisée depuis tous les devis !');
}

// ============================================
// ENRICHISSEMENT IA AVEC BASE DE PRIX
// ============================================

// Récupérer les prix personnalisés pour l'IA
function getPersonalizedPricesForAI() {
    const basePrix = JSON.parse(localStorage.getItem('base_prix') || '[]');
    
    if (basePrix.length === 0) {
        return '';
    }
    
    // Grouper par catégorie
    const grouped = {};
    basePrix.forEach(prix => {
        if (!grouped[prix.categorie]) {
            grouped[prix.categorie] = [];
        }
        grouped[prix.categorie].push(prix);
    });
    
    let prixText = '\n\n🎯 PRIX PERSONNALISÉS DE L\'ARTISAN (À UTILISER EN PRIORITÉ) :\n';
    prixText += '═══════════════════════════════════════════════════════════════\n';
    prixText += '⚠️ CES PRIX SONT LES VRAIS PRIX DE L\'ARTISAN - À UTILISER EN PRIORITÉ !\n';
    prixText += '═══════════════════════════════════════════════════════════════\n\n';
    
    Object.keys(grouped).forEach(categorie => {
        prixText += `📁 ${categorie.toUpperCase()} :\n`;
        grouped[categorie].forEach(prix => {
            prixText += `  • ${prix.designation} : ${prix.prix_unitaire.toFixed(2)} €/${prix.unite} (${prix.type}) [Utilisé ${prix.usage_count || 0}x]\n`;
        });
        prixText += '\n';
    });
    
    return prixText;
}
