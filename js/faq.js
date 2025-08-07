/**
 * FAQ Page JavaScript
 * Gère les fonctionnalités de la page FAQ
 */

class FAQPage {
    constructor() {
        this.searchInput = document.getElementById('faqSearchInput');
        this.searchBtn = document.getElementById('faqSearchBtn');
        this.accordion = document.getElementById('faqAccordion');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.categoryCards = document.querySelectorAll('.category-card');
        this.popularItems = document.querySelectorAll('.popular-item');
        this.noResults = document.getElementById('noFaqResults');
        this.clearSearchBtn = document.getElementById('clearFaqSearch');
        
        this.currentFilter = 'all';
        this.searchTerm = '';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAccordion();
        this.loadFAQData();
    }

    bindEvents() {
        // Recherche
        this.searchInput?.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        this.searchBtn?.addEventListener('click', this.handleSearch.bind(this));
        this.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Filtres
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', this.handleFilter.bind(this));
        });

        // Cartes de catégories
        this.categoryCards.forEach(card => {
            card.addEventListener('click', this.handleCategoryClick.bind(this));
        });

        // Questions populaires
        this.popularItems.forEach(item => {
            item.addEventListener('click', this.handlePopularClick.bind(this));
        });

        // Effacer la recherche
        this.clearSearchBtn?.addEventListener('click', this.clearSearch.bind(this));

        // Accordion
        this.accordion?.addEventListener('click', this.handleAccordionClick.bind(this));
    }

    setupAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (question && answer) {
                question.setAttribute('aria-expanded', 'false');
                question.setAttribute('aria-controls', `answer-${Math.random().toString(36).substr(2, 9)}`);
                answer.setAttribute('id', question.getAttribute('aria-controls'));
            }
        });
    }

    handleAccordionClick(e) {
        const question = e.target.closest('.faq-question');
        if (!question) return;

        const faqItem = question.closest('.faq-item');
        const isActive = faqItem.classList.contains('active');

        // Fermer tous les autres items
        document.querySelectorAll('.faq-item.active').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
                const q = item.querySelector('.faq-question');
                if (q) q.setAttribute('aria-expanded', 'false');
            }
        });

        // Toggle l'item actuel
        if (isActive) {
            faqItem.classList.remove('active');
            question.setAttribute('aria-expanded', 'false');
        } else {
            faqItem.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
            
            // Scroll vers l'item si nécessaire
            setTimeout(() => {
                const rect = faqItem.getBoundingClientRect();
                if (rect.top < 100) {
                    faqItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300);
        }

        // Analytics
        this.trackFAQInteraction('accordion_toggle', {
            question: question.querySelector('h3')?.textContent,
            action: isActive ? 'close' : 'open'
        });
    }

    handleSearch() {
        this.searchTerm = this.searchInput?.value.toLowerCase().trim() || '';
        this.filterFAQItems();
        
        // Analytics
        if (this.searchTerm) {
            this.trackFAQInteraction('search', { term: this.searchTerm });
        }
    }

    handleFilter(e) {
        const filter = e.target.dataset.filter;
        if (!filter) return;

        // Mettre à jour les boutons
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        this.currentFilter = filter;
        this.filterFAQItems();

        // Analytics
        this.trackFAQInteraction('filter', { category: filter });
    }

    handleCategoryClick(e) {
        const category = e.currentTarget.dataset.category;
        if (!category) return;

        // Mettre à jour le filtre
        this.currentFilter = category;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });

        this.filterFAQItems();

        // Scroll vers la section FAQ
        const faqContent = document.querySelector('.faq-content');
        if (faqContent) {
            faqContent.scrollIntoView({ behavior: 'smooth' });
        }

        // Analytics
        this.trackFAQInteraction('category_click', { category });
    }

    handlePopularClick(e) {
        const questionId = e.currentTarget.dataset.question;
        if (!questionId) return;

        // Trouver et ouvrir la question correspondante
        const faqItem = document.querySelector(`[data-question="${questionId}"]`);
        if (faqItem) {
            // Fermer tous les autres items
            document.querySelectorAll('.faq-item.active').forEach(item => {
                item.classList.remove('active');
                const q = item.querySelector('.faq-question');
                if (q) q.setAttribute('aria-expanded', 'false');
            });

            // Ouvrir l'item ciblé
            faqItem.classList.add('active');
            const question = faqItem.querySelector('.faq-question');
            if (question) question.setAttribute('aria-expanded', 'true');

            // Highlight temporaire
            faqItem.classList.add('highlight');
            setTimeout(() => faqItem.classList.remove('highlight'), 2000);

            // Scroll vers l'item
            setTimeout(() => {
                faqItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }

        // Analytics
        this.trackFAQInteraction('popular_click', { questionId });
    }

    filterFAQItems() {
        const faqItems = document.querySelectorAll('.faq-item');
        let visibleCount = 0;

        faqItems.forEach(item => {
            const category = item.dataset.category;
            const questionText = item.querySelector('.faq-question h3')?.textContent.toLowerCase() || '';
            const answerText = item.querySelector('.faq-answer')?.textContent.toLowerCase() || '';

            const matchesFilter = this.currentFilter === 'all' || category === this.currentFilter;
            const matchesSearch = !this.searchTerm || 
                questionText.includes(this.searchTerm) || 
                answerText.includes(this.searchTerm);

            if (matchesFilter && matchesSearch) {
                item.classList.remove('hidden');
                visibleCount++;
            } else {
                item.classList.add('hidden');
                item.classList.remove('active'); // Fermer si caché
                const question = item.querySelector('.faq-question');
                if (question) question.setAttribute('aria-expanded', 'false');
            }
        });

        // Afficher/masquer le message "aucun résultat"
        if (this.noResults) {
            this.noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }

        // Mettre à jour les compteurs de catégories
        this.updateCategoryCounts();
    }

    updateCategoryCounts() {
        this.categoryCards.forEach(card => {
            const category = card.dataset.category;
            const count = document.querySelectorAll(`.faq-item[data-category="${category}"]:not(.hidden)`).length;
            const countElement = card.querySelector('.question-count');
            if (countElement) {
                countElement.textContent = `${count} question${count !== 1 ? 's' : ''}`;
            }
        });
    }

    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this.searchTerm = '';
        this.filterFAQItems();
        
        // Focus sur le champ de recherche
        if (this.searchInput) {
            this.searchInput.focus();
        }
    }

    loadFAQData() {
        // Simuler le chargement de données FAQ depuis une API
        // En production, ceci ferait un appel à votre API
        this.updateCategoryCounts();
        
        // Ajouter des données structurées pour le SEO
        this.addStructuredData();
    }

    addStructuredData() {
        const faqItems = document.querySelectorAll('.faq-item');
        const faqData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": []
        };

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h3')?.textContent;
            const answer = item.querySelector('.faq-answer')?.textContent;

            if (question && answer) {
                faqData.mainEntity.push({
                    "@type": "Question",
                    "name": question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answer
                    }
                });
            }
        });

        // Ajouter le script JSON-LD
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(faqData);
        document.head.appendChild(script);
    }

    trackFAQInteraction(action, data = {}) {
        // Analytics - en production, intégrer avec Google Analytics, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', 'faq_interaction', {
                action: action,
                ...data
            });
        }

        // Log pour le développement
        console.log('FAQ Interaction:', { action, ...data });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Méthodes publiques pour l'intégration
    openQuestion(questionId) {
        const faqItem = document.querySelector(`[data-question="${questionId}"]`);
        if (faqItem) {
            faqItem.classList.add('active');
            const question = faqItem.querySelector('.faq-question');
            if (question) question.setAttribute('aria-expanded', 'true');
            
            faqItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    searchFAQ(term) {
        if (this.searchInput) {
            this.searchInput.value = term;
        }
        this.searchTerm = term.toLowerCase();
        this.filterFAQItems();
    }

    filterByCategory(category) {
        this.currentFilter = category;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });
        this.filterFAQItems();
    }
}

