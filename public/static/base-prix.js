// ============================================
// BASE DE PRIX PERSONNELLE
// ============================================

// Charger la base de prix depuis localStorage
function loadBasePrix() {
    const basePrix = JSON.parse(localStorage.getItem('base_prix') || '[]');
    return basePrix;
}

// Sauvegarder la base de prix dans localStorage
function saveBasePrix(basePrix) {
    localStorage.setItem('base_prix', JSON.stringify(basePrix));
}

// Calculer les statistiques
function updatePrixStats() {
    const basePrix = loadBasePrix();
    
    const total = basePrix.length;
    const plusUtilises = basePrix.filter(p => p.usage_count > 0).length;
    const prixMoyen = basePrix.length > 0 
        ? basePrix.reduce((sum, p) => sum + p.prix_unitaire, 0) / basePrix.length 
        : 0;
    
    document.getElementById('stat-total-prix').textContent = total;
    document.getElementById('stat-plus-utilises').textContent = plusUtilises;
    document.getElementById('stat-prix-moyen').textContent = prixMoyen.toFixed(2) + ' €';
}

// Afficher la liste des prix
function displayPrix() {
    let basePrix = loadBasePrix();
    const listContainer = document.getElementById('prix-list');
    const emptyMessage = document.getElementById('empty-prix-message');
    
    // Appliquer les filtres
    const searchTerm = document.getElementById('search-prix').value.toLowerCase();
    const categorieFilter = document.getElementById('filter-categorie').value;
    
    // Filtrer
    if (searchTerm) {
        basePrix = basePrix.filter(p => 
            p.designation.toLowerCase().includes(searchTerm) ||
            (p.notes && p.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    if (categorieFilter) {
        basePrix = basePrix.filter(p => p.categorie === categorieFilter);
    }
    
    if (basePrix.length === 0 && !searchTerm && !categorieFilter) {
        document.querySelector('.bg-white.rounded-lg.shadow').classList.add('hidden');
        emptyMessage.classList.remove('hidden');
        return;
    }
    
    document.querySelector('.bg-white.rounded-lg.shadow').classList.remove('hidden');
    emptyMessage.classList.add('hidden');
    
    listContainer.innerHTML = basePrix.map(p => {
        const typeClass = p.type === 'main_oeuvre' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800';
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <div class="font-semibold text-gray-800">${p.designation}</div>
                    ${p.notes ? `<div class="text-xs text-gray-500 mt-1">${p.notes}</div>` : ''}
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        ${p.categorie}
                    </span>
                </td>
                <td class="px-6 py-4 text-right font-semibold">${p.prix_unitaire.toFixed(2)} €</td>
                <td class="px-6 py-4">${p.unite}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded text-sm ${typeClass}">
                        ${p.type === 'main_oeuvre' ? 'Main d\'œuvre' : 'Fourniture'}
                    </span>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-semibold">
                        ${p.usage_count || 0}x
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex gap-2">
                        <button onclick="editPrix('${p.id}')" 
                                class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deletePrix('${p.id}')" 
                                class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Ouvrir le modal d'ajout
let currentPrixId = null;

function openAddPrixModal() {
    currentPrixId = null;
    document.getElementById('prix-modal-titre').textContent = 'Ajouter un prix';
    
    // Réinitialiser le formulaire
    document.getElementById('prix-designation').value = '';
    document.getElementById('prix-categorie').value = '';
    document.getElementById('prix-type').value = 'main_oeuvre';
    document.getElementById('prix-montant').value = '';
    document.getElementById('prix-unite').value = 'm²';
    document.getElementById('prix-notes').value = '';
    
    document.getElementById('prix-modal').classList.remove('hidden');
}

function closePrixModal() {
    document.getElementById('prix-modal').classList.add('hidden');
    currentPrixId = null;
}

// Éditer un prix existant
function editPrix(prixId) {
    const basePrix = loadBasePrix();
    const prix = basePrix.find(p => p.id === prixId);
    
    if (!prix) return;
    
    currentPrixId = prixId;
    document.getElementById('prix-modal-titre').textContent = 'Modifier le prix';
    
    document.getElementById('prix-designation').value = prix.designation;
    document.getElementById('prix-categorie').value = prix.categorie;
    document.getElementById('prix-type').value = prix.type;
    document.getElementById('prix-montant').value = prix.prix_unitaire;
    document.getElementById('prix-unite').value = prix.unite;
    document.getElementById('prix-notes').value = prix.notes || '';
    
    document.getElementById('prix-modal').classList.remove('hidden');
}

// Sauvegarder un prix
function savePrix() {
    const designation = document.getElementById('prix-designation').value.trim();
    const categorie = document.getElementById('prix-categorie').value;
    const type = document.getElementById('prix-type').value;
    const montant = parseFloat(document.getElementById('prix-montant').value);
    const unite = document.getElementById('prix-unite').value;
    const notes = document.getElementById('prix-notes').value.trim();
    
    // Validation
    if (!designation || !categorie || !montant || montant <= 0) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    const basePrix = loadBasePrix();
    
    if (currentPrixId) {
        // Modifier un prix existant
        const index = basePrix.findIndex(p => p.id === currentPrixId);
        if (index !== -1) {
            basePrix[index] = {
                ...basePrix[index],
                designation,
                categorie,
                type,
                prix_unitaire: montant,
                unite,
                notes,
                date_modification: new Date().toISOString()
            };
        }
    } else {
        // Ajouter un nouveau prix
        const newPrix = {
            id: Date.now().toString(),
            designation,
            categorie,
            type,
            prix_unitaire: montant,
            unite,
            notes,
            usage_count: 0,
            date_creation: new Date().toISOString(),
            date_modification: new Date().toISOString()
        };
        basePrix.push(newPrix);
    }
    
    saveBasePrix(basePrix);
    closePrixModal();
    updatePrixStats();
    displayPrix();
}

// Supprimer un prix
function deletePrix(prixId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce prix ?')) {
        return;
    }
    
    const basePrix = loadBasePrix();
    const filteredPrix = basePrix.filter(p => p.id !== prixId);
    saveBasePrix(filteredPrix);
    
    updatePrixStats();
    displayPrix();
}

// Fonction pour extraire automatiquement les prix d'un devis
function extractPrixFromDevis(devis) {
    const basePrix = loadBasePrix();
    let newPrixCount = 0;
    
    // Fonction pour ajouter ou mettre à jour un prix
    function addOrUpdatePrix(prestation) {
        const designation = prestation.designation.trim();
        
        // Chercher si ce prix existe déjà (désignation similaire)
        const existingPrix = basePrix.find(p => 
            p.designation.toLowerCase() === designation.toLowerCase()
        );
        
        if (existingPrix) {
            // Mettre à jour le compteur d'usage
            existingPrix.usage_count = (existingPrix.usage_count || 0) + 1;
            existingPrix.date_modification = new Date().toISOString();
        } else {
            // Ajouter un nouveau prix
            const newPrix = {
                id: Date.now().toString() + Math.random(),
                designation: designation,
                categorie: deduceCategorie(designation),
                type: prestation.type || 'main_oeuvre',
                prix_unitaire: parseFloat(prestation.prix_unitaire) || 0,
                unite: prestation.unite || 'm²',
                notes: `Extrait du devis ${devis.numero}`,
                usage_count: 1,
                date_creation: new Date().toISOString(),
                date_modification: new Date().toISOString()
            };
            basePrix.push(newPrix);
            newPrixCount++;
        }
    }
    
    // Extraire depuis les lots
    if (devis.lots && devis.lots.length > 0) {
        devis.lots.forEach(lot => {
            lot.prestations.forEach(prestation => {
                addOrUpdatePrix(prestation);
            });
        });
    }
    
    // Extraire depuis les prestations simples
    if (devis.prestations && devis.prestations.length > 0) {
        devis.prestations.forEach(prestation => {
            addOrUpdatePrix(prestation);
        });
    }
    
    saveBasePrix(basePrix);
    return newPrixCount;
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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    updatePrixStats();
    displayPrix();
    
    // Filtres et recherche
    document.getElementById('search-prix').addEventListener('input', displayPrix);
    document.getElementById('filter-categorie').addEventListener('change', displayPrix);
});

// Exporter les fonctions pour utilisation depuis l'app principale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadBasePrix,
        saveBasePrix,
        extractPrixFromDevis
    };
}
