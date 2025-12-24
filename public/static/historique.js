// ============================================
// HISTORIQUE DES DEVIS
// ============================================

// Charger les devis depuis localStorage
function loadDevis() {
    const devis = JSON.parse(localStorage.getItem('historique_devis') || '[]');
    return devis;
}

// Sauvegarder les devis dans localStorage
function saveDevis(devis) {
    localStorage.setItem('historique_devis', JSON.stringify(devis));
}

// Calculer les statistiques
function updateStats() {
    const devis = loadDevis();
    
    const total = devis.length;
    const attente = devis.filter(d => d.statut === 'brouillon' || d.statut === 'envoye').length;
    const acceptes = devis.filter(d => d.statut === 'accepte').length;
    const ca = devis
        .filter(d => d.statut === 'accepte')
        .reduce((sum, d) => sum + (parseFloat(d.total_ttc) || 0), 0);
    
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-attente').textContent = attente;
    document.getElementById('stat-acceptes').textContent = acceptes;
    document.getElementById('stat-ca').textContent = ca.toFixed(2) + ' €';
}

// Afficher la liste des devis
function displayDevis() {
    let devis = loadDevis();
    const listContainer = document.getElementById('devis-list');
    const emptyMessage = document.getElementById('empty-message');
    
    // Appliquer les filtres
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statutFilter = document.getElementById('filter-statut').value;
    const tri = document.getElementById('filter-tri').value;
    
    // Filtrer
    if (searchTerm) {
        devis = devis.filter(d => 
            d.numero.toLowerCase().includes(searchTerm) ||
            d.client_nom.toLowerCase().includes(searchTerm) ||
            d.client_adresse.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statutFilter) {
        devis = devis.filter(d => d.statut === statutFilter);
    }
    
    // Trier
    devis.sort((a, b) => {
        switch(tri) {
            case 'date-desc':
                return new Date(b.date_creation) - new Date(a.date_creation);
            case 'date-asc':
                return new Date(a.date_creation) - new Date(b.date_creation);
            case 'montant-desc':
                return b.total_ttc - a.total_ttc;
            case 'montant-asc':
                return a.total_ttc - b.total_ttc;
            default:
                return 0;
        }
    });
    
    if (devis.length === 0) {
        listContainer.classList.add('hidden');
        emptyMessage.classList.remove('hidden');
        return;
    }
    
    listContainer.classList.remove('hidden');
    emptyMessage.classList.add('hidden');
    
    listContainer.innerHTML = devis.map(d => {
        const statutClass = {
            'brouillon': 'bg-gray-100 text-gray-800',
            'envoye': 'bg-yellow-100 text-yellow-800',
            'accepte': 'bg-green-100 text-green-800',
            'refuse': 'bg-red-100 text-red-800'
        }[d.statut] || 'bg-gray-100 text-gray-800';
        
        const statutIcon = {
            'brouillon': 'fa-file-alt',
            'envoye': 'fa-paper-plane',
            'accepte': 'fa-check-circle',
            'refuse': 'fa-times-circle'
        }[d.statut] || 'fa-file-alt';
        
        return `
            <div class="p-4 hover:bg-gray-50 cursor-pointer" onclick="viewDevisDetail('${d.id}')">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="text-lg font-bold text-blue-600">${d.numero}</span>
                            <span class="px-3 py-1 rounded-full text-sm ${statutClass}">
                                <i class="fas ${statutIcon} mr-1"></i>
                                ${d.statut.charAt(0).toUpperCase() + d.statut.slice(1)}
                            </span>
                        </div>
                        <div class="text-gray-800 font-semibold">${d.client_nom}</div>
                        <div class="text-sm text-gray-600">${d.client_adresse}</div>
                        <div class="text-xs text-gray-500 mt-2">
                            <i class="fas fa-calendar mr-1"></i>
                            ${new Date(d.date_creation).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-gray-800">${d.total_ttc.toFixed(2)} €</div>
                        <div class="text-sm text-gray-600">TTC</div>
                        <div class="flex gap-2 mt-3">
                            <button onclick="event.stopPropagation(); duplicateDevis('${d.id}')" 
                                    class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button onclick="event.stopPropagation(); changeStatut('${d.id}')" 
                                    class="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <button onclick="event.stopPropagation(); deleteDevis('${d.id}')" 
                                    class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Voir le détail d'un devis
let currentDevisId = null;

function viewDevisDetail(devisId) {
    const devis = loadDevis().find(d => d.id === devisId);
    if (!devis) return;
    
    currentDevisId = devisId;
    
    let prestationsHTML = '';
    if (devis.lots && devis.lots.length > 0) {
        devis.lots.forEach(lot => {
            prestationsHTML += `
                <div class="mb-4">
                    <div class="bg-blue-50 px-4 py-2 font-bold text-blue-800 border-l-4 border-blue-600">
                        📦 ${lot.nom_lot}
                    </div>
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-3 py-2 text-left">Désignation</th>
                                <th class="px-3 py-2 text-right">Qté</th>
                                <th class="px-3 py-2 text-right">P.U.</th>
                                <th class="px-3 py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lot.prestations.map(p => `
                                <tr class="border-b">
                                    <td class="px-3 py-2">${p.designation}</td>
                                    <td class="px-3 py-2 text-right">${p.quantite} ${p.unite}</td>
                                    <td class="px-3 py-2 text-right">${p.prix_unitaire.toFixed(2)} €</td>
                                    <td class="px-3 py-2 text-right font-semibold">${(p.quantite * p.prix_unitaire).toFixed(2)} €</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });
    } else if (devis.prestations && devis.prestations.length > 0) {
        prestationsHTML = `
            <table class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-3 py-2 text-left">Désignation</th>
                        <th class="px-3 py-2 text-right">Qté</th>
                        <th class="px-3 py-2 text-right">P.U.</th>
                        <th class="px-3 py-2 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${devis.prestations.map(p => `
                        <tr class="border-b">
                            <td class="px-3 py-2">${p.designation}</td>
                            <td class="px-3 py-2 text-right">${p.quantite} ${p.unite}</td>
                            <td class="px-3 py-2 text-right">${p.prix_unitaire.toFixed(2)} €</td>
                            <td class="px-3 py-2 text-right font-semibold">${(p.quantite * p.prix_unitaire).toFixed(2)} €</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    const content = `
        <div class="grid grid-cols-2 gap-6 mb-6">
            <div>
                <h4 class="font-bold text-gray-700 mb-2">Client</h4>
                <p class="text-gray-800">${devis.client_nom}</p>
                <p class="text-sm text-gray-600">${devis.client_adresse}</p>
                <p class="text-sm text-gray-600">${devis.client_tel || ''}</p>
            </div>
            <div>
                <h4 class="font-bold text-gray-700 mb-2">Informations</h4>
                <p class="text-sm"><span class="font-semibold">N°:</span> ${devis.numero}</p>
                <p class="text-sm"><span class="font-semibold">Date:</span> ${new Date(devis.date_creation).toLocaleDateString('fr-FR')}</p>
                <p class="text-sm"><span class="font-semibold">Statut:</span> ${devis.statut}</p>
            </div>
        </div>
        
        <h4 class="font-bold text-gray-700 mb-3">Prestations</h4>
        ${prestationsHTML}
        
        <div class="mt-6 bg-gray-50 p-4 rounded">
            <div class="flex justify-between mb-2">
                <span class="font-semibold">Total HT:</span>
                <span>${devis.total_ht.toFixed(2)} €</span>
            </div>
            <div class="flex justify-between mb-2">
                <span class="font-semibold">TVA (${devis.tva_taux}%):</span>
                <span>${devis.tva_montant.toFixed(2)} €</span>
            </div>
            <div class="flex justify-between text-xl font-bold text-blue-600 pt-2 border-t">
                <span>Total TTC:</span>
                <span>${devis.total_ttc.toFixed(2)} €</span>
            </div>
        </div>
        
        ${devis.conditions_paiement ? `
            <div class="mt-4">
                <h4 class="font-bold text-gray-700 mb-2">Conditions de paiement</h4>
                <p class="text-sm text-gray-600 whitespace-pre-wrap">${devis.conditions_paiement}</p>
            </div>
        ` : ''}
    `;
    
    document.getElementById('detail-content').innerHTML = content;
    document.getElementById('detail-modal').classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    currentDevisId = null;
}

function duplicateFromModal() {
    if (currentDevisId) {
        duplicateDevis(currentDevisId);
    }
}

function exportPDFFromModal() {
    alert('Export PDF: fonctionnalité à venir');
}

function deleteFromModal() {
    if (currentDevisId) {
        deleteDevis(currentDevisId);
        closeDetailModal();
    }
}

// Dupliquer un devis
function duplicateDevis(devisId) {
    const devis = loadDevis().find(d => d.id === devisId);
    if (!devis) return;
    
    // Générer un nouveau numéro de devis
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const counter = parseInt(localStorage.getItem('devisCounter') || '0') + 1;
    localStorage.setItem('devisCounter', counter.toString());
    const newNumero = `DEV-${dateStr}-${String(counter).padStart(4, '0')}`;
    
    // Créer le nouveau devis
    const newDevis = {
        ...devis,
        id: Date.now().toString(),
        numero: newNumero,
        date_creation: today.toISOString(),
        statut: 'brouillon'
    };
    
    const allDevis = loadDevis();
    allDevis.push(newDevis);
    saveDevis(allDevis);
    
    alert(`Devis ${newNumero} créé !\nRedirection vers la page de modification...`);
    
    // Rediriger vers la page d'accueil pour éditer le devis
    localStorage.setItem('devis_a_charger', newDevis.id);
    window.location.href = '/';
}

// Changer le statut d'un devis
function changeStatut(devisId) {
    const devis = loadDevis();
    const devisIndex = devis.findIndex(d => d.id === devisId);
    
    if (devisIndex === -1) return;
    
    const statuts = ['brouillon', 'envoye', 'accepte', 'refuse'];
    const currentIndex = statuts.indexOf(devis[devisIndex].statut);
    const nextIndex = (currentIndex + 1) % statuts.length;
    
    devis[devisIndex].statut = statuts[nextIndex];
    saveDevis(devis);
    
    updateStats();
    displayDevis();
}

// Supprimer un devis
function deleteDevis(devisId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
        return;
    }
    
    const devis = loadDevis();
    const filteredDevis = devis.filter(d => d.id !== devisId);
    saveDevis(filteredDevis);
    
    updateStats();
    displayDevis();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    displayDevis();
    
    // Filtres et recherche
    document.getElementById('search-input').addEventListener('input', displayDevis);
    document.getElementById('filter-statut').addEventListener('change', displayDevis);
    document.getElementById('filter-tri').addEventListener('change', displayDevis);
});