// Utilitaires FAQ
class FAQUtils {
    static exportFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        const faqData = [];

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h3')?.textContent;
            const answer = item.querySelector('.faq-answer')?.textContent;
            const category = item.dataset.category;

            if (question && answer) {
                faqData.push({ question, answer, category });
            }
        });

        const blob = new Blob([JSON.stringify(faqData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'faq-shop974.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    static printFAQ() {
        // Ouvrir toutes les questions pour l'impression
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.add('active');
        });

        window.print();

        // Restaurer l'état après impression
        setTimeout(() => {
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
        }, 1000);
    }

    static shareFAQ(questionId) {
        const url = `${window.location.origin}${window.location.pathname}#${questionId}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'FAQ - Shop 974',
                url: url
            });
        } else {
            // Fallback - copier dans le presse-papier
            navigator.clipboard.writeText(url).then(() => {
                // Afficher une notification
                if (window.shop974) {
                    window.shop974.showNotification('Lien copié dans le presse-papier', 'success');
                }
            });
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.faqPage = new FAQPage();
    
    // Gérer les liens directs vers des questions
    const hash = window.location.hash.substring(1);
    if (hash) {
        setTimeout(() => {
            window.faqPage.openQuestion(hash);
        }, 500);
    }
});

// Gestion des raccourcis clavier
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + F pour la recherche FAQ
    if ((e.ctrlKey || e.metaKey) && e.key === 'f' && window.faqPage) {
        e.preventDefault();
        const searchInput = document.getElementById('faqSearchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // Échap pour fermer toutes les questions
    if (e.key === 'Escape') {
        document.querySelectorAll('.faq-item.active').forEach(item => {
            item.classList.remove('active');
            const question = item.querySelector('.faq-question');
            if (question) question.setAttribute('aria-expanded', 'false');
        });
    }
});

// Export pour utilisation globale
window.FAQUtils = FAQUtils;