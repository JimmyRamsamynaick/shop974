// JavaScript spécifique à la page panier

class CartPage {
    constructor() {
        this.cart = [];
        this.promoCode = null;
        this.discountAmount = 0;
        this.shippingCost = 0;
        this.freeShippingThreshold = 50;
        
        this.init();
    }

    init() {
        this.loadCart();
        
        // Debug: afficher le contenu du panier
        console.log('Panier chargé:', this.cart);
        console.log('Nombre d\'articles:', this.cart.length);
        
        // Si le panier est vide, ajouter des produits de test pour la démo
        if (this.cart.length === 0) {
            this.addTestProducts();
        }
        
        this.setupEventListeners();
        this.updateDisplay();
        this.loadRecommendedProducts();
    }

    // Ajouter des produits de test pour la démo
    addTestProducts() {
        const testProducts = [
            {
                id: 1,
                name: 'T-shirt Premium',
                price: 25.99,
                quantity: 2,
                image: 'https://via.placeholder.com/80x80/007bff/ffffff?text=T-shirt',
                description: 'T-shirt en coton bio de qualité premium'
            },
            {
                id: 2,
                name: 'Jeans Slim',
                price: 59.99,
                quantity: 1,
                image: 'https://via.placeholder.com/80x80/28a745/ffffff?text=Jeans',
                description: 'Jeans slim fit en denim stretch'
            },
            {
                id: 3,
                name: 'Sneakers Sport',
                price: 89.99,
                quantity: 1,
                image: 'https://via.placeholder.com/80x80/dc3545/ffffff?text=Sneakers',
                description: 'Chaussures de sport confortables et stylées'
            }
        ];
        
        this.cart = testProducts;
        this.saveCart();
        console.log('Produits de test ajoutés au panier');
    }

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        // Vider le panier
        document.getElementById('clear-cart').addEventListener('click', () => {
            this.showConfirmModal(
                'Vider le panier',
                'Êtes-vous sûr de vouloir supprimer tous les articles de votre panier ?',
                () => this.clearCart()
            );
        });

        // Code promo
        document.getElementById('apply-promo').addEventListener('click', () => {
            this.applyPromoCode();
        });

