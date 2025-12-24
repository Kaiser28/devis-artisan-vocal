/**
 * 🎓 Configuration Tutoriel Devis Artisan
 * 
 * Guide interactif pour créer son premier devis
 */

// Étapes du tutoriel
const tutorialSteps = [
    {
        title: "👋 Bienvenue dans Devis Artisan !",
        description: "Ce tutoriel va vous guider pas à pas pour créer votre premier devis par saisie vocale avec l'aide de l'IA. Durée estimée : 2 minutes.",
        screenshot: "/static/screenshots/welcome.svg",
        position: "center"
    },
    {
        title: "⚙️ Étape 1 : Configurer vos informations",
        description: "Avant de commencer, configurez vos informations d'entreprise. Cliquez sur le bouton 'Paramètres' ci-dessous.",
        target: "#settingsBtn",
        position: "bottom",
        screenshot: "/static/screenshots/settings-button.svg",
        validate: () => {
            const modal = document.getElementById('settingsModal');
            return modal && modal.style.display !== 'none';
        },
        validateMessage: "Cliquez sur le bouton 'Paramètres'...",
        successMessage: "Parfait ! Le modal des paramètres est ouvert."
    },
    {
        title: "📝 Remplissez vos informations",
        description: "Remplissez au minimum votre nom d'entreprise et votre clé API OpenAI (optionnel mais recommandé). Puis cliquez sur 'Enregistrer'.",
        target: "#settingsModal",
        position: "right",
        validate: () => {
            const settings = localStorage.getItem('artisanSettings');
            return settings && JSON.parse(settings).nom;
        },
        validateMessage: "Remplissez et enregistrez vos informations...",
        successMessage: "Super ! Vos informations sont enregistrées."
    },
    {
        title: "🎤 Étape 2 : Saisie vocale ou manuelle",
        description: "Vous pouvez dicter votre devis avec le bouton 'Commencer la dictée' ou écrire directement dans la zone 'Saisie manuelle'. Essayez de taper : 'Client Jean Dupont à Paris, je veux faire un parquet de 25 mètres carrés'",
        target: "#transcript",
        position: "right",
        validate: () => {
            const transcript = document.getElementById('transcript');
            return transcript && transcript.value.length > 20;
        },
        validateMessage: "Tapez ou dictez votre texte...",
        successMessage: "Excellent ! Le texte est saisi."
    },
    {
        title: "🤖 Étape 3 : Appeler l'Assistant IA",
        description: "Maintenant, cliquez sur le bouton '🤖 Assistant IA' pour que l'intelligence artificielle analyse votre demande et vous pose des questions pour compléter les informations manquantes.",
        target: "#aiAssistBtn",
        position: "top",
        validate: () => {
            const aiResponse = document.getElementById('aiResponse');
            return aiResponse && !aiResponse.classList.contains('hidden');
        },
        validateMessage: "Cliquez sur '🤖 Assistant IA'...",
        successMessage: "L'IA a bien répondu ! Vous pouvez maintenant répondre à ses questions."
    },
    {
        title: "💬 Étape 4 : Répondre aux questions",
        description: "L'IA vous pose des questions avec des boutons interactifs. Cliquez sur les réponses pour que l'IA comprenne mieux votre besoin. Vous pouvez aussi cliquer sur 'Générer le devis maintenant' si vous avez assez d'informations.",
        target: "#aiResponse",
        position: "left",
        validate: () => {
            const applyBtn = document.getElementById('applyAIBtn');
            return applyBtn && !applyBtn.classList.contains('hidden');
        },
        validateMessage: "Répondez aux questions de l'IA...",
        successMessage: "Parfait ! L'IA a généré votre devis."
    },
    {
        title: "✅ Étape 5 : Appliquer au devis",
        description: "Cliquez sur le bouton '✓ Appliquer au devis' pour remplir automatiquement le tableau de devis avec les prestations suggérées par l'IA.",
        target: "#applyAIBtn",
        position: "top",
        validate: () => {
            const rows = document.querySelectorAll('.prestation-row');
            return rows.length > 0 && rows[0].querySelector('.prestation-designation').value !== '';
        },
        validateMessage: "Cliquez sur 'Appliquer au devis'...",
        successMessage: "Super ! Le devis est rempli automatiquement."
    },
    {
        title: "✏️ Étape 6 : Modifier si nécessaire",
        description: "Vous pouvez maintenant modifier manuellement les quantités, prix ou désignations directement dans le tableau. Les totaux se calculent automatiquement.",
        target: "#prestationsTable",
        position: "top"
    },
    {
        title: "📄 Étape 7 : Exporter en PDF",
        description: "Une fois satisfait, cliquez sur 'Exporter PDF' pour générer un devis professionnel. Le devis sera automatiquement sauvegardé dans votre historique.",
        target: "#exportBtn",
        position: "bottom",
        validate: () => {
            const historique = JSON.parse(localStorage.getItem('historique_devis') || '[]');
            return historique.length > 0;
        },
        validateMessage: "Exportez votre devis en PDF...",
        successMessage: "Bravo ! Votre premier devis est créé et sauvegardé !"
    },
    {
        title: "🎉 Félicitations !",
        description: "Vous savez maintenant créer des devis avec Devis Artisan ! Explorez aussi les onglets 'Historique' pour retrouver vos devis et 'Ma base de prix' pour voir vos tarifs personnalisés qui s'enrichissent automatiquement.",
        position: "center",
        onShow: () => {
            // Confetti ou animation de célébration
            console.log('🎉 Tutoriel terminé !');
        }
    }
];

// Initialiser le tutoriel
let tutorial = null;

function initTutorial() {
    // Import dynamique du module tutoriel
    import('/static/tutorial.js').then(module => {
        const InteractiveTutorial = module.default || module.InteractiveTutorial;
        
        tutorial = new InteractiveTutorial({
            steps: tutorialSteps,
            storageKey: 'devis_artisan_tutorial',
            autoplay: false,
            onComplete: () => {
                alert('🎉 Félicitations ! Vous avez terminé le tutoriel.\n\nVous êtes maintenant prêt à créer des devis professionnels rapidement !');
            }
        });
    }).catch(err => {
        console.error('Erreur chargement tutoriel:', err);
    });
}

// Démarrer le tutoriel
function startTutorial() {
    if (!tutorial) {
        initTutorial();
        setTimeout(() => {
            if (tutorial) tutorial.start();
        }, 500);
    } else {
        tutorial.reset();
        tutorial.start();
    }
}

// Exporter pour utilisation globale
window.startTutorial = startTutorial;

// Auto-init au chargement
document.addEventListener('DOMContentLoaded', () => {
    initTutorial();
    
    // Proposer le tutoriel aux nouveaux utilisateurs
    const hasSeenTutorial = localStorage.getItem('devis_artisan_tutorial');
    if (!hasSeenTutorial) {
        setTimeout(() => {
            const response = confirm('👋 Bienvenue ! Voulez-vous suivre un tutoriel interactif de 2 minutes pour découvrir comment créer votre premier devis ?');
            if (response) {
                startTutorial();
            } else {
                localStorage.setItem('devis_artisan_tutorial', 'skipped');
            }
        }, 1000);
    }
});
