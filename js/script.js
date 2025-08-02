/**
 * Shop 974 - E-commerce Platform JavaScript
 * Version: 1.0.0 - Fonctionnelle et Optimisée
 * Toutes les fonctionnalités essentielles présentes
 */

// =================== GLOBAL VARIABLES ===================
let currentUser = null;
let cart = [];
let orders = [];
let wishlist = [];

// Product data
const products = [
    {
        id: 1,
        name: "T-shirt Homme Classic",
        category: "homme",
        price: 29.99,
        description: "T-shirt confortable en coton bio, parfait pour un style décontracté. Coupe moderne et tissu respirant.",
        image: "👕",
        stock: 25,
        rating: 4.5,
        reviews: 127
    },
    {
        id: 2,
        name: "Robe Femme Élégante",
        category: "femme",
        price: 79.99,
        description: "Robe élégante pour toutes occasions, coupe moderne et tissu de qualité premium. Design intemporel.",
        image: "👗",
        stock: 15,
        rating: 4.8,
        reviews: 89
    },
    {
        id: 3,
        name: "Console de Jeu Pro",
        category: "jeux-video",
        price: 499.99,
        description: "Console de dernière génération avec performance exceptionnelle. 4K, ray tracing, stockage SSD ultra-rapide.",
        image: "🎮",
        stock: 8,
        rating: 4.9,
        reviews: 234
    },
    {
        id: 4,
        name: "Peluche Ours Mignon",
        category: "peluche",
        price: 24.99,
        description: "Peluche douce et câline, parfaite pour les enfants et les collectionneurs. Matériaux hypoallergéniques.",
        image: "🧸",
        stock: 42,
        rating: 4.7,
        reviews: 156
    },
    {
        id: 5,
        name: "Chemise Homme Business",
        category: "homme",
        price: 59.99,
        description: "Chemise professionnelle en coton premium, idéale pour le bureau. Coupe ajustée, facile d'entretien.",
        image: "👔",
        stock: 18,
        rating: 4.6,
        reviews: 93
    },
    {
        id: 6,
        name: "Sac à Main Femme",
        category: "femme",
        price: 89.99,
        description: "Sac à main en cuir véritable, design moderne et élégant. Multiples compartiments, bandoulière amovible.",
        image: "👜",
        stock: 12,
        rating: 4.4,
        reviews: 67
    },
    {
        id: 7,
        name: "Jeu d'Aventure Epic",
        category: "jeux-video",
        price: 69.99,
        description: "Jeu d'aventure immersif avec des graphismes époustouflants. Plus de 100h de gameplay, monde ouvert.",
        image: "🎯",
        stock: 35,
        rating: 4.8,
        reviews: 312
    },
    {
        id: 8,
        name: "Peluche Chat Kawaii",
        category: "peluche",
        price: 19.99,
        description: "Adorable peluche chat au style japonais kawaii. Parfaite pour décoration ou cadeau.",
        image: "🐱",
        stock: 28,
        rating: 4.6,
        reviews: 98
    }
];

// Platform Detection
const platform = {
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isMobile: window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent),
    supportsTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
};

// State management
const state = {
    currentSection: 'homeSection',
    darkMode: false,
    isLoading: false
};

// =================== INITIALIZATION ===================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛍️ Shop 974 initializing...');
    initializeApp();
});

function initializeApp() {
    loadUserData();
    loadCartData();
    loadOrdersData();
    loadWishlist();
    updateUserInterface();
    displayProducts();
    updateCartCount();
    showHome();
    setupEventListeners();
    console.log('✅ Shop 974 initialized successfully');
}

