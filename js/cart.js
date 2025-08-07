/**
 * Cart Page JavaScript
 * Gère les fonctionnalités de la page du panier
 */

class CartPage {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.promoCodes = {
            'WELCOME10': { discount: 10, type: 'percentage', description: 'Réduction de 10%' },
            'SAVE20': { discount: 20, type: 'percentage', description: 'Réduction de 20%' },
            'FIRST5': { discount: 5, type: 'fixed', description: '5€ de réduction' },
            'REUNION974': { discount: 15, type: 'percentage', description: 'Réduction spéciale Réunion' }
        };
        this.appliedPromo = null;
        this.shippingThreshold = 50;
        this.shippingCost = 5;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCart();
        this.loadRecommendedProducts();
        this.loadRecentlyViewed();
    }

    bindEvents() {
        // Événements du panier
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('change', this.handleChange.bind(this));
        document.addEventListener('input', this.handleInput.bind(this));

        // Événements des modales
        this.bindModalEvents();

        // Événements du code promo
        const promoToggle = document.getElementById('promoToggle');
        const applyPromoBtn = document.getElementById('applyPromoBtn');
        const promoCode = document.getElementById('promoCode');

        promoToggle?.addEventListener('click', this.togglePromoForm.bind(this));
        applyPromoBtn?.addEventListener('click', this.applyPromoCode.bind(this));
        promoCode?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyPromoCode();
            }
        });

        // Bouton de commande
        const checkoutBtn = document.getElementById('checkoutBtn');
        checkoutBtn?.addEventListener('click', this.proceedToCheckout.bind(this));

        // Bouton sauvegarder
        const saveCartBtn = document.getElementById('saveCartBtn');
        saveCartBtn?.addEventListener('click', this.saveCartForLater.bind(this));
    }

    bindModalEvents() {
        // Modal de suppression
        const confirmDeleteModal = document.getElementById('confirmDeleteModal');
        const closeDeleteModal = document.getElementById('closeDeleteModal');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

        closeDeleteModal?.addEventListener('click', () => this.hideModal('confirmDeleteModal'));
        cancelDeleteBtn?.addEventListener('click', () => this.hideModal('confirmDeleteModal'));
        confirmDeleteBtn?.addEventListener('click', this.confirmDeleteItem.bind(this));

        // Modal de vidage
        const confirmClearModal = document.getElementById('confirmClearModal');
        const closeClearModal = document.getElementById('closeClearModal');
        const cancelClearBtn = document.getElementById('cancelClearBtn');
        const confirmClearBtn = document.getElementById('confirmClearBtn');

        closeClearModal?.addEventListener('click', () => this.hideModal('confirmClearModal'));
        cancelClearBtn?.addEventListener('click', () => this.hideModal('confirmClearModal'));
        confirmClearBtn?.addEventListener('click', this.confirmClearCart.bind(this));

        // Fermer les modales en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
    }

    handleClick(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const itemId = target.dataset.itemId;

        switch (action) {
            case 'increase-quantity':
                this.updateQuantity(itemId, 1);
                break;
            case 'decrease-quantity':
                this.updateQuantity(itemId, -1);
                break;
            case 'remove-item':
                this.showDeleteConfirmation(itemId);
                break;
            case 'save-for-later':
                this.saveForLater(itemId);
                break;
            case 'clear-cart':
                this.showClearConfirmation();
                break;
            case 'add-to-cart':
                this.addToCart(target.dataset);
                break;
        }
    }

    handleChange(e) {
        if (e.target.classList.contains('quantity-input')) {
            const itemId = e.target.dataset.itemId;
            const newQuantity = parseInt(e.target.value) || 1;
            this.setQuantity(itemId, newQuantity);
        }
    }

    handleInput(e) {
        if (e.target.classList.contains('quantity-input')) {
            const value = parseInt(e.target.value);
            if (value < 1) {
                e.target.value = 1;
            } else if (value > 99) {
                e.target.value = 99;
            }
        }
    }

    renderCart() {
        const emptyCart = document.getElementById('emptyCart');
        const cartWithItems = document.getElementById('cartWithItems');
        const cartItems = document.getElementById('cartItems');

        if (this.cart.length === 0) {
            emptyCart.style.display = 'block';
            cartWithItems.style.display = 'none';
            this.updateCartCount();
            return;
        }

        emptyCart.style.display = 'none';
        cartWithItems.style.display = 'block';

        // Générer le HTML des articles
        cartItems.innerHTML = this.cart.map(item => this.generateCartItemHTML(item)).join('');

        // Mettre à jour le résumé
        this.updateSummary();
        this.updateCartCount();
    }

    generateCartItemHTML(item) {
        const originalPrice = item.originalPrice || item.price;
        const hasDiscount = originalPrice > item.price;
        const discountPercentage = hasDiscount ? Math.round((1 - item.price / originalPrice) * 100) : 0;

        return `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                
                <div class="item-details">
                    <a href="product.html?id=${item.id}" class="item-name">${item.name}</a>
                    <div class="item-description">${item.description || ''}</div>
                    <div class="item-options">
                        ${item.color ? `<div class="item-option"><i class="fas fa-circle" style="color: ${item.color}"></i> ${item.colorName || item.color}</div>` : ''}
                        ${item.size ? `<div class="item-option"><i class="fas fa-ruler"></i> ${item.size}</div>` : ''}
                        ${item.variant ? `<div class="item-option"><i class="fas fa-tag"></i> ${item.variant}</div>` : ''}
                    </div>
                </div>
                
                <div class="item-price">
                    <div class="current-price">${this.formatPrice(item.price)}</div>
                    ${hasDiscount ? `
                        <div class="original-price">${this.formatPrice(originalPrice)}</div>
                        <div class="discount-badge">-${discountPercentage}%</div>
                    ` : ''}
                </div>
                
                <div class="quantity-controls">
                    <button class="quantity-btn" data-action="decrease-quantity" data-item-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" data-item-id="${item.id}">
                    <button class="quantity-btn" data-action="increase-quantity" data-item-id="${item.id}" ${item.quantity >= 99 ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="item-actions">
                    <button class="item-action-btn" data-action="save-for-later" data-item-id="${item.id}" title="Sauvegarder pour plus tard">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="item-action-btn remove" data-action="remove-item" data-item-id="${item.id}" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    updateQuantity(itemId, change) {
        const item = this.cart.find(item => item.id === itemId);
        if (!item) return;

        const newQuantity = item.quantity + change;
        if (newQuantity < 1 || newQuantity > 99) return;

        this.setQuantity(itemId, newQuantity);
    }

    setQuantity(itemId, quantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (!item) return;

        if (quantity < 1) {
            this.showDeleteConfirmation(itemId);
            return;
        }

        item.quantity = Math.min(99, Math.max(1, quantity));
        this.saveCart();
        this.renderCart();

        // Animation de mise à jour
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemElement) {
            itemElement.classList.add('updating');
            setTimeout(() => itemElement.classList.remove('updating'), 300);
        }

        // Analytics
        this.trackCartEvent('update_quantity', { itemId, quantity: item.quantity });
    }

    showDeleteConfirmation(itemId) {
        this.itemToDelete = itemId;
        this.showModal('confirmDeleteModal');
    }

    confirmDeleteItem() {
        if (this.itemToDelete) {
            this.removeItem(this.itemToDelete);
            this.itemToDelete = null;
        }
        this.hideModal('confirmDeleteModal');
    }

    removeItem(itemId) {
        const itemIndex = this.cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        const item = this.cart[itemIndex];
        
        // Animation de suppression
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemElement) {
            itemElement.classList.add('removing');
            setTimeout(() => {
                this.cart.splice(itemIndex, 1);
                this.saveCart();
                this.renderCart();
                
                // Notification
                if (window.shop974) {
                    window.shop974.showNotification(`${item.name} supprimé du panier`, 'info');
                }
            }, 300);
        } else {
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.renderCart();
        }

        // Analytics
        this.trackCartEvent('remove_item', { itemId, itemName: item.name });
    }

    showClearConfirmation() {
        this.showModal('confirmClearModal');
    }

    confirmClearCart() {
        this.cart = [];
        this.appliedPromo = null;
        this.saveCart();
        this.renderCart();
        this.hideModal('confirmClearModal');

        // Notification
        if (window.shop974) {
            window.shop974.showNotification('Panier vidé', 'info');
        }

        // Analytics
        this.trackCartEvent('clear_cart');
    }

    updateSummary() {
        const subtotal = this.calculateSubtotal();
        const shipping = this.calculateShipping(subtotal);
        const discount = this.calculateDiscount(subtotal);
        const total = subtotal + shipping - discount;

        // Mettre à jour les éléments
        document.getElementById('itemCount').textContent = this.cart.length;
        document.getElementById('itemPlural').textContent = this.cart.length > 1 ? 's' : '';
        document.getElementById('subtotal').textContent = this.formatPrice(subtotal);
        document.getElementById('shippingCost').textContent = shipping > 0 ? this.formatPrice(shipping) : 'Gratuite';
        document.getElementById('totalAmount').textContent = this.formatPrice(total);

        // Gestion de la réduction
        const discountLine = document.getElementById('discountLine');
        if (discount > 0) {
            discountLine.style.display = 'flex';
            document.getElementById('discountAmount').textContent = `-${this.formatPrice(discount)}`;
        } else {
            discountLine.style.display = 'none';
        }

        // Gestion de la livraison gratuite
        this.updateShippingProgress(subtotal);
    }

    updateShippingProgress(subtotal) {
        const freeShippingNotice = document.getElementById('freeShippingNotice');
        const freeShippingProgress = document.getElementById('freeShippingProgress');
        const remainingAmount = document.getElementById('remainingAmount');
        const progressFill = document.getElementById('progressFill');

        if (subtotal >= this.shippingThreshold) {
            freeShippingNotice.style.display = 'flex';
            freeShippingProgress.style.display = 'none';
        } else {
            const remaining = this.shippingThreshold - subtotal;
            const progress = (subtotal / this.shippingThreshold) * 100;

            freeShippingNotice.style.display = 'none';
            freeShippingProgress.style.display = 'block';
            remainingAmount.textContent = this.formatPrice(remaining);
            progressFill.style.width = `${Math.min(progress, 100)}%`;
        }
    }

    calculateSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    calculateShipping(subtotal) {
        return subtotal >= this.shippingThreshold ? 0 : this.shippingCost;
    }

    calculateDiscount(subtotal) {
        if (!this.appliedPromo) return 0;

        const promo = this.promoCodes[this.appliedPromo];
        if (!promo) return 0;

        if (promo.type === 'percentage') {
            return (subtotal * promo.discount) / 100;
        } else if (promo.type === 'fixed') {
            return Math.min(promo.discount, subtotal);
        }

        return 0;
    }

    togglePromoForm() {
        const promoToggle = document.getElementById('promoToggle');
        const promoForm = document.getElementById('promoForm');

        promoToggle.classList.toggle('active');
        
        if (promoForm.style.display === 'none' || !promoForm.style.display) {
            promoForm.style.display = 'block';
            document.getElementById('promoCode').focus();
        } else {
            promoForm.style.display = 'none';
        }
    }

    applyPromoCode() {
        const promoCodeInput = document.getElementById('promoCode');
        const promoMessage = document.getElementById('promoMessage');
        const code = promoCodeInput.value.trim().toUpperCase();

        if (!code) {
            this.showPromoMessage('Veuillez saisir un code promo', 'error');
            return;
        }

        if (this.promoCodes[code]) {
            this.appliedPromo = code;
            this.updateSummary();
            this.showPromoMessage(`Code appliqué : ${this.promoCodes[code].description}`, 'success');
            promoCodeInput.value = '';
            
            // Analytics
            this.trackCartEvent('apply_promo', { code });
        } else {
            this.showPromoMessage('Code promo invalide', 'error');
        }
    }

    showPromoMessage(message, type) {
        const promoMessage = document.getElementById('promoMessage');
        promoMessage.textContent = message;
        promoMessage.className = `promo-message ${type}`;
        
        setTimeout(() => {
            promoMessage.textContent = '';
            promoMessage.className = 'promo-message';
        }, 5000);
    }

    proceedToCheckout() {
        if (this.cart.length === 0) return;

        // Vérifier si l'utilisateur est connecté
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            // Rediriger vers la page de connexion
            localStorage.setItem('redirectAfterLogin', 'checkout');
            window.location.href = 'login.html';
            return;
        }

        // Sauvegarder les données de commande
        const orderData = {
            items: this.cart,
            subtotal: this.calculateSubtotal(),
            shipping: this.calculateShipping(this.calculateSubtotal()),
            discount: this.calculateDiscount(this.calculateSubtotal()),
            promoCode: this.appliedPromo,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('checkoutData', JSON.stringify(orderData));

        // Analytics
        this.trackCartEvent('begin_checkout', {
            value: orderData.subtotal + orderData.shipping - orderData.discount,
            items: this.cart.length
        });

        // Rediriger vers la page de commande
        window.location.href = 'checkout.html';
    }

    saveCartForLater() {
        const savedCarts = JSON.parse(localStorage.getItem('savedCarts')) || [];
        const cartData = {
            id: Date.now(),
            name: `Panier du ${new Date().toLocaleDateString()}`,
            items: [...this.cart],
            createdAt: new Date().toISOString()
        };

        savedCarts.push(cartData);
        localStorage.setItem('savedCarts', JSON.stringify(savedCarts));

        // Notification
        if (window.shop974) {
            window.shop974.showNotification('Panier sauvegardé avec succès', 'success');
        }

        // Analytics
        this.trackCartEvent('save_cart');
    }

    saveForLater(itemId) {
        const item = this.cart.find(item => item.id === itemId);
        if (!item) return;

        // Ajouter à la liste des favoris
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        if (!wishlist.find(w => w.id === itemId)) {
            wishlist.push({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                addedAt: new Date().toISOString()
            });
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }

        // Supprimer du panier
        this.removeItem(itemId);

        // Notification
        if (window.shop974) {
            window.shop974.showNotification(`${item.name} ajouté aux favoris`, 'success');
        }
    }

    addToCart(productData) {
        const existingItem = this.cart.find(item => 
            item.id === productData.id && 
            item.color === productData.color && 
            item.size === productData.size
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: productData.id,
                name: productData.name,
                price: parseFloat(productData.price),
                image: productData.image,
                description: productData.description,
                color: productData.color,
                colorName: productData.colorName,
                size: productData.size,
                variant: productData.variant,
                quantity: 1
            });
        }

        this.saveCart();
        this.renderCart();

        // Notification
        if (window.shop974) {
            window.shop974.showNotification(`${productData.name} ajouté au panier`, 'success');
        }

        // Analytics
        this.trackCartEvent('add_to_cart', { itemId: productData.id, itemName: productData.name });
    }

    loadRecommendedProducts() {
        // Simuler le chargement de produits recommandés
        const recommendedProducts = this.generateRecommendedProducts();
        if (recommendedProducts.length > 0) {
            this.renderRecommendedProducts(recommendedProducts);
        }
    }

    loadRecentlyViewed() {
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        if (recentlyViewed.length > 0) {
            this.renderRecentlyViewed(recentlyViewed.slice(0, 4));
        }
    }

    generateRecommendedProducts() {
        // En production, ceci ferait un appel à votre API de recommandations
        const categories = [...new Set(this.cart.map(item => item.category))];
        
        return [
            {
                id: 'rec1',
                name: 'Produit Recommandé 1',
                price: 29.99,
                image: 'https://via.placeholder.com/250x250?text=Produit+1',
                rating: 4.5
            },
            {
                id: 'rec2',
                name: 'Produit Recommandé 2',
                price: 39.99,
                image: 'https://via.placeholder.com/250x250?text=Produit+2',
                rating: 4.8
            }
        ];
    }

    renderRecommendedProducts(products) {
        const section = document.getElementById('recommendedProducts');
        const grid = document.getElementById('recommendedGrid');
        
        if (products.length === 0) return;

        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <button class="quick-add-btn" data-action="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-rating">
                        ${this.generateStars(product.rating)}
                    </div>
                    <div class="product-price">${this.formatPrice(product.price)}</div>
                </div>
            </div>
        `).join('');

        section.style.display = 'block';
    }

    renderRecentlyViewed(products) {
        const section = document.getElementById('recentlyViewed');
        const grid = document.getElementById('recentlyViewedGrid');

        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <button class="quick-add-btn" data-action="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">${this.formatPrice(product.price)}</div>
                </div>
            </div>
        `).join('');

        section.style.display = 'block';
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return [
            ...Array(fullStars).fill('<i class="fas fa-star"></i>'),
            ...(hasHalfStar ? ['<i class="fas fa-star-half-alt"></i>'] : []),
            ...Array(emptyStars).fill('<i class="far fa-star"></i>')
        ].join('');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        
        // Mettre à jour tous les compteurs de panier
        document.querySelectorAll('#cartCount, #mobileCartCount').forEach(element => {
            element.textContent = count;
        });

        // Mettre à jour le badge du panier dans l'en-tête
        if (window.shop974) {
            window.shop974.updateCartCount(count);
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }

    trackCartEvent(event, data = {}) {
        // Analytics - en production, intégrer avec Google Analytics, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', event, {
                event_category: 'cart',
                ...data
            });
        }

        // Log pour le développement
        console.log('Cart Event:', { event, ...data });
    }

    // Méthodes publiques pour l'intégration
    getCart() {
        return [...this.cart];
    }

    getCartTotal() {
        const subtotal = this.calculateSubtotal();
        const shipping = this.calculateShipping(subtotal);
        const discount = this.calculateDiscount(subtotal);
        return subtotal + shipping - discount;
    }

    isEmpty() {
        return this.cart.length === 0;
    }

    getItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Utilitaires du panier
class CartUtils {
    static exportCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const blob = new Blob([JSON.stringify(cart, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'panier-shop974.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    static importCart(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const cart = JSON.parse(e.target.result);
                localStorage.setItem('cart', JSON.stringify(cart));
                window.location.reload();
            } catch (error) {
                alert('Erreur lors de l\'importation du panier');
            }
        };
        reader.readAsText(file);
    }

    static shareCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartData = {
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            total: cart.reduce((total, item) => total + (item.price * item.quantity), 0)
        };

        const shareText = `Mon panier Shop 974:\n${cartData.items.map(item => 
            `• ${item.name} (x${item.quantity}) - ${item.price}€`
        ).join('\n')}\nTotal: ${cartData.total.toFixed(2)}€`;

        if (navigator.share) {
            navigator.share({
                title: 'Mon panier Shop 974',
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                if (window.shop974) {
                    window.shop974.showNotification('Panier copié dans le presse-papier', 'success');
                }
            });
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.cartPage = new CartPage();
});

// Export pour utilisation globale
window.CartUtils = CartUtils;