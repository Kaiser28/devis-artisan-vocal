/**
 * 🎓 Système de Tutoriel Interactif ArtisanOS
 * 
 * Fonctionnalités :
 * - Guidage pas-à-pas avec highlights
 * - Screenshots annotés
 * - Validation automatique des étapes
 * - Overlay interactif avec flèches/tooltips
 * - Sauvegarde progression
 * - Mode démo automatique
 */

export class InteractiveTutorial {
    constructor(config) {
        this.steps = config.steps || [];
        this.currentStep = 0;
        this.storageKey = config.storageKey || 'tutorial_progress';
        this.onComplete = config.onComplete || (() => {});
        this.autoplay = config.autoplay || false;
        
        // Créer overlay
        this.createOverlay();
        
        // Charger progression
        this.loadProgress();
    }
    
    /**
     * Créer l'overlay du tutoriel
     */
    createOverlay() {
        // Container principal
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-overlay';
        this.overlay.className = 'tutorial-overlay hidden';
        this.overlay.innerHTML = `
            <div class="tutorial-backdrop"></div>
            <div class="tutorial-spotlight"></div>
            <div class="tutorial-tooltip">
                <div class="tutorial-header">
                    <span class="tutorial-step-counter"></span>
                    <button class="tutorial-close" title="Fermer le tutoriel">✕</button>
                </div>
                <div class="tutorial-screenshot"></div>
                <div class="tutorial-content">
                    <h3 class="tutorial-title"></h3>
                    <p class="tutorial-description"></p>
                    <div class="tutorial-validation"></div>
                </div>
                <div class="tutorial-navigation">
                    <button class="tutorial-prev">← Précédent</button>
                    <button class="tutorial-skip">Passer</button>
                    <button class="tutorial-next">Suivant →</button>
                </div>
                <div class="tutorial-progress-bar">
                    <div class="tutorial-progress-fill"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        
        // Ajouter les styles
        this.injectStyles();
        
        // Attacher événements
        this.attachEvents();
    }
    
    /**
     * Injecter les styles CSS
     */
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .tutorial-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 99999;
                pointer-events: none;
            }
            
            .tutorial-overlay.hidden {
                display: none;
            }
            
            .tutorial-overlay.active {
                pointer-events: auto;
            }
            
            .tutorial-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(1px);
            }
            
            .tutorial-spotlight {
                position: absolute;
                border: 3px solid #3b82f6;
                border-radius: 8px;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4),
                            0 0 20px rgba(59, 130, 246, 0.5);
                transition: all 0.3s ease;
                pointer-events: none;
                z-index: 100000;
            }
            
            .tutorial-tooltip {
                position: absolute;
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: min(450px, 90vw);
                min-width: min(350px, 85vw);
                padding: 0;
                z-index: 100001;
                animation: tooltipAppear 0.3s ease;
            }
            
            @keyframes tooltipAppear {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .tutorial-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .tutorial-step-counter {
                font-size: 14px;
                font-weight: 600;
                color: #3b82f6;
            }
            
            .tutorial-close {
                background: none;
                border: none;
                font-size: 24px;
                color: #9ca3af;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: all 0.2s;
            }
            
            .tutorial-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .tutorial-screenshot {
                padding: 20px;
                background: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
                text-align: center;
            }
            
            .tutorial-screenshot img {
                max-width: 100%;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border: 2px solid #e5e7eb;
            }
            
            .tutorial-screenshot:empty {
                display: none;
            }
            
            .tutorial-content {
                padding: 20px;
            }
            
            .tutorial-title {
                font-size: 20px;
                font-weight: 700;
                color: #111827;
                margin: 0 0 12px 0;
            }
            
            .tutorial-description {
                font-size: 15px;
                line-height: 1.6;
                color: #4b5563;
                margin: 0 0 16px 0;
            }
            
            .tutorial-validation {
                display: none;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                margin-top: 16px;
            }
            
            .tutorial-validation.success {
                display: block;
                background: #dcfce7;
                color: #166534;
                border: 1px solid #86efac;
            }
            
            .tutorial-validation.waiting {
                display: block;
                background: #fef3c7;
                color: #92400e;
                border: 1px solid #fde047;
            }
            
            .tutorial-navigation {
                display: flex;
                gap: 8px;
                padding: 16px 20px;
                border-top: 1px solid #e5e7eb;
            }
            
            .tutorial-navigation button {
                flex: 1;
                padding: 10px 16px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .tutorial-prev,
            .tutorial-skip {
                background: #f3f4f6;
                color: #374151;
            }
            
            .tutorial-prev:hover,
            .tutorial-skip:hover {
                background: #e5e7eb;
            }
            
            .tutorial-prev:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .tutorial-next {
                background: #3b82f6;
                color: white;
            }
            
            .tutorial-next:hover {
                background: #2563eb;
            }
            
            .tutorial-next:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .tutorial-progress-bar {
                height: 4px;
                background: #e5e7eb;
                border-radius: 0 0 12px 12px;
                overflow: hidden;
            }
            
            .tutorial-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                transition: width 0.3s ease;
            }
            
            /* Animation flèche pointant vers élément */
            .tutorial-arrow {
                position: absolute;
                width: 60px;
                height: 60px;
                z-index: 100002;
                animation: arrowBounce 1.5s ease-in-out infinite;
            }
            
            @keyframes arrowBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Attacher les événements
     */
    attachEvents() {
        const closeBtn = this.overlay.querySelector('.tutorial-close');
        const prevBtn = this.overlay.querySelector('.tutorial-prev');
        const nextBtn = this.overlay.querySelector('.tutorial-next');
        const skipBtn = this.overlay.querySelector('.tutorial-skip');
        
        closeBtn.addEventListener('click', () => this.close());
        prevBtn.addEventListener('click', () => this.previous());
        nextBtn.addEventListener('click', () => this.next());
        skipBtn.addEventListener('click', () => this.skip());
    }
    
    /**
     * Démarrer le tutoriel
     */
    start() {
        this.overlay.classList.remove('hidden');
        this.overlay.classList.add('active');
        this.showStep(this.currentStep);
    }
    
    /**
     * Afficher une étape
     */
    showStep(index) {
        if (index < 0 || index >= this.steps.length) return;
        
        // Restaurer l'ancien élément ciblé AVANT de passer à la nouvelle étape
        this.hideHighlight();
        
        this.currentStep = index;
        const step = this.steps[index];
        
        // Mettre à jour le contenu
        this.overlay.querySelector('.tutorial-step-counter').textContent = 
            `Étape ${index + 1} sur ${this.steps.length}`;
        this.overlay.querySelector('.tutorial-title').textContent = step.title;
        this.overlay.querySelector('.tutorial-description').textContent = step.description;
        
        // Screenshot
        const screenshotContainer = this.overlay.querySelector('.tutorial-screenshot');
        if (step.screenshot) {
            screenshotContainer.innerHTML = `<img src="${step.screenshot}" alt="${step.title}">`;
        } else {
            screenshotContainer.innerHTML = '';
        }
        
        // Mettre à jour la progression
        const progress = ((index + 1) / this.steps.length) * 100;
        this.overlay.querySelector('.tutorial-progress-fill').style.width = `${progress}%`;
        
        // Boutons navigation
        this.overlay.querySelector('.tutorial-prev').disabled = (index === 0);
        this.overlay.querySelector('.tutorial-next').textContent = 
            (index === this.steps.length - 1) ? 'Terminer ✓' : 'Suivant →';
        
        // Scroll vers l'élément ciblé
        if (step.target) {
            const element = document.querySelector(step.target);
            if (element) {
                // Activer le backdrop pour cibler un élément
                this.overlay.querySelector('.tutorial-backdrop').style.display = 'block';
                
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                });
                
                // Attendre le scroll avant de positionner
                setTimeout(() => {
                    this.highlightElement(step.target);
                    this.positionTooltip(step);
                }, 300);
            } else {
                this.hideHighlight();
                this.positionTooltip(step);
            }
        } else {
            // Pas de target : désactiver complètement le backdrop
            this.overlay.querySelector('.tutorial-backdrop').style.display = 'none';
            this.hideHighlight();
            this.positionTooltip(step);
        }
        
        // Validation
        if (step.validate) {
            this.setupValidation(step);
        } else {
            this.overlay.querySelector('.tutorial-validation').style.display = 'none';
            // Remettre le texte par défaut du bouton "Passer"
            const skipBtn = this.overlay.querySelector('.tutorial-skip');
            skipBtn.textContent = 'Passer';
            skipBtn.onclick = () => this.skip();
        }
        
        // Sauvegarder progression
        this.saveProgress();
        
        // Callback
        if (step.onShow) step.onShow();
    }
    
    /**
     * Highlight un élément
     */
    highlightElement(selector) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        // Sauvegarder l'élément ciblé
        this.currentTargetElement = element;
        
        const rect = element.getBoundingClientRect();
        const spotlight = this.overlay.querySelector('.tutorial-spotlight');
        
        spotlight.style.top = `${rect.top - 8}px`;
        spotlight.style.left = `${rect.left - 8}px`;
        spotlight.style.width = `${rect.width + 16}px`;
        spotlight.style.height = `${rect.height + 16}px`;
        spotlight.style.display = 'block';
        
        // Rendre l'élément interactif en augmentant son z-index
        element.style.position = element.style.position || 'relative';
        element.style.zIndex = '100001';
        element.style.pointerEvents = 'auto';
    }
    
    /**
     * Cacher highlight
     */
    hideHighlight() {
        const spotlight = this.overlay.querySelector('.tutorial-spotlight');
        spotlight.style.display = 'none';
        
        // Restaurer l'élément ciblé
        if (this.currentTargetElement) {
            this.currentTargetElement.style.zIndex = '';
            this.currentTargetElement.style.pointerEvents = '';
            this.currentTargetElement = null;
        }
    }
    
    /**
     * Positionner le tooltip
     */
    positionTooltip(step) {
        const tooltip = this.overlay.querySelector('.tutorial-tooltip');
        
        // Reset transform pour mesures correctes
        tooltip.style.transform = 'none';
        
        if (step.target) {
            const element = document.querySelector(step.target);
            if (element) {
                const rect = element.getBoundingClientRect();
                const position = step.position || 'bottom';
                
                const tooltipWidth = tooltip.offsetWidth;
                const tooltipHeight = tooltip.offsetHeight;
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                let top, left;
                
                switch(position) {
                    case 'top':
                        top = rect.top - tooltipHeight - 20;
                        left = rect.left + rect.width / 2 - tooltipWidth / 2;
                        break;
                    case 'bottom':
                        top = rect.bottom + 20;
                        left = rect.left + rect.width / 2 - tooltipWidth / 2;
                        break;
                    case 'left':
                        top = rect.top + rect.height / 2 - tooltipHeight / 2;
                        left = rect.left - tooltipWidth - 20;
                        break;
                    case 'right':
                        top = rect.top + rect.height / 2 - tooltipHeight / 2;
                        left = rect.right + 20;
                        break;
                }
                
                // Contraintes viewport : éviter débordement horizontal
                if (left < 20) {
                    left = 20;
                } else if (left + tooltipWidth > viewportWidth - 20) {
                    left = viewportWidth - tooltipWidth - 20;
                }
                
                // Contraintes viewport : éviter débordement vertical
                if (top < 20) {
                    top = 20;
                } else if (top + tooltipHeight > viewportHeight - 20) {
                    top = viewportHeight - tooltipHeight - 20;
                }
                
                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;
                return;
            }
        }
        
        // Position par défaut (centré)
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
    }
    
    /**
     * Setup validation d'étape
     */
    setupValidation(step) {
        const validationEl = this.overlay.querySelector('.tutorial-validation');
        const nextBtn = this.overlay.querySelector('.tutorial-next');
        const skipBtn = this.overlay.querySelector('.tutorial-skip');
        
        validationEl.className = 'tutorial-validation waiting';
        validationEl.textContent = '⏳ ' + (step.validateMessage || 'En attente de votre action...');
        nextBtn.disabled = true;
        
        // Le bouton "Passer" permet de continuer sans valider
        skipBtn.textContent = 'Passer cette étape';
        skipBtn.onclick = () => {
            this.stopValidation = true;
            this.next();
        };
        
        // Vérifier validation
        this.stopValidation = false;
        const checkValidation = () => {
            if (this.stopValidation) return; // Arrêter si on a cliqué sur "Passer"
            
            if (step.validate()) {
                validationEl.className = 'tutorial-validation success';
                validationEl.textContent = '✓ ' + (step.successMessage || 'Parfait ! Continuez.');
                nextBtn.disabled = false;
                
                if (this.autoplay) {
                    setTimeout(() => this.next(), 1500);
                }
            } else {
                setTimeout(checkValidation, 500);
            }
        };
        
        checkValidation();
    }
    
    /**
     * Étape suivante
     */
    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.complete();
        }
    }
    
    /**
     * Étape précédente
     */
    previous() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }
    
    /**
     * Passer l'étape
     */
    skip() {
        this.complete();
    }
    
    /**
     * Fermer le tutoriel
     */
    close() {
        this.overlay.classList.add('hidden');
        this.overlay.classList.remove('active');
        this.hideHighlight();
    }
    
    /**
     * Terminer le tutoriel
     */
    complete() {
        this.close();
        localStorage.setItem(this.storageKey, 'completed');
        this.onComplete();
    }
    
    /**
     * Sauvegarder progression
     */
    saveProgress() {
        localStorage.setItem(this.storageKey, this.currentStep.toString());
    }
    
    /**
     * Charger progression
     */
    loadProgress() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved && saved !== 'completed') {
            this.currentStep = parseInt(saved, 10);
        }
    }
    
    /**
     * Réinitialiser progression
     */
    reset() {
        localStorage.removeItem(this.storageKey);
        this.currentStep = 0;
    }
}

// Export pour utilisation
export default InteractiveTutorial;