        document.getElementById('promo-code').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyPromoCode();
            }
        });

        // Passer la commande
        document.getElementById('checkout-btn').addEventListener('click', () => {
            this.proceedToCheckout();
        });

        // Sauvegarder pour plus tard
        document.getElementById('save-for-later').addEventListener('click', () => {
            this.saveCartForLater();
        });

        // Modal
        document.getElementById('modal-cancel').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('modal-confirm').addEventListener('click', () => {
            this.executeModalAction();
        });
    }

    // Charger le panier depuis le localStorage
    loadCart() {
        // Utiliser la même clé que common.js
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            // Convertir le format simple en format détaillé si nécessaire
            const cartData = JSON.parse(savedCart);
            if (cartData.length > 0 && cartData[0].id && !cartData[0].name) {
                // Format simple du common.js, on doit le convertir
                this.cart = this.convertSimpleCartToDetailed(cartData);
            } else {
                this.cart = cartData;
            }
        }

        // Charger le code promo sauvegardé
        const savedPromo = localStorage.getItem('shop974_promo');
        if (savedPromo) {
            const promo = JSON.parse(savedPromo);
            if (promo.expiresAt > Date.now()) {
                this.promoCode = promo;
                this.discountAmount = promo.discount;
                document.getElementById('promo-code').value = promo.code;
            }
        }
    }

    // Convertir le format simple du panier en format détaillé
    convertSimpleCartToDetailed(simpleCart) {
        return simpleCart.map(item => ({
            id: item.id,
            name: `Produit ${item.id}`,
            price: 29.99, // Prix par défaut
            quantity: item.quantity,
            image: `https://via.placeholder.com/80x80/007bff/ffffff?text=${item.id}`,
            description: 'Description du produit'
        }));
    }

    // Sauvegarder le panier dans le localStorage
    saveCart() {
        // Sauvegarder le format détaillé
        localStorage.setItem('cart', JSON.stringify(this.cart));
        
        // Mettre à jour le compteur global
        if (window.commonApp) {
            window.commonApp.loadCartCount();
        }
    }

    // Mettre à jour l'affichage
    updateDisplay() {
        if (this.cart.length === 0) {
            this.showEmptyCart();
        } else {
            this.showCartWithItems();
            this.renderCartItems();
            this.updateSummary();
        }
    }

    // Afficher le panier vide
    showEmptyCart() {
        document.getElementById('empty-cart').style.display = 'block';
        document.getElementById('cart-with-items').style.display = 'none';
        document.getElementById('recommended-products').style.display = 'none';
    }

    // Afficher le panier avec articles
    showCartWithItems() {
        document.getElementById('empty-cart').style.display = 'none';
        document.getElementById('cart-with-items').style.display = 'block';
        document.getElementById('recommended-products').style.display = 'block';
    }

    // Rendre les articles du panier
    renderCartItems() {
        const container = document.getElementById('cart-items-list');
        container.innerHTML = '';

        this.cart.forEach((item, index) => {
            const itemElement = this.createCartItemElement(item, index);
            container.appendChild(itemElement);
        });
    }

    // Créer un élément d'article du panier
    createCartItemElement(item, index) {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="item-image">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>${item.description || 'Description du produit'}</p>
                ${item.variant ? `<p><small>Variante: ${item.variant}</small></p>` : ''}
            </div>
            <div class="item-price">${this.formatPrice(item.price)}</div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="cartPage.updateQuantity(${index}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" onchange="cartPage.updateQuantity(${index}, this.value)">
                <button class="quantity-btn" onclick="cartPage.updateQuantity(${index}, ${item.quantity + 1})" ${item.quantity >= 99 ? 'disabled' : ''}>+</button>
            </div>
            <button class="remove-item" onclick="cartPage.removeItem(${index})" title="Supprimer cet article">
                ×
            </button>
        `;
        return div;
    }

    // Mettre à jour la quantité d'un article
    updateQuantity(index, newQuantity) {
        newQuantity = parseInt(newQuantity);
        
        if (newQuantity < 1) {
            this.removeItem(index);
            return;
        }
        
        if (newQuantity > 99) {
            newQuantity = 99;
        }

        this.cart[index].quantity = newQuantity;
        this.saveCart();
        this.updateDisplay();
        
        this.showNotification(`Quantité mise à jour pour ${this.cart[index].name}`, 'success');
    }

    // Supprimer un article
    removeItem(index) {
        const item = this.cart[index];
        this.cart.splice(index, 1);
        this.saveCart();
        this.updateDisplay();
        
        this.showNotification(`${item.name} supprimé du panier`, 'success');
    }

    // Vider le panier
    clearCart() {
        this.cart = [];
        this.promoCode = null;
        this.discountAmount = 0;
        this.saveCart();
        localStorage.removeItem('shop974_promo');
        this.updateDisplay();
        this.hideModal();
        
        this.showNotification('Panier vidé', 'success');
    }

    // Mettre à jour le résumé
    updateSummary() {
        const itemsCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Calculer les frais de livraison
        this.shippingCost = subtotal >= this.freeShippingThreshold ? 0 : 5.99;
        
        const total = subtotal + this.shippingCost - this.discountAmount;

        // Mettre à jour l'affichage
        document.getElementById('items-count').textContent = itemsCount;
        document.getElementById('subtotal').textContent = this.formatPrice(subtotal);
        document.getElementById('shipping-cost').textContent = this.shippingCost === 0 ? 'Gratuite' : this.formatPrice(this.shippingCost);
        document.getElementById('total-amount').textContent = this.formatPrice(total);

        // Afficher/masquer la ligne de réduction
        const discountLine = document.getElementById('discount-line');
        if (this.discountAmount > 0) {
            discountLine.style.display = 'flex';
            document.getElementById('discount-amount').textContent = `-${this.formatPrice(this.discountAmount)}`;
        } else {
            discountLine.style.display = 'none';
        }

        // Mettre à jour la date de livraison estimée
        this.updateDeliveryDate();
    }

    // Mettre à jour la date de livraison
    updateDeliveryDate() {
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + (this.shippingCost === 0 ? 3 : 5));
        
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        document.getElementById('delivery-date').textContent = 
            `Livraison prévue le ${deliveryDate.toLocaleDateString('fr-FR', options)}`;
    }

    // Appliquer un code promo
    applyPromoCode() {
        const code = document.getElementById('promo-code').value.trim().toUpperCase();
        const messageElement = document.getElementById('promo-message');
        
        if (!code) {
            this.showPromoMessage('Veuillez saisir un code promo', 'error');
            return;
        }

        // Codes promo simulés
        const promoCodes = {
            'WELCOME10': { discount: 10, type: 'percentage', description: '10% de réduction' },
            'SAVE5': { discount: 5, type: 'fixed', description: '5€ de réduction' },
            'FREESHIP': { discount: 0, type: 'shipping', description: 'Livraison gratuite' },
            'NEWCLIENT': { discount: 15, type: 'percentage', description: '15% de réduction nouveau client' }
        };

        if (promoCodes[code]) {
            const promo = promoCodes[code];
            const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            
            if (promo.type === 'percentage') {
                this.discountAmount = (subtotal * promo.discount) / 100;
            } else if (promo.type === 'fixed') {
                this.discountAmount = Math.min(promo.discount, subtotal);
            } else if (promo.type === 'shipping') {
                this.shippingCost = 0;
                this.discountAmount = 0;
            }

            // Sauvegarder le code promo
            this.promoCode = {
                code: code,
                discount: this.discountAmount,
                type: promo.type,
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24h
            };
            
            localStorage.setItem('shop974_promo', JSON.stringify(this.promoCode));
            
            this.showPromoMessage(`Code appliqué: ${promo.description}`, 'success');
            this.updateSummary();
        } else {
            this.showPromoMessage('Code promo invalide', 'error');
        }
    }

    // Afficher un message de code promo
    showPromoMessage(message, type) {
        const messageElement = document.getElementById('promo-message');
        messageElement.textContent = message;
        messageElement.className = `promo-message ${type}`;
        
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'promo-message';
        }, 5000);
    }

    // Procéder à la commande
    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Votre panier est vide', 'error');
            return;
        }

        // Sauvegarder les données de commande
        const orderData = {
            items: this.cart,
            subtotal: this.cart.reduce((total, item) => total + (item.price * item.quantity), 0),
            shippingCost: this.shippingCost,
            discountAmount: this.discountAmount,
            total: this.getCartTotal(),
            promoCode: this.promoCode,
            timestamp: Date.now()
        };

        localStorage.setItem('checkout_data', JSON.stringify(orderData));
        
        // Rediriger vers la page de commande
        window.location.href = '/commande.html';
    }

    // Sauvegarder le panier pour plus tard
    saveCartForLater() {
        if (this.cart.length === 0) {
            this.showNotification('Votre panier est vide', 'error');
            return;
        }

        const savedCarts = JSON.parse(localStorage.getItem('shop974_saved_carts') || '[]');
        const cartToSave = {
            id: Date.now(),
            items: [...this.cart],
            savedAt: new Date().toISOString(),
            name: `Panier du ${new Date().toLocaleDateString('fr-FR')}`
        };

        savedCarts.push(cartToSave);
        localStorage.setItem('shop974_saved_carts', JSON.stringify(savedCarts));
        
        this.showNotification('Panier sauvegardé pour plus tard', 'success');
    }

    // Charger les produits recommandés
    loadRecommendedProducts() {
        // Produits recommandés simulés
        const recommendedProducts = [
            {
                id: 101,
                name: 'Accessoire Premium',
                price: 29.99,
                image: 'https://via.placeholder.com/200x120/007bff/ffffff?text=Accessoire'
            },
            {
                id: 102,
                name: 'Produit Complémentaire',
                price: 19.99,
                image: 'https://via.placeholder.com/200x120/28a745/ffffff?text=Complément'
            },
            {
                id: 103,
                name: 'Article Populaire',
                price: 39.99,
                image: 'https://via.placeholder.com/200x120/dc3545/ffffff?text=Populaire'
            },
            {
                id: 104,
                name: 'Nouveauté',
                price: 24.99,
                image: 'https://via.placeholder.com/200x120/ffc107/ffffff?text=Nouveau'
            }
        ];

        this.renderRecommendedProducts(recommendedProducts);
    }

    // Rendre les produits recommandés
    renderRecommendedProducts(products) {
        const container = document.getElementById('recommended-grid');
        container.innerHTML = '';

        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'recommended-item';
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h5>${product.name}</h5>
                <div class="price">${this.formatPrice(product.price)}</div>
                <button class="btn btn-primary btn-sm" onclick="cartPage.addRecommendedToCart(${product.id})">
                    Ajouter au panier
                </button>
            `;
            container.appendChild(productElement);
        });
    }

    // Ajouter un produit recommandé au panier
    addRecommendedToCart(productId) {
        // Simuler l'ajout d'un produit recommandé
        const product = {
            id: productId,
            name: `Produit ${productId}`,
            price: 29.99,
            quantity: 1,
            image: `https://via.placeholder.com/80x80/007bff/ffffff?text=${productId}`
        };

        // Vérifier si le produit existe déjà
        const existingIndex = this.cart.findIndex(item => item.id === productId);
        
        if (existingIndex >= 0) {
            this.cart[existingIndex].quantity += 1;
        } else {
            this.cart.push(product);
        }

        this.saveCart();
        this.updateDisplay();
        this.showNotification(`${product.name} ajouté au panier`, 'success');
    }

    // Afficher la modal de confirmation
    showConfirmModal(title, message, action) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        document.getElementById('confirm-modal').style.display = 'flex';
        
        this.pendingModalAction = action;
    }

    // Masquer la modal
    hideModal() {
        document.getElementById('confirm-modal').style.display = 'none';
        this.pendingModalAction = null;
    }

    // Exécuter l'action de la modal
    executeModalAction() {
        if (this.pendingModalAction) {
            this.pendingModalAction();
        }
        this.hideModal();
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        const container = document.getElementById('cart-notifications');
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Formater le prix
    formatPrice(price) {
        return window.commonApp ? 
            window.commonApp.formatPrice(price) : 
            `${price.toFixed(2)} €`;
    }

    // Obtenir le total du panier
    getCartTotal() {
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        return subtotal + this.shippingCost - this.discountAmount;
    }

    // Obtenir le nombre d'articles
    getItemsCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Vérifier si un produit est dans le panier
    isInCart(productId) {
        return this.cart.some(item => item.id === productId);
    }

    // Obtenir la quantité d'un produit dans le panier
    getProductQuantity(productId) {
        const item = this.cart.find(item => item.id === productId);
        return item ? item.quantity : 0;
    }

    // Exporter le panier (pour debug)
    exportCart() {
        return {
            items: this.cart,
            total: this.getCartTotal(),
            itemsCount: this.getItemsCount(),
            promoCode: this.promoCode,
            discountAmount: this.discountAmount,
            shippingCost: this.shippingCost
        };
    }
}

// Initialiser la page du panier
document.addEventListener('DOMContentLoaded', () => {
    const initCartPage = () => {
        if (window.commonApp) {
            window.cartPage = new CartPage();
        } else {
            setTimeout(initCartPage, 100);
        }
    };
    
    initCartPage();
});

// Gestion de la fermeture de la modal avec Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && window.cartPage) {
        window.cartPage.hideModal();
    }
});

// Gestion du clic en dehors de la modal
document.addEventListener('click', (e) => {
    if (e.target.id === 'confirm-modal' && window.cartPage) {
        window.cartPage.hideModal();
    }
});