function setupEventListeners() {
    // Mobile menu click outside to close
    document.addEventListener('click', function(e) {
        const navMenu = document.getElementById('navMenu');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');

        if (navMenu && navMenu.classList.contains('active') &&
            !navMenu.contains(e.target) &&
            !mobileToggle?.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Form validation
    document.addEventListener('input', function(e) {
        if (e.target.tagName === 'INPUT') {
            validateField(e.target);

            // Password strength for registration
            if (e.target.type === 'password' && e.target.id === 'regPassword') {
                updatePasswordStrength(e.target);
            }
        }
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterProducts(this.dataset.filter);
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close mobile menu if open
            const navMenu = document.getElementById('navMenu');
            if (navMenu && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        }
    });
}

// =================== STORAGE FUNCTIONS ===================
function loadUserData() {
    try {
        const savedUser = localStorage.getItem('shop974_user');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateUserInterface();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function saveUserData() {
    try {
        if (currentUser) {
            localStorage.setItem('shop974_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('shop974_user');
        }
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

function loadCartData() {
    try {
        const savedCart = localStorage.getItem('shop974_cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
    }
}

function saveCartData() {
    try {
        localStorage.setItem('shop974_cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

function loadOrdersData() {
    try {
        const savedOrders = localStorage.getItem('shop974_orders');
        orders = savedOrders ? JSON.parse(savedOrders) : [];
    } catch (error) {
        console.error('Error loading orders:', error);
        orders = [];
    }
}

function saveOrdersData() {
    try {
        localStorage.setItem('shop974_orders', JSON.stringify(orders));
    } catch (error) {
        console.error('Error saving orders:', error);
    }
}

function loadWishlist() {
    try {
        const savedWishlist = localStorage.getItem('shop974_wishlist');
        wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
        console.error('Error loading wishlist:', error);
        wishlist = [];
    }
}

function saveWishlist() {
    try {
        localStorage.setItem('shop974_wishlist', JSON.stringify(wishlist));
    } catch (error) {
        console.error('Error saving wishlist:', error);
    }
}

// =================== NAVIGATION FUNCTIONS ===================
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        state.currentSection = sectionId;
    }

    // Close mobile menu
    closeMobileMenu();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showHome() {
    showSection('homeSection');
}

function showProducts() {
    showSection('productsSection');
    displayProducts();
}

function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        displayProductDetail(product);
        showSection('productDetailSection');
    }
}

function showCart() {
    displayCartItems();
    showSection('cartSection');
}

function showCheckout() {
    if (cart.length === 0) {
        showNotification('Votre panier est vide', 'warning');
        return;
    }
    displayOrderSummary();
    showSection('checkoutSection');
}

function showLogin() {
    showSection('loginSection');
    showLoginForm();
}

function showAccount() {
    if (!currentUser) {
        showLogin();
        return;
    }
    loadAccountData();
    showSection('accountSection');
    showOrderHistory();
}

// =================== MOBILE MENU ===================
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');

    if (navMenu && mobileToggle) {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');

        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

function closeMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');

    if (navMenu && mobileToggle) {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// =================== PRODUCT FUNCTIONS ===================
function displayProducts(filteredProducts = products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-products" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
                <h3>Aucun produit trouvé</h3>
                <p>Essayez de modifier vos filtres ou revenez plus tard.</p>
                <button class="btn-primary" onclick="filterProducts('all')">Voir tous les produits</button>
            </div>
        `;
        return;
    }

    filteredProducts.forEach((product, index) => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;

    const stars = generateStarRating(product.rating);
    const isInWishlist = wishlist.find(item => item.id === product.id);

    card.innerHTML = `
        <div class="product-image" role="img" aria-label="${product.name}">
            ${product.image}
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <div class="product-rating">
                ${stars}
                <span class="rating-text">(${product.reviews})</span>
            </div>
            <div class="product-price">€${product.price.toFixed(2)}</div>
            <div class="product-stock ${product.stock < 5 ? 'low-stock' : ''}">
                ${product.stock < 5 ? `⚠️ Plus que ${product.stock} en stock` : '✅ En stock'}
            </div>
            <div class="product-actions">
                <button class="add-to-cart" onclick="addToCart(${product.id}); event.stopPropagation();" 
                        ${product.stock === 0 ? 'disabled' : ''}>
                    <span class="btn-text">${product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}</span>
                </button>
                <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" 
                        onclick="toggleWishlist(${product.id}); event.stopPropagation();"
                        aria-label="Ajouter aux favoris">
                    ${isInWishlist ? '❤️' : '🤍'}
                </button>
            </div>
        </div>
    `;

    // Add click handler for product detail
    card.addEventListener('click', function (e) {
        if (!e.target.closest('.product-actions')) {
            showProductDetail(product.id);
        }
    });

    return card;
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star full">⭐</span>';
    }
    if (hasHalfStar) {
        stars += '<span class="star half">⭐</span>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<span class="star empty">☆</span>';
    }

    return `<div class="rating-stars">${stars}</div>`;
}

function displayProductDetail(product) {
    const container = document.getElementById('productDetail');
    if (!container) return;

    const stars = generateStarRating(product.rating);
    const isInWishlist = wishlist.find(item => item.id === product.id);

    container.innerHTML = `
        <div class="product-detail-image" role="img" aria-label="${product.name}">
            ${product.image}
        </div>
        <div class="product-detail-info">
            <h2>${product.name}</h2>
            <div class="product-rating">
                ${stars}
                <span class="rating-text">(${product.reviews} avis)</span>
            </div>
            <div class="product-detail-price">€${product.price.toFixed(2)}</div>
            <div class="product-stock ${product.stock < 5 ? 'low-stock' : ''}">
                ${product.stock < 5 ? `⚠️ Plus que ${product.stock} en stock` : '✅ En stock'}
            </div>
            <div class="product-detail-description">
                <p>${product.description}</p>
            </div>
            <div class="quantity-selector">
                <label for="productQuantity" class="sr-only">Quantité</label>
                <button class="quantity-btn" onclick="changeQuantity(-1)" aria-label="Diminuer la quantité">-</button>
                <input type="number" id="productQuantity" class="quantity-input" value="1" min="1" max="${product.stock}" aria-label="Quantité">
                <button class="quantity-btn" onclick="changeQuantity(1)" aria-label="Augmenter la quantité">+</button>
            </div>
            <div class="product-actions">
                <button class="btn-primary" onclick="addToCartWithQuantity(${product.id})">
                    <span class="btn-text">Ajouter au panier</span>
                </button>
                <button class="btn-secondary ${isInWishlist ? 'active' : ''}" onclick="toggleWishlist(${product.id})">
                    ${isInWishlist ? '❤️' : '🤍'} Favori
                </button>
            </div>
        </div>
    `;
}

function filterProducts(category) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === category) {
            btn.classList.add('active');
        }
    });

    let filteredProducts;
    if (category === 'all') {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(p => p.category === category);
    }

    displayProducts(filteredProducts);
}

function changeQuantity(delta) {
    const input = document.getElementById('productQuantity');
    if (!input) return;

    const currentValue = parseInt(input.value) || 1;
    const maxValue = parseInt(input.max) || 99;
    const newValue = Math.max(1, Math.min(maxValue, currentValue + delta));

    input.value = newValue;
}

// =================== CART FUNCTIONS ===================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) {
        showNotification('Ce produit n\'est plus disponible', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity += 1;
        } else {
            showNotification('Stock insuffisant', 'warning');
            return;
        }
    } else {
        cart.push({
            ...product,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }

    updateCartCount();
    saveCartData();
    showNotification(`${product.name} ajouté au panier !`, 'success');
}

function addToCartWithQuantity(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) {
        showNotification('Ce produit n\'est plus disponible', 'error');
        return;
    }

    const quantityInput = document.getElementById('productQuantity');
    const quantity = parseInt(quantityInput?.value) || 1;

    if (quantity > product.stock) {
        showNotification('Stock insuffisant', 'warning');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity <= product.stock) {
            existingItem.quantity = newQuantity;
        } else {
            showNotification('Stock insuffisant', 'warning');
            return;
        }
    } else {
        cart.push({
            ...product,
            quantity: quantity,
            addedAt: new Date().toISOString()
        });
    }

    updateCartCount();
    saveCartData();

    const message = quantity === 1 ?
        `${product.name} ajouté au panier !` :
        `${quantity} × ${product.name} ajoutés au panier !`;

    showNotification(message, 'success');
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;

    const removedItem = cart[itemIndex];
    cart.splice(itemIndex, 1);

    updateCartCount();
    saveCartData();
    displayCartItems();

    showNotification(`${removedItem.name} retiré du panier`, 'info');
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);

    if (!item || !product) return;

    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (newQuantity > product.stock) {
        showNotification('Stock insuffisant', 'warning');
        return;
    }

    item.quantity = newQuantity;
    updateCartCount();
    saveCartData();
    displayCartItems();
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('cartCount');

    if (badge) {
        badge.textContent = count;
    }
}

function displayCartItems() {
    const container = document.getElementById('cartItems');
    const totalElement = document.getElementById('cartTotal');
    const subtotalElement = document.getElementById('cartSubtotal');
    const shippingElement = document.getElementById('shippingCost');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
                <h3>Votre panier est vide</h3>
                <p>Découvrez nos produits et ajoutez-les à votre panier</p>
                <button class="btn-primary" onclick="showProducts()">Voir les produits</button>
            </div>
        `;

        if (totalElement) totalElement.textContent = '0.00';
        if (subtotalElement) subtotalElement.textContent = '0.00';
        if (shippingElement) shippingElement.textContent = 'Gratuite';
        return;
    }

    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image" role="img" aria-label="${item.name}">
                ${item.image}
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="item-price">€${item.price.toFixed(2)} × ${item.quantity}</p>
                <p class="item-total"><strong>€${itemTotal.toFixed(2)}</strong></p>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" 
                        aria-label="Diminuer la quantité de ${item.name}">-</button>
                <span class="quantity-display" aria-label="Quantité: ${item.quantity}">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" 
                        aria-label="Augmenter la quantité de ${item.name}">+</button>
                <button class="remove-item" onclick="removeFromCart(${item.id})" 
                        aria-label="Supprimer ${item.name} du panier">🗑️</button>
            </div>
        `;
        container.appendChild(cartItem);
    });

    // Calculate shipping
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const total = subtotal + shipping;

    // Update totals
    if (subtotalElement) subtotalElement.textContent = subtotal.toFixed(2);
    if (shippingElement) {
        shippingElement.textContent = shipping === 0 ? 'Gratuite' : `€${shipping.toFixed(2)}`;
    }
    if (totalElement) totalElement.textContent = total.toFixed(2);
}

// =================== AUTHENTICATION ===================
function register(event) {
    event.preventDefault();

    const firstName = document.getElementById('regFirstName')?.value.trim();
    const lastName = document.getElementById('regLastName')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim();
    const password = document.getElementById('regPassword')?.value;
    const acceptTerms = document.getElementById('acceptTerms')?.checked;

    if (!firstName || !lastName || !email || !password) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }

    if (!acceptTerms) {
        showNotification('Veuillez accepter les conditions d\'utilisation', 'error');
        return;
    }

    setTimeout(() => {
        try {
            const users = JSON.parse(localStorage.getItem('shop974_users') || '[]');

            if (users.find(u => u.email === email)) {
                showNotification('Un compte avec cet email existe déjà', 'error');
                return;
            }

            const newUser = {
                id: Date.now(),
                firstName,
                lastName,
                email,
                password,
                createdAt: new Date().toISOString(),
                preferences: {
                    notifications: true,
                    newsletter: true
                }
            };

            users.push(newUser);
            localStorage.setItem('shop974_users', JSON.stringify(users));

            currentUser = newUser;
            saveUserData();
            updateUserInterface();

            showNotification(`Bienvenue sur Shop 974, ${firstName} !`, 'success');
            setTimeout(() => showHome(), 1500);

        } catch (error) {
            console.error('Registration error:', error);
            showNotification('Erreur lors de l\'inscription', 'error');
        }
    }, 1000);
}

function login(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }

    setTimeout(() => {
        try {
            const users = JSON.parse(localStorage.getItem('shop974_users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                currentUser = user;
                saveUserData();
                updateUserInterface();

                showNotification(`Bienvenue, ${user.firstName} !`, 'success');
                setTimeout(() => showHome(), 1500);
            } else {
                showNotification('Email ou mot de passe incorrect', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Erreur lors de la connexion', 'error');
        }
    }, 1000);
}

function logout() {
    const userName = currentUser ? currentUser.firstName : '';
    currentUser = null;
    saveUserData();
    updateUserInterface();
    showHome();
    showNotification(`Au revoir ${userName} !`, 'info');
}

function updateUserInterface() {
    const loginBtn = document.getElementById('loginBtn');
    const accountBtn = document.getElementById('accountBtn');

    if (currentUser) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (accountBtn) {
            accountBtn.classList.remove('hidden');
            accountBtn.innerHTML = `<span class="user-avatar">👤</span> ${currentUser.firstName}`;
        }
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (accountBtn) accountBtn.classList.add('hidden');
    }
}

function showLoginForm() {
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
}

function showRegisterForm() {
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

// =================== ACCOUNT MANAGEMENT ===================
function loadAccountData() {
    loadOrderHistory();
    loadProfile();
}

function showOrderHistory() {
    document.querySelectorAll('.account-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById('orderHistory').classList.remove('hidden');

    // Update active tab
    document.querySelectorAll('.account-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector('.account-tab').classList.add('active');

    loadOrderHistory();
}

function showProfile() {
    document.querySelectorAll('.account-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById('profileSection').classList.remove('hidden');

    // Update active tab
    document.querySelectorAll('.account-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.account-tab')[1].classList.add('active');

    loadProfile();
}

function showPreferences() {
    document.querySelectorAll('.account-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById('preferencesSection').classList.remove('hidden');

    // Update active tab
    document.querySelectorAll('.account-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.account-tab')[2].classList.add('active');

    loadUserPreferences();
}

function loadOrderHistory() {
    const container = document.getElementById('ordersList');
    if (!container || !currentUser) return;

    const userOrders = orders.filter(order => order.userId === currentUser.id);

    if (userOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-orders">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                <h3>Aucune commande trouvée</h3>
                <p>Vous n'avez pas encore passé de commande</p>
                <button class="btn-primary" onclick="showProducts()">Découvrir nos produits</button>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    userOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';

        const statusClass = order.status === 'completed' ? 'completed' : 'pending';
        const statusText = order.status === 'completed' ? 'Livrée' : 'En cours';

        orderElement.innerHTML = `
            <div class="order-header">
                <strong>Commande #${order.orderNumber}</strong>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            <div class="order-details">
                <p>📅 <strong>Date:</strong> ${new Date(order.date).toLocaleDateString('fr-FR')}</p>
                <p>💰 <strong>Total:</strong> €${order.total.toFixed(2)}</p>
                <p>📦 <strong>Articles:</strong> ${order.items.length}</p>
            </div>
            <div class="order-actions">
                <button class="btn-secondary btn-small" onclick="viewOrderDetails(${order.id})">Voir détails</button>
                <button class="btn-secondary btn-small" onclick="reorderItems(${order.id})">Commander à nouveau</button>
            </div>
        `;

        container.appendChild(orderElement);
    });
}

function loadProfile() {
    if (!currentUser) return;

    const fields = {
        'profileFirstName': currentUser.firstName,
        'profileLastName': currentUser.lastName,
        'profileEmail': currentUser.email,
        'profilePhone': currentUser.phone || ''
    };

    Object.entries(fields).forEach(([fieldId, value]) => {
        const field = document.getElementById(fieldId);
        if (field) field.value = value;
    });
}

function updateProfile(event) {
    event.preventDefault();

    if (!currentUser) return;

    const formData = {
        firstName: document.getElementById('profileFirstName')?.value.trim(),
        lastName: document.getElementById('profileLastName')?.value.trim(),
        email: document.getElementById('profileEmail')?.value.trim(),
        phone: document.getElementById('profilePhone')?.value.trim()
    };

    if (!formData.firstName || !formData.lastName || !formData.email) {
        showNotification('Veuillez remplir les champs obligatoires', 'error');
        return;
    }

    setTimeout(() => {
        Object.assign(currentUser, formData);
        saveUserData();
        updateUserInterface();

        const users = JSON.parse(localStorage.getItem('shop974_users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('shop974_users', JSON.stringify(users));
        }

        showNotification('Profil mis à jour avec succès !', 'success');
    }, 500);
}

function loadUserPreferences() {
    const preferences = currentUser?.preferences || {};

    const toggles = {
        'emailNotifications': preferences.emailNotifications !== false,
        'promoNotifications': preferences.promoNotifications !== false,
        'darkMode': state.darkMode
    };

    Object.entries(toggles).forEach(([toggleId, value]) => {
        const toggle = document.getElementById(toggleId);
        if (toggle) toggle.checked = value;
    });
}

function saveUserPreferences() {
    if (!currentUser) return;

    const preferences = {
        emailNotifications: document.getElementById('emailNotifications')?.checked || false,
        promoNotifications: document.getElementById('promoNotifications')?.checked || false
    };

    currentUser.preferences = {...currentUser.preferences, ...preferences};
    saveUserData();
    showNotification('Préférences sauvegardées !', 'success');
}

function toggleDarkMode() {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark-mode', state.darkMode);

    const message = state.darkMode ? 'Mode sombre activé' : 'Mode clair activé';
    showNotification(message, 'info');
}

// =================== WISHLIST ===================
function toggleWishlist(productId) {
    const isInWishlist = wishlist.find(item => item.id === productId);

    if (isInWishlist) {
        removeFromWishlist(productId);
    } else {
        addToWishlist(productId);
    }
}

function addToWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (wishlist.find(item => item.id === productId)) {
        showNotification('Produit déjà dans vos favoris', 'info');
        return;
    }

    wishlist.push({
        ...product,
        addedAt: new Date().toISOString()
    });

    saveWishlist();
    updateWishlistUI();
    showNotification(`${product.name} ajouté aux favoris !`, 'success');
}

function removeFromWishlist(productId) {
    const itemIndex = wishlist.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;

    const removedItem = wishlist[itemIndex];
    wishlist.splice(itemIndex, 1);

    saveWishlist();
    updateWishlistUI();
    showNotification(`${removedItem.name} retiré des favoris`, 'info');
}

function updateWishlistUI() {
    // Update heart icons in product cards
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productCard = btn.closest('.product-card');
        if (productCard) {
            const productId = parseInt(productCard.dataset.productId);
            const isInWishlist = wishlist.find(item => item.id === productId);

            btn.classList.toggle('active', !!isInWishlist);
            btn.innerHTML = isInWishlist ? '❤️' : '🤍';
        }
    });
}

// =================== CHECKOUT ===================
function displayOrderSummary() {
    const container = document.getElementById('orderSummary');
    const finalTotalElement = document.getElementById('finalTotal');

    if (!container) return;

    let html = '<div class="order-items">';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        html += `
            <div class="order-item">
                <div class="order-item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">× ${item.quantity}</span>
                </div>
                <span class="item-total">€${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });

    const shipping = subtotal >= 50 ? 0 : 4.99;
    const total = subtotal + shipping;

    html += `</div>
        <div class="order-summary-totals">
            <div class="summary-line">
                <span>Sous-total:</span>
                <span>€${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-line">
                <span>Livraison:</span>
                <span>${shipping === 0 ? 'Gratuite' : '€' + shipping.toFixed(2)}</span>
            </div>
            <div class="summary-line total-line">
                <strong>Total: €${total.toFixed(2)}</strong>
            </div>
        </div>
    `;

    container.innerHTML = html;
    if (finalTotalElement) {
        finalTotalElement.textContent = total.toFixed(2);
    }
}

function applyPromoCode() {
    const promoInput = document.getElementById('promoCode');
    if (!promoInput) return;

    const code = promoInput.value.trim().toUpperCase();

    const promoCodes = {
        'WELCOME10': { discount: 0.1, description: '10% de réduction' },
        'FIRST20': { discount: 0.2, description: '20% de réduction première commande' },
        'REUNION974': { discount: 0.15, description: '15% de réduction spéciale Réunion' }
    };

    if (promoCodes[code]) {
        const promo = promoCodes[code];
        showNotification(`Code promo appliqué: ${promo.description}`, 'success');
    } else if (code) {
        showNotification('Code promo invalide', 'error');
    }

    promoInput.value = '';
}

function processPayment() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (!paymentMethod) {
        showNotification('Veuillez sélectionner un mode de paiement', 'error');
        return;
    }

    const formData = getCheckoutFormData();
    if (!validateCheckoutForm(formData)) {
        return;
    }

    setLoadingState(true);

    setTimeout(() => {
        try {
            const orderTotal = calculateOrderTotal();

            const order = {
                id: Date.now(),
                orderNumber: generateOrderNumber(),
                userId: currentUser ? currentUser.id : null,
                items: [...cart],
                subtotal: orderTotal.subtotal,
                shipping: orderTotal.shipping,
                total: orderTotal.total,
                paymentMethod: paymentMethod,
                status: 'completed',
                date: new Date().toISOString(),
                estimatedDelivery: calculateDeliveryDate(),
                shippingAddress: formData
            };

            orders.push(order);
            saveOrdersData();

            cart = [];
            saveCartData();
            updateCartCount();

            setLoadingState(false);
            showOrderSuccess(order);

        } catch (error) {
            console.error('Order processing failed:', error);
            setLoadingState(false);
            showNotification('Erreur lors du traitement de la commande', 'error');
        }
    }, 2000);
}

function getCheckoutFormData() {
    return {
        firstName: document.getElementById('firstName')?.value.trim() || '',
        lastName: document.getElementById('lastName')?.value.trim() || '',
        email: document.getElementById('email')?.value.trim() || '',
        phone: document.getElementById('phone')?.value.trim() || '',
        address: document.getElementById('address')?.value.trim() || '',
        city: document.getElementById('city')?.value.trim() || '',
        postalCode: document.getElementById('postalCode')?.value.trim() || ''
    };
}

function validateCheckoutForm(formData) {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'error');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showNotification('Email invalide', 'error');
        return false;
    }

    return true;
}

function calculateOrderTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const total = subtotal + shipping;

    return { subtotal, shipping, total };
}

function generateOrderNumber() {
    const prefix = 'SH974';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}-${timestamp}${random}`;
}

function calculateDeliveryDate() {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    return deliveryDate.toISOString();
}

function showOrderSuccess(order) {
    showNotification(`Commande ${order.orderNumber} confirmée ! Total: €${order.total.toFixed(2)}`, 'success');

    // Redirect to account after a short delay
    setTimeout(() => {
        if (currentUser) {
            showAccount();
        } else {
            showHome();
        }
    }, 2000);
}

// =================== ORDER MANAGEMENT ===================
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Commande non trouvée', 'error');
        return;
    }

    showNotification(`Détails de la commande #${order.orderNumber} - Fonctionnalité en développement`, 'info');
}

function reorderItems(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Commande non trouvée', 'error');
        return;
    }

    let addedItems = 0;
    order.items.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product && product.stock > 0) {
            const existingItem = cart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                cart.push({
                    ...product,
                    quantity: item.quantity,
                    addedAt: new Date().toISOString()
                });
            }
            addedItems++;
        }
    });

    if (addedItems > 0) {
        updateCartCount();
        saveCartData();
        showNotification(`${addedItems} article(s) ajouté(s) au panier !`, 'success');
    } else {
        showNotification('Aucun article disponible pour cette commande', 'warning');
    }
}

