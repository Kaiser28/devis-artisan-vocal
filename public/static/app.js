// Variables globales
let recognition;
let isRecording = false;
let prestationCount = 1;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initSpeechRecognition();
    initDevisDate();
    setupEventListeners();
    calculateTotals();
});

// Initialisation de la reconnaissance vocale
function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        document.getElementById('status').innerHTML = '<span class="text-red-600">❌ La reconnaissance vocale n\'est pas supportée par votre navigateur. Utilisez Chrome ou Edge.</span>';
        document.getElementById('startBtn').disabled = true;
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = function() {
        isRecording = true;
        document.getElementById('status').innerHTML = '<span class="text-green-600 recording">🎤 Enregistrement en cours...</span>';
        document.getElementById('startBtn').classList.add('hidden');
        document.getElementById('stopBtn').classList.remove('hidden');
    };
    
    recognition.onend = function() {
        isRecording = false;
        document.getElementById('status').innerHTML = '<span class="text-gray-600">⏸️ Enregistrement arrêté</span>';
        document.getElementById('startBtn').classList.remove('hidden');
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
    const devisNum = 'DEV-' + today.getFullYear() + today.getMonth().toString().padStart(2, '0') + today.getDate().toString().padStart(2, '0') + '-' + Math.floor(Math.random() * 1000);
    
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
        const qte = parseFloat(row.querySelector('.prestation-qte').value) || 0;
        const pu = parseFloat(row.querySelector('.prestation-pu').value) || 0;
        const total = qte * pu;
        
        row.querySelector('.prestation-total').textContent = formatPrice(total);
        totalHT += total;
    });
    
    const tauxTVA = parseFloat(document.getElementById('tauxTVA').value) || 0;
    const montantTVA = totalHT * (tauxTVA / 100);
    const totalTTC = totalHT + montantTVA;
    
    document.getElementById('totalHT').textContent = formatPrice(totalHT);
    document.getElementById('montantTVA').textContent = formatPrice(montantTVA);
    document.getElementById('totalTTC').textContent = formatPrice(totalTTC);
}

// Exporter en PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configuration
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;
    
    // Titre
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('DEVIS', pageWidth / 2, y, { align: 'center' });
    y += 10;
    
    // Date et numéro
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Date : ' + document.getElementById('devisDate').textContent, margin, y);
    doc.text('N° : ' + document.getElementById('devisNum').textContent, margin, y + 5);
    y += 15;
    
    // Artisan
    const artisanNom = document.getElementById('artisanNom').value || 'Nom de l\'entreprise';
    const artisanAdresse = document.getElementById('artisanAdresse').value || 'Adresse';
    const artisanTel = document.getElementById('artisanTel').value || 'Téléphone';
    
    doc.setFont(undefined, 'bold');
    doc.text(artisanNom, pageWidth - margin, y, { align: 'right' });
    doc.setFont(undefined, 'normal');
    doc.text(artisanAdresse, pageWidth - margin, y + 5, { align: 'right' });
    doc.text(artisanTel, pageWidth - margin, y + 10, { align: 'right' });
    y += 20;
    
    // Client
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F');
    
    doc.setFont(undefined, 'bold');
    doc.text('CLIENT :', margin + 2, y + 5);
    doc.setFont(undefined, 'normal');
    doc.text(document.getElementById('clientNom').value || 'Nom du client', margin + 2, y + 10);
    doc.text(document.getElementById('clientAdresse').value || 'Adresse', margin + 2, y + 14);
    doc.text(document.getElementById('clientTel').value || 'Téléphone', margin + 2, y + 18);
    y += 25;
    
    // Prestations
    doc.setFont(undefined, 'bold');
    doc.text('PRESTATIONS :', margin, y);
    y += 7;
    
    // En-tête tableau
    doc.setFillColor(220, 220, 220);
    doc.rect(margin, y, pageWidth - 2 * margin, 7, 'F');
    doc.setFontSize(9);
    doc.text('Désignation', margin + 2, y + 5);
    doc.text('Qté', pageWidth - margin - 80, y + 5);
    doc.text('P.U. HT', pageWidth - margin - 55, y + 5);
    doc.text('Total HT', pageWidth - margin - 25, y + 5);
    y += 7;
    
    // Lignes de prestations
    const rows = document.querySelectorAll('#prestationsBody tr');
    rows.forEach(row => {
        const designation = row.querySelector('.prestation-designation').value || '';
        const qte = row.querySelector('.prestation-qte').value || '0';
        const pu = row.querySelector('.prestation-pu').value || '0';
        const total = row.querySelector('.prestation-total').textContent;
        
        doc.setFont(undefined, 'normal');
        doc.text(designation.substring(0, 50), margin + 2, y + 4);
        doc.text(qte, pageWidth - margin - 80, y + 4);
        doc.text(pu + ' €', pageWidth - margin - 55, y + 4);
        doc.text(total, pageWidth - margin - 25, y + 4);
        
        doc.line(margin, y, pageWidth - margin, y);
        y += 7;
    });
    
    y += 5;
    
    // Totaux
    doc.setFont(undefined, 'bold');
    doc.text('Total HT :', pageWidth - margin - 50, y);
    doc.text(document.getElementById('totalHT').textContent, pageWidth - margin - 25, y);
    y += 5;
    
    const tauxTVA = document.getElementById('tauxTVA').value;
    doc.text('TVA ' + tauxTVA + '% :', pageWidth - margin - 50, y);
    doc.text(document.getElementById('montantTVA').textContent, pageWidth - margin - 25, y);
    y += 5;
    
    doc.setFontSize(12);
    doc.text('Total TTC :', pageWidth - margin - 50, y);
    doc.text(document.getElementById('totalTTC').textContent, pageWidth - margin - 25, y);
    y += 10;
    
    // Conditions
    y += 5;
    doc.setFontSize(10);
    doc.text('CONDITIONS DE PAIEMENT :', margin, y);
    y += 5;
    
    const conditions = document.getElementById('conditions').value.split('\n');
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    conditions.forEach(line => {
        doc.text(line, margin + 2, y);
        y += 4;
    });
    
    // Timestamp
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Devis généré le ' + document.getElementById('timestampDevis').textContent, pageWidth / 2, y, { align: 'center' });
    
    // Téléchargement
    const devisNum = document.getElementById('devisNum').textContent;
    doc.save('Devis_' + devisNum + '.pdf');
    
    alert('✅ PDF exporté avec succès !');
}

// Fonctions utilitaires
function formatPrice(value) {
    return value.toFixed(2) + ' €';
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}
