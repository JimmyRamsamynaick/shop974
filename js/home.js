// JavaScript spécifique à la page d'accueil

class HomePage {
    constructor() {
        this.featuredProducts = [
            {
                id: 1,
                name: "Vanille Bourbon Premium",
                description: "Gousses de vanille de La Réunion, qualité exceptionnelle",
                price: 24.90,
                image: "🌿",
                category: "vanille"
            },
            {
                id: 2,
                name: "Rhum Arrangé Ananas-Victoria",
                description: "Rhum traditionnel aux ananas Victoria de l'île",
                price: 32.50,
                image: "🥃",
                category: "rhums"
            },
            {
                id: 3,
                name: "Massalé Authentique",
                description: "Mélange d'épices traditionnel réunionnais",
                price: 8.90,
                image: "🌶️",
                category: "epices"
            },
            {
                id: 4,
                name: "Collier Coquillages",
                description: "Bijou artisanal en coquillages locaux",
                price: 15.00,
                image: "🎨",
                category: "artisanat"
            }
        ];
        
        this.init();
    }

    init() {
        this.loadFeaturedProducts();
        this.setupCategoryCards();
        this.setupAnimations();
        this.setupScrollEffects();
    }

    // Charger les produits en vedette
    loadFeaturedProducts() {
        const container = document.getElementById('featured-products');
        if (!container) return;

        container.innerHTML = '';
        
        this.featuredProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            container.appendChild(productCard);
        });
    }

    // Créer une carte produit
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.innerHTML = `
            <div class="product-image">${product.image}</div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">${window.commonApp ? window.commonApp.formatPrice(product.price) : product.price + '€'}</div>
            <div class="product-actions">
                <button class="btn btn-small" onclick="homePage.addToCart(${product.id})">
                    Ajouter au panier
                </button>
                <button class="btn btn-secondary btn-small" onclick="homePage.viewProduct(${product.id})">
                    Voir détails
                </button>
            </div>
        `;

        return card;
    }

    // Ajouter au panier
    addToCart(productId) {
        const product = this.featuredProducts.find(p => p.id === productId);
        if (!product) return;

        if (window.commonApp) {
            window.commonApp.addToCart(productId, 1);
            window.commonApp.showNotification(`${product.name} ajouté au panier !`, 'success');
        } else {
            console.log('Produit ajouté au panier:', product);
        }
    }

    // Voir les détails d'un produit
    viewProduct(productId) {
        window.location.href = `/produits/${productId}`;
    }

    // Configuration des cartes de catégories
    setupCategoryCards() {
        const categoryCards = document.querySelectorAll('.category-card');
        
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.navigateToCategory(category);
            });

            // Effet hover amélioré
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Navigation vers une catégorie
    navigateToCategory(category) {
        window.location.href = `/produits?category=${category}`;
    }

    // Configuration des animations
    setupAnimations() {
        // Observer pour les animations au scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observer tous les éléments à animer
        const elementsToAnimate = document.querySelectorAll('.product-card, .category-card, .about-section');
        elementsToAnimate.forEach(el => {
            observer.observe(el);
        });
    }

    // Effets de scroll
    setupScrollEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.hero-placeholder');
            
            if (parallax) {
                const speed = scrolled * 0.5;
                parallax.style.transform = `translateY(${speed}px)`;
            }
        });

        // Smooth scroll pour les liens internes
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Recherche rapide (pour plus tard)
    quickSearch(query) {
        const results = this.featuredProducts.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase())
        );
        return results;
    }

    // Filtrer par catégorie
    filterByCategory(category) {
        const filtered = this.featuredProducts.filter(product => 
            product.category === category
        );
        return filtered;
    }

    // Obtenir les statistiques de la page
    getPageStats() {
        return {
            totalProducts: this.featuredProducts.length,
            categories: [...new Set(this.featuredProducts.map(p => p.category))],
            averagePrice: this.featuredProducts.reduce((sum, p) => sum + p.price, 0) / this.featuredProducts.length
        };
    }
}

// Initialiser la page d'accueil quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que commonApp soit initialisé
    const initHomePage = () => {
        if (window.commonApp) {
            window.homePage = new HomePage();
        } else {
            setTimeout(initHomePage, 100);
        }
    };
    
    initHomePage();
});

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    // Réajuster les animations si nécessaire
    const heroPlaceholder = document.querySelector('.hero-placeholder');
    if (heroPlaceholder && window.innerWidth <= 768) {
        heroPlaceholder.style.transform = 'translateY(0)';
    }
});