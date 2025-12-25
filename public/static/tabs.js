/**
 * Gestion des onglets de l'interface gauche
 */

// Fonction pour changer d'onglet
function switchTab(tabName) {
    // Désactiver tous les onglets
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('text-gray-500', 'border-transparent');
        btn.classList.remove('text-blue-600', 'border-blue-600');
    });
    
    // Cacher tous les contenus
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.classList.add('hidden');
    });
    
    // Activer l'onglet cliqué
    const activeTab = document.getElementById(`tab${tabName}`);
    if (activeTab) {
        activeTab.classList.add('active', 'text-blue-600', 'border-blue-600');
        activeTab.classList.remove('text-gray-500', 'border-transparent');
    }
    
    // Afficher le contenu correspondant
    const activeContent = document.getElementById(`content${tabName}`);
    if (activeContent) {
        activeContent.classList.add('active');
        activeContent.classList.remove('hidden');
    }
}

// Initialiser les onglets au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Onglet Saisie
    const tabSaisie = document.getElementById('tabSaisie');
    if (tabSaisie) {
        tabSaisie.addEventListener('click', () => switchTab('Saisie'));
    }
    
    // Onglet IA
    const tabIA = document.getElementById('tabIA');
    if (tabIA) {
        tabIA.addEventListener('click', () => switchTab('IA'));
    }
    
    // Onglet Info
    const tabInfo = document.getElementById('tabInfo');
    if (tabInfo) {
        tabInfo.addEventListener('click', () => switchTab('Info'));
    }
    
    // Activer l'onglet Saisie par défaut
    switchTab('Saisie');
});

// Fonction pour passer automatiquement à l'onglet IA quand l'IA répond
function showAITab() {
    switchTab('IA');
}

// Export pour utilisation globale
window.switchTab = switchTab;
window.showAITab = showAITab;