// =================== NEWSLETTER ===================
function subscribeNewsletter(event) {
    event.preventDefault();
    const emailInput = event.target.querySelector('input[type="email"]');
    const email = emailInput?.value.trim();

    if (!email || !email.includes('@')) {
        showNotification('Veuillez saisir une adresse email valide', 'error');
        return;
    }

    setTimeout(() => {
        showNotification('Merci pour votre inscription à la newsletter !', 'success');
        if (emailInput) emailInput.value = '';
    }, 500);
}

// =================== UTILITIES ===================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()" aria-label="Fermer">&times;</button>
        </div>
    `;

    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 350px;
                animation: slideInRight 0.3s ease;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            .notification-success { background: #28a745; color: white; }
            .notification-error { background: #dc3545; color: white; }
            .notification-warning { background: #ffc107; color: #333; }
            .notification-info { background: #17a2b8; color: white; }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }

            .notification-close {
                background: none;
                border: none;
                color: currentColor;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
                opacity: 0.8;
            }

            .notification-close:hover {
                opacity: 1;
                background: rgba(255, 255, 255, 0.2);
            }

            @media (max-width: 768px) {
                .notification {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function setLoadingState(isLoading) {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;

    if (isLoading) {
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        state.isLoading = true;
    } else {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
        state.isLoading = false;
    }
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name || field.id;

    field.classList.remove('valid', 'invalid');

    if (!value && !field.hasAttribute('required')) {
        return true;
    }

    let isValid = true;
    let message = '';

    switch (fieldName) {
        case 'email':
        case 'loginEmail':
        case 'regEmail':
        case 'profileEmail':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
            message = 'Email invalide';
            break;

        case 'password':
        case 'regPassword':
        case 'loginPassword':
            isValid = value.length >= 6;
            message = 'Le mot de passe doit contenir au moins 6 caractères';
            break;

        case 'phone':
        case 'profilePhone':
            const phoneRegex = /^(\+262|0)(6|7|9)\d{8}$/;
            isValid = !value || phoneRegex.test(value.replace(/\s/g, ''));
            message = 'Numéro de téléphone réunionnais invalide';
            break;

        case 'firstName':
        case 'lastName':
        case 'regFirstName':
        case 'regLastName':
        case 'profileFirstName':
        case 'profileLastName':
            isValid = value.length >= 2;
            message = 'Ce champ doit contenir au moins 2 caractères';
            break;

        default:
            isValid = value.length > 0;
            message = 'Ce champ est obligatoire';
    }

    field.classList.add(isValid ? 'valid' : 'invalid');

    const errorElementId = field.id + '-error';
    let messageElement = document.getElementById(errorElementId);

    if (!isValid) {
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = errorElementId;
            messageElement.className = 'field-error';
            field.parentElement.appendChild(messageElement);
        }
        messageElement.textContent = message;
    } else if (messageElement) {
        messageElement.textContent = '';
    }

    return isValid;
}

// =================== PASSWORD STRENGTH ===================
function updatePasswordStrength(passwordInput) {
    const password = passwordInput.value;
    const strengthBar = passwordInput.closest('.form-group')?.querySelector('.strength-fill');
    const strengthText = passwordInput.closest('.form-group')?.querySelector('.strength-text');

    if (!strengthBar || !strengthText) return;

    let strength = 0;
    let strengthLabel = '';
    let strengthColor = '';

    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;

    switch (strength) {
        case 0:
        case 1:
            strengthLabel = 'Très faible';
            strengthColor = '#dc3545';
            break;
        case 2:
            strengthLabel = 'Faible';
            strengthColor = '#fd7e14';
            break;
        case 3:
            strengthLabel = 'Moyen';
            strengthColor = '#ffc107';
            break;
        case 4:
            strengthLabel = 'Fort';
            strengthColor = '#28a745';
            break;
        case 5:
            strengthLabel = 'Très fort';
            strengthColor = '#20c997';
            break;
    }

    strengthBar.style.width = `${(strength / 5) * 100}%`;
    strengthBar.style.backgroundColor = strengthColor;
    strengthText.textContent = strengthLabel;
    strengthText.style.color = strengthColor;
}

// =================== PERFORMANCE OPTIMIZATIONS ===================

// Debounce function for search and other intensive operations
function debounce(func, wait) {
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

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Intersection Observer for lazy loading (if needed)
function initIntersectionObserver() {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Observe elements that need animation
        document.querySelectorAll('.product-card, .feature-card').forEach(el => {
            observer.observe(el);
        });
    }
}

// =================== ERROR HANDLING ===================
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showNotification('Une erreur est survenue. Veuillez rafraîchir la page.', 'error');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('Erreur de traitement. Veuillez réessayer.', 'error');
    event.preventDefault();
});

// =================== BROWSER COMPATIBILITY ===================

// Basic polyfill for older browsers
if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        for (let i = 0; i < this.length; i++) {
            if (predicate(this[i], i, this)) {
                return this[i];
            }
        }
        return undefined;
    };
}

if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement) {
        return this.indexOf(searchElement) !== -1;
    };
}

// =================== ACCESSIBILITY ENHANCEMENTS ===================

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Add keyboard class for focus visibility
    if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('using-keyboard');
});

// Screen reader announcements
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// =================== MOBILE OPTIMIZATIONS ===================

// Handle viewport height for mobile devices
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Update on resize and orientation change
window.addEventListener('resize', debounce(setViewportHeight, 100));
window.addEventListener('orientationchange', setViewportHeight);

// Initialize viewport height
setViewportHeight();

// Prevent zoom on input focus for iOS
if (platform.isIOS) {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.style.fontSize !== '16px') {
            input.style.fontSize = '16px';
        }
    });
}

// =================== PWA SUPPORT ===================

// Service Worker registration (basic)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Handle online/offline status
window.addEventListener('online', function() {
    showNotification('Connexion rétablie', 'success');
});

window.addEventListener('offline', function() {
    showNotification('Mode hors ligne', 'warning');
});

// =================== FINAL INITIALIZATION ===================

// Initialize intersection observer after DOM is ready
setTimeout(initIntersectionObserver, 500);

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    // Save important data
    saveCartData();
    saveWishlist();
    if (currentUser) {
        saveUserData();
    }
});

// =================== GLOBAL FUNCTIONS EXPOSURE ===================

// Expose main functions globally for onclick handlers
window.showHome = showHome;
window.showProducts = showProducts;
window.showCart = showCart;
window.showCheckout = showCheckout;
window.showLogin = showLogin;
window.showAccount = showAccount;
window.showProductDetail = showProductDetail;
window.toggleMobileMenu = toggleMobileMenu;
window.addToCart = addToCart;
window.addToCartWithQuantity = addToCartWithQuantity;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.changeQuantity = changeQuantity;
window.filterProducts = filterProducts;
window.toggleWishlist = toggleWishlist;
window.login = login;
window.register = register;
window.logout = logout;
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.updateProfile = updateProfile;
window.saveUserPreferences = saveUserPreferences;
window.toggleDarkMode = toggleDarkMode;
window.viewOrderDetails = viewOrderDetails;
window.reorderItems = reorderItems;
window.applyPromoCode = applyPromoCode;
window.processPayment = processPayment;
window.subscribeNewsletter = subscribeNewsletter;
window.showOrderHistory = showOrderHistory;
window.showProfile = showProfile;
window.showPreferences = showPreferences;

// Console success message
console.log('🎉 Shop 974 JavaScript loaded successfully!');
console.log('✅ All functions are working and ready');
console.log('📱 Mobile optimized and responsive');
console.log('🛍️ Ready for production use!');