// Fonctionnalités communes pour toutes les pages

class CommonApp {
    constructor() {
        this.cartCount = 0;
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupCartCounter();
        this.highlightCurrentPage();
        this.loadCartCount();
    }

    // Gestion du menu mobile
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                this.toggleMobileMenuIcon(mobileMenuBtn);
            });

            // Fermer le menu mobile quand on clique sur un lien
            const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    this.toggleMobileMenuIcon(mobileMenuBtn, false);
                });
            });
        }
    }

    toggleMobileMenuIcon(btn, isActive = null) {
        const spans = btn.querySelectorAll('span');
        const shouldBeActive = isActive !== null ? isActive : btn.classList.contains('active');
        
        if (shouldBeActive) {
            spans[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            btn.classList.add('active');
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
            btn.classList.remove('active');
        }
    }

    // Gestion du compteur de panier
    setupCartCounter() {
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const cartCountElements = document.querySelectorAll('#cart-count, #mobile-cart-count');
        cartCountElements.forEach(element => {
            if (element) {
                element.textContent = this.cartCount;
            }
        });
    }

    addToCart(productId, quantity = 1) {
        // Récupérer le panier actuel du localStorage
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Vérifier si le produit existe déjà
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id: productId, quantity: quantity });
        }
        
        // Sauvegarder dans localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Mettre à jour le compteur
        this.loadCartCount();
        
        // Animation du panier
        this.animateCartIcon();
        
        return cart;
    }

    removeFromCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.loadCartCount();
    }

    loadCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        this.updateCartDisplay();
    }

    animateCartIcon() {
        const cartLinks = document.querySelectorAll('a[href*="panier"]');
        cartLinks.forEach(link => {
            link.style.transform = 'scale(1.2)';
            setTimeout(() => {
                link.style.transform = 'scale(1)';
            }, 200);
        });
    }

    // Surligner la page actuelle dans la navigation
    highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const linkFile = href.split('/').pop();
            
            // Vérifier si c'est la page actuelle
            const isCurrentPage = 
                href === currentPath || 
                linkFile === currentFile ||
                (currentFile === '' && linkFile === 'index.html') ||
                (currentFile === 'index.html' && href === '/') ||
                (currentPath === '/' && href === '/');
                
            if (isCurrentPage) {
                link.classList.add('active');
                link.style.backgroundColor = 'rgba(255,255,255,0.3)';
            }
        });
    }

    // Utilitaire pour afficher des notifications
    showNotification(message, type = 'info') {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Styles inline pour la notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;

        // Ajouter au DOM
        document.body.appendChild(notification);

        // Gérer la fermeture
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
        `;

        const closeNotification = () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        };

        closeBtn.addEventListener('click', closeNotification);

        // Auto-fermeture après 5 secondes
        setTimeout(closeNotification, 5000);

        // Ajouter les animations CSS si elles n'existent pas
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Utilitaire pour formater les prix
    formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }

    // Utilitaire pour valider les emails
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Fonction pour charger les composants header et footer
async function loadComponents() {
    const isFileProtocol = window.location.protocol === 'file:';
    
    // En mode file://, utiliser directement le fallback
    if (isFileProtocol) {
        console.log('Mode file:// détecté, utilisation du fallback');
        createFallbackComponents();
        return;
    }
    
    // En mode http://, essayer de charger les composants
    try {
        const basePath = '/components/';

        // Charger le header
        const headerResponse = await fetch(basePath + 'header.html');
        if (!headerResponse.ok) throw new Error('Header non trouvé');
        const headerHTML = await headerResponse.text();
        document.getElementById('header-placeholder').innerHTML = headerHTML;

        // Charger le footer
        const footerResponse = await fetch(basePath + 'footer.html');
        if (!footerResponse.ok) throw new Error('Footer non trouvé');
        const footerHTML = await footerResponse.text();
        document.getElementById('footer-placeholder').innerHTML = footerHTML;

        // Initialiser l'application commune après le chargement des composants
        window.commonApp = new CommonApp();
    } catch (error) {
        console.error('Erreur lors du chargement des composants:', error);
        // Fallback : créer un header/footer basique si le chargement échoue
        createFallbackComponents();
    }
}

// Fonction de fallback pour créer des composants basiques
function createFallbackComponents() {
    // Header identique à l'original
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = `
            <header class="main-header">
                <div class="container">
                    <div class="header-content">
                        <!-- Logo -->
                        <div class="logo">
                            <a href="index.html">
                                <h1>🏝️ Shop 974</h1>
                            </a>
                        </div>

                        <!-- Navigation principale -->
                        <nav class="main-nav">
                            <ul class="nav-list">
                                <li><a href="index.html" class="nav-link">Accueil</a></li>
                                <li><a href="produits.html" class="nav-link">Produits</a></li>
                                <li><a href="connexion.html" class="nav-link">Connexion</a></li>
                                <li><a href="panier.html" class="nav-link">
                                    <span class="cart-icon">🛒</span>
                                    <span class="cart-count" id="cart-count">0</span>
                                </a></li>
                            </ul>
                        </nav>

                        <!-- Menu mobile -->
                        <button class="mobile-menu-btn" id="mobile-menu-btn">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>

                    <!-- Menu mobile -->
                    <div class="mobile-menu" id="mobile-menu">
                        <ul class="mobile-nav-list">
                            <li><a href="index.html" class="mobile-nav-link">Accueil</a></li>
                            <li><a href="produits.html" class="mobile-nav-link">Produits</a></li>
                            <li><a href="connexion.html" class="mobile-nav-link">Connexion</a></li>
                            <li><a href="panier.html" class="mobile-nav-link">Panier (<span id="mobile-cart-count">0</span>)</a></li>
                        </ul>
                    </div>
                </div>
            </header>
        `;
    }

    // Footer identique à l'original
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
            <footer class="main-footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h3>🏝️ Shop 974</h3>
                            <p>Votre boutique réunionnaise en ligne</p>
                            <p>Découvrez les trésors de La Réunion</p>
                        </div>

                        <div class="footer-section">
                            <h4>Navigation</h4>
                            <ul>
                                <li><a href="index.html">Accueil</a></li>
                                <li><a href="produits.html">Produits</a></li>
                                <li><a href="connexion.html">Connexion</a></li>
                                <li><a href="panier.html">Panier</a></li>
                            </ul>
                        </div>

                        <div class="footer-section">
                            <h4>Contact</h4>
                            <p>📧 contact@shop974.com</p>
                            <p>📱 +262 692 XX XX XX</p>
                            <p>📍 La Réunion, France</p>
                        </div>

                        <div class="footer-section">
                            <h4>Suivez-nous</h4>
                            <div class="social-links">
                                <a href="#" class="social-link">📘 Facebook</a>
                                <a href="#" class="social-link">📷 Instagram</a>
                                <a href="#" class="social-link">🐦 Twitter</a>
                            </div>
                        </div>
                    </div>

                    <div class="footer-bottom">
                        <p>&copy; 2024 Shop 974. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        `;
    }

    // Initialiser l'application commune
    window.commonApp = new CommonApp();
}

// Charger les composants quand le DOM est prêt
document.addEventListener('DOMContentLoaded', loadComponents);