// Shop 974 - Script spécifique pour la page des produits
class ProductsPage {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.currentView = 'grid';
        this.currentSort = 'relevance';
        this.filters = {
            categories: [],
            brands: [],
            minPrice: 0,
            maxPrice: 1000,
            rating: 0,
            search: ''
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSearch();
        this.setupFilters();
        this.setupViewToggle();
        this.setupSort();
        this.setupPagination();
        this.loadProducts();
    }

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        // Toggle des filtres sur mobile
        const filtersToggle = document.getElementById('filtersToggle');
        const filtersContent = document.getElementById('filtersContent');
        
        if (filtersToggle) {
            filtersToggle.addEventListener('click', () => {
                filtersContent.classList.toggle('active');
            });
        }

        // Boutons d'action des filtres
        const clearFilters = document.getElementById('clearFilters');
        const applyFilters = document.getElementById('applyFilters');
        const clearAllFilters = document.getElementById('clearAllFilters');

        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearFilters());
        }

        if (applyFilters) {
            applyFilters.addEventListener('click', () => this.applyFilters());
        }

        if (clearAllFilters) {
            clearAllFilters.addEventListener('click', () => this.clearAllFilters());
        }

        // Modal panier
        this.setupCartModal();
    }

    // Configuration de la recherche
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        if (searchInput) {
            // Recherche en temps réel avec debounce
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = e.target.value.toLowerCase();
                    this.applyFilters();
                }, 300);
            });

            // Recherche sur Enter
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.filters.search = e.target.value.toLowerCase();
                    this.applyFilters();
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                if (searchInput) {
                    this.filters.search = searchInput.value.toLowerCase();
                    this.applyFilters();
                }
            });
        }
    }

    // Configuration des filtres
    setupFilters() {
        // Filtres de catégories
        const categoryFilters = document.querySelectorAll('input[name="category"]');
        categoryFilters.forEach(filter => {
            filter.addEventListener('change', () => {
                this.updateCategoryFilters();
            });
        });

        // Filtres de marques
        const brandFilters = document.querySelectorAll('input[name="brand"]');
        brandFilters.forEach(filter => {
            filter.addEventListener('change', () => {
                this.updateBrandFilters();
            });
        });

        // Filtres de prix
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const priceRange = document.getElementById('priceRange');

        if (minPrice) {
            minPrice.addEventListener('input', () => {
                this.filters.minPrice = parseInt(minPrice.value) || 0;
                this.updatePriceRange();
            });
        }

        if (maxPrice) {
            maxPrice.addEventListener('input', () => {
                this.filters.maxPrice = parseInt(maxPrice.value) || 1000;
                this.updatePriceRange();
            });
        }

        if (priceRange) {
            priceRange.addEventListener('input', () => {
                this.filters.maxPrice = parseInt(priceRange.value);
                if (maxPrice) maxPrice.value = this.filters.maxPrice;
            });
        }

        // Filtres de note
        const ratingFilters = document.querySelectorAll('input[name="rating"]');
        ratingFilters.forEach(filter => {
            filter.addEventListener('change', () => {
                this.filters.rating = parseInt(filter.value) || 0;
            });
        });
    }

    // Configuration du toggle de vue
    setupViewToggle() {
        const viewBtns = document.querySelectorAll('.view-btn');
        const productsGrid = document.getElementById('productsGrid');

        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                
                // Mise à jour des boutons
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Mise à jour de la vue
                this.currentView = view;
                if (productsGrid) {
                    productsGrid.className = view === 'list' ? 'products-grid list-view' : 'products-grid';
                }
                
                // Sauvegarde de la préférence
                localStorage.setItem('shop974_view_preference', view);
            });
        });

        // Restaurer la préférence de vue
        const savedView = localStorage.getItem('shop974_view_preference');
        if (savedView && savedView !== this.currentView) {
            const viewBtn = document.querySelector(`[data-view="${savedView}"]`);
            if (viewBtn) viewBtn.click();
        }
    }

    // Configuration du tri
    setupSort() {
        const sortSelect = document.getElementById('sortSelect');
        
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.currentSort = sortSelect.value;
                this.sortProducts();
                this.renderProducts();
            });
        }
    }

    // Chargement des produits
    async loadProducts() {
        const loader = document.getElementById('productsLoader');
        const productsGrid = document.getElementById('productsGrid');
        
        try {
            if (loader) {
                loader.style.display = 'block';
            }
            if (productsGrid) {
                productsGrid.style.display = 'none';
            }

            // Simulation de données de produits (à remplacer par un appel API)
            this.products = this.generateSampleProducts();
            
            // Simulation d'un délai de chargement
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.filteredProducts = [...this.products];
            this.sortProducts();
            this.renderProducts();
            this.updateResultsCount();
            
        } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
            this.showError('Erreur lors du chargement des produits');
        } finally {
            if (loader) {
                loader.style.display = 'none';
            }
            if (productsGrid) {
                productsGrid.style.display = 'grid';
            }
        }
    }

    // Génération de produits d'exemple
    generateSampleProducts() {
        const categories = ['electronics', 'fashion', 'home', 'sports', 'beauty'];
        const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Zara', 'H&M'];
        const products = [];

        for (let i = 1; i <= 50; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const brand = brands[Math.floor(Math.random() * brands.length)];
            const price = Math.floor(Math.random() * 500) + 20;
            const originalPrice = Math.random() > 0.7 ? price + Math.floor(Math.random() * 100) : null;
            const rating = Math.floor(Math.random() * 5) + 1;
            const reviewCount = Math.floor(Math.random() * 200) + 5;

            products.push({
                id: i,
                name: `Produit ${i} - ${brand}`,
                category: category,
                brand: brand,
                price: price,
                originalPrice: originalPrice,
                rating: rating,
                reviewCount: reviewCount,
                image: `https://picsum.photos/300/300?random=${i}`,
                badge: this.getProductBadge(originalPrice, i),
                inStock: Math.random() > 0.1,
                description: `Description du produit ${i}. Un excellent produit de la marque ${brand}.`
            });
        }

        return products;
    }

    // Obtenir le badge du produit
    getProductBadge(originalPrice, id) {
        if (originalPrice) return { text: 'PROMO', class: 'sale' };
        if (id <= 10) return { text: 'NOUVEAU', class: 'new' };
        return null;
    }

    // Mise à jour des filtres de catégories
    updateCategoryFilters() {
        const categoryFilters = document.querySelectorAll('input[name="category"]:checked');
        this.filters.categories = Array.from(categoryFilters).map(filter => filter.value);
        
        // Si "all" est sélectionné, vider les autres
        if (this.filters.categories.includes('all')) {
            this.filters.categories = [];
            categoryFilters.forEach(filter => {
                if (filter.value !== 'all') filter.checked = false;
            });
        }
    }

    // Mise à jour des filtres de marques
    updateBrandFilters() {
        const brandFilters = document.querySelectorAll('input[name="brand"]:checked');
        this.filters.brands = Array.from(brandFilters).map(filter => filter.value);
    }

    // Mise à jour du range de prix
    updatePriceRange() {
        const priceRange = document.getElementById('priceRange');
        if (priceRange) {
            priceRange.value = this.filters.maxPrice;
        }
    }

    // Application des filtres
    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Filtre de recherche
            if (this.filters.search && 
                !product.name.toLowerCase().includes(this.filters.search) &&
                !product.brand.toLowerCase().includes(this.filters.search) &&
                !product.category.toLowerCase().includes(this.filters.search)) {
                return false;
            }

            // Filtre de catégories
            if (this.filters.categories.length > 0 && 
                !this.filters.categories.includes(product.category)) {
                return false;
            }

            // Filtre de marques
            if (this.filters.brands.length > 0 && 
                !this.filters.brands.includes(product.brand.toLowerCase())) {
                return false;
            }

            // Filtre de prix
            if (product.price < this.filters.minPrice || 
                product.price > this.filters.maxPrice) {
                return false;
            }

            // Filtre de note
            if (this.filters.rating > 0 && product.rating < this.filters.rating) {
                return false;
            }

            return true;
        });

        this.currentPage = 1;
        this.sortProducts();
        this.renderProducts();
        this.updateResultsCount();
        this.updateActiveFilters();
        this.setupPagination();
    }

    // Tri des produits
    sortProducts() {
        switch (this.currentSort) {
            case 'price-asc':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                this.filteredProducts.sort((a, b) => b.id - a.id);
                break;
            default: // relevance
                // Tri par pertinence (score basé sur recherche, popularité, etc.)
                break;
        }
    }

    // Rendu des produits
    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const noResults = document.getElementById('noResults');

        if (!productsGrid) {
            return;
        }

        if (this.filteredProducts.length === 0) {
            productsGrid.style.display = 'none';
            if (noResults) noResults.style.display = 'block';
            return;
        }

        if (noResults) noResults.style.display = 'none';
        productsGrid.style.display = 'grid';

        // Calcul de la pagination
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

        // Génération du HTML
        const html = productsToShow.map(product => this.createProductCard(product)).join('');
        productsGrid.innerHTML = html;

        // Ajout des écouteurs d'événements
        this.attachProductEventListeners();
    }

    // Création d'une carte produit
    createProductCard(product) {
        const discount = product.originalPrice ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.badge ? `<div class="product-badge ${product.badge.class}">${product.badge.text}</div>` : ''}
                    <div class="product-actions">
                        <button class="product-action" title="Ajouter aux favoris" data-action="favorite">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="product-action" title="Aperçu rapide" data-action="quick-view">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="product-action" title="Comparer" data-action="compare">
                            <i class="fas fa-balance-scale"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${this.getCategoryName(product.category)}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">
                        <div class="stars">
                            ${this.generateStars(product.rating)}
                        </div>
                        <span class="rating-count">(${product.reviewCount})</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">${product.price}€</span>
                        ${product.originalPrice ? `<span class="original-price">${product.originalPrice}€</span>` : ''}
                        ${discount > 0 ? `<span class="discount">-${discount}%</span>` : ''}
                    </div>
                    <div class="product-footer">
                        <button class="add-to-cart" ${!product.inStock ? 'disabled' : ''} data-product-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i>
                            ${product.inStock ? 'Ajouter au panier' : 'Rupture de stock'}
                        </button>
                        <button class="quick-view" data-action="quick-view" data-product-id="${product.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Génération des étoiles
    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    // Obtenir le nom de la catégorie
    getCategoryName(category) {
        const categoryNames = {
            'electronics': 'Électronique',
            'fashion': 'Mode',
            'home': 'Maison & Jardin',
            'sports': 'Sports & Loisirs',
            'beauty': 'Beauté & Santé'
        };
        return categoryNames[category] || category;
    }

    // Attachement des écouteurs d'événements des produits
    attachProductEventListeners() {
        // Boutons d'ajout au panier
        const addToCartBtns = document.querySelectorAll('.add-to-cart');
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-product-id'));
                this.addToCart(productId);
            });
        });

        // Actions des produits
        const productActions = document.querySelectorAll('.product-action, .quick-view');
        productActions.forEach(action => {
            action.addEventListener('click', (e) => {
                const actionType = e.target.getAttribute('data-action');
                const productId = parseInt(e.target.getAttribute('data-product-id')) || 
                                parseInt(e.target.closest('.product-card').getAttribute('data-product-id'));
                
                this.handleProductAction(actionType, productId);
            });
        });
    }

    // Gestion des actions des produits
    handleProductAction(action, productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        switch (action) {
            case 'favorite':
                this.toggleFavorite(productId);
                break;
            case 'quick-view':
                this.showQuickView(product);
                break;
            case 'compare':
                this.addToCompare(productId);
                break;
        }
    }

    // Ajout au panier
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !product.inStock) return;

        // Utiliser la fonction du panier global si disponible
        if (window.shop974 && window.shop974.addToCart) {
            window.shop974.addToCart(product);
        } else {
            // Fallback local
            let cart = JSON.parse(localStorage.getItem('shop974_cart') || '[]');
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            
            localStorage.setItem('shop974_cart', JSON.stringify(cart));
            this.updateCartCount();
        }

        // Afficher une notification
        this.showNotification(`${product.name} ajouté au panier`, 'success');
        
        // Afficher le modal panier
        this.showCartModal();
    }

    // Toggle favori
    toggleFavorite(productId) {
        let favorites = JSON.parse(localStorage.getItem('shop974_favorites') || '[]');
        const index = favorites.indexOf(productId);
        
        if (index > -1) {
            favorites.splice(index, 1);
            this.showNotification('Produit retiré des favoris', 'info');
        } else {
            favorites.push(productId);
            this.showNotification('Produit ajouté aux favoris', 'success');
        }
        
        localStorage.setItem('shop974_favorites', JSON.stringify(favorites));
        this.updateFavoriteButtons();
    }

    // Mise à jour des boutons favoris
    updateFavoriteButtons() {
        const favorites = JSON.parse(localStorage.getItem('shop974_favorites') || '[]');
        const favoriteButtons = document.querySelectorAll('[data-action="favorite"]');
        
        favoriteButtons.forEach(btn => {
            const productId = parseInt(btn.closest('.product-card').getAttribute('data-product-id'));
            const icon = btn.querySelector('i');
            
            if (favorites.includes(productId)) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                btn.style.color = 'var(--error-color)';
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                btn.style.color = '';
            }
        });
    }

    // Aperçu rapide
    showQuickView(product) {
        // Créer et afficher un modal d'aperçu rapide
        const modal = document.createElement('div');
        modal.className = 'modal quick-view-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Aperçu rapide</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="quick-view-content">
                        <div class="quick-view-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="quick-view-info">
                            <h4>${product.name}</h4>
                            <div class="product-rating">
                                <div class="stars">${this.generateStars(product.rating)}</div>
                                <span>(${product.reviewCount} avis)</span>
                            </div>
                            <div class="product-price">
                                <span class="current-price">${product.price}€</span>
                                ${product.originalPrice ? `<span class="original-price">${product.originalPrice}€</span>` : ''}
                            </div>
                            <p>${product.description}</p>
                            <div class="quick-view-actions">
                                <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                                    <i class="fas fa-shopping-cart"></i>
                                    Ajouter au panier
                                </button>
                                <button class="btn btn-outline" data-action="favorite" data-product-id="${product.id}">
                                    <i class="far fa-heart"></i>
                                    Favoris
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.classList.add('active');
        
        // Écouteurs d'événements du modal
        const closeBtn = modal.querySelector('.modal-close');
        const addToCartBtn = modal.querySelector('.add-to-cart');
        const favoriteBtn = modal.querySelector('[data-action="favorite"]');
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        addToCartBtn.addEventListener('click', () => {
            this.addToCart(product.id);
            modal.remove();
        });
        
        favoriteBtn.addEventListener('click', () => {
            this.toggleFavorite(product.id);
        });
    }

    // Configuration de la pagination
    setupPagination() {
        const paginationContainer = document.getElementById('paginationContainer');
        const pagination = document.getElementById('pagination');
        
        if (!pagination) return;
        
        // Si pas de produits encore, cacher la pagination
        if (!this.filteredProducts || this.filteredProducts.length === 0) {
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }
        
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (totalPages <= 1) {
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }
        
        if (paginationContainer) paginationContainer.style.display = 'flex';
        
        let paginationHTML = '';
        
        // Bouton précédent
        paginationHTML += `
            <button ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Pages
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="ellipsis">...</span>';
            }
        }
        
        // Bouton suivant
        paginationHTML += `
            <button ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
        
        // Écouteurs d'événements
        const pageButtons = pagination.querySelectorAll('button[data-page]');
        pageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.getAttribute('data-page'));
                if (page !== this.currentPage && page >= 1 && page <= totalPages) {
                    this.currentPage = page;
                    this.renderProducts();
                    this.setupPagination();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    // Mise à jour du compteur de résultats
    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            const total = this.filteredProducts.length;
            const start = (this.currentPage - 1) * this.productsPerPage + 1;
            const end = Math.min(start + this.productsPerPage - 1, total);
            
            if (total === 0) {
                resultsCount.textContent = 'Aucun produit trouvé';
            } else {
                resultsCount.textContent = `Affichage de ${start}-${end} sur ${total} produits`;
            }
        }
    }

    // Mise à jour des filtres actifs
    updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('activeFilters');
        if (!activeFiltersContainer) return;
        
        const activeFilters = [];
        
        // Filtres de catégories
        if (this.filters.categories.length > 0) {
            this.filters.categories.forEach(category => {
                activeFilters.push({
                    type: 'category',
                    value: category,
                    label: this.getCategoryName(category)
                });
            });
        }
        
        // Filtres de marques
        if (this.filters.brands.length > 0) {
            this.filters.brands.forEach(brand => {
                activeFilters.push({
                    type: 'brand',
                    value: brand,
                    label: brand.charAt(0).toUpperCase() + brand.slice(1)
                });
            });
        }
        
        // Filtre de prix
        if (this.filters.minPrice > 0 || this.filters.maxPrice < 1000) {
            activeFilters.push({
                type: 'price',
                value: 'price',
                label: `${this.filters.minPrice}€ - ${this.filters.maxPrice}€`
            });
        }
        
        // Filtre de note
        if (this.filters.rating > 0) {
            activeFilters.push({
                type: 'rating',
                value: this.filters.rating,
                label: `${this.filters.rating}+ étoiles`
            });
        }
        
        // Filtre de recherche
        if (this.filters.search) {
            activeFilters.push({
                type: 'search',
                value: this.filters.search,
                label: `"${this.filters.search}"`
            });
        }
        
        // Rendu des filtres actifs
        activeFiltersContainer.innerHTML = activeFilters.map(filter => `
            <div class="active-filter">
                <span>${filter.label}</span>
                <button onclick="productsPage.removeActiveFilter('${filter.type}', '${filter.value}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    // Suppression d'un filtre actif
    removeActiveFilter(type, value) {
        switch (type) {
            case 'category':
                this.filters.categories = this.filters.categories.filter(c => c !== value);
                break;
            case 'brand':
                this.filters.brands = this.filters.brands.filter(b => b !== value);
                break;
            case 'price':
                this.filters.minPrice = 0;
                this.filters.maxPrice = 1000;
                break;
            case 'rating':
                this.filters.rating = 0;
                break;
            case 'search':
                this.filters.search = '';
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = '';
                break;
        }
        
        this.updateFilterInputs();
        this.applyFilters();
    }

    // Mise à jour des inputs de filtres
    updateFilterInputs() {
        // Catégories
        const categoryInputs = document.querySelectorAll('input[name="category"]');
        categoryInputs.forEach(input => {
            input.checked = this.filters.categories.includes(input.value) || 
                           (this.filters.categories.length === 0 && input.value === 'all');
        });
        
        // Marques
        const brandInputs = document.querySelectorAll('input[name="brand"]');
        brandInputs.forEach(input => {
            input.checked = this.filters.brands.includes(input.value);
        });
        
        // Prix
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        const priceRange = document.getElementById('priceRange');
        
        if (minPriceInput) minPriceInput.value = this.filters.minPrice;
        if (maxPriceInput) maxPriceInput.value = this.filters.maxPrice;
        if (priceRange) priceRange.value = this.filters.maxPrice;
        
        // Note
        const ratingInputs = document.querySelectorAll('input[name="rating"]');
        ratingInputs.forEach(input => {
            input.checked = parseInt(input.value) === this.filters.rating;
        });
    }

    // Effacer les filtres
    clearFilters() {
        this.filters = {
            categories: [],
            brands: [],
            minPrice: 0,
            maxPrice: 1000,
            rating: 0,
            search: this.filters.search // Garder la recherche
        };
        
        this.updateFilterInputs();
        this.applyFilters();
    }

    // Effacer tous les filtres
    clearAllFilters() {
        this.filters = {
            categories: [],
            brands: [],
            minPrice: 0,
            maxPrice: 1000,
            rating: 0,
            search: ''
        };
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        
        this.updateFilterInputs();
        this.applyFilters();
    }

    // Configuration du modal panier
    setupCartModal() {
        const cartModal = document.getElementById('cartModal');
        const cartModalClose = document.getElementById('cartModalClose');
        const cartModalClose2 = document.getElementById('cartModalClose2');
        
        if (cartModalClose) {
            cartModalClose.addEventListener('click', () => {
                cartModal.classList.remove('active');
            });
        }
        
        if (cartModalClose2) {
            cartModalClose2.addEventListener('click', () => {
                cartModal.classList.remove('active');
            });
        }
        
        if (cartModal) {
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    cartModal.classList.remove('active');
                }
            });
        }
    }

    // Affichage du modal panier
    showCartModal() {
        const cartModal = document.getElementById('cartModal');
        const cartModalBody = document.getElementById('cartModalBody');
        
        if (!cartModal || !cartModalBody) return;
        
        // Charger le contenu du panier
        const cart = JSON.parse(localStorage.getItem('shop974_cart') || '[]');
        
        if (cart.length === 0) {
            cartModalBody.innerHTML = '<p>Votre panier est vide</p>';
        } else {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            cartModalBody.innerHTML = `
                <div class="cart-items">
                    ${cart.slice(-3).map(item => `
                        <div class="cart-item">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="item-info">
                                <h4>${item.name}</h4>
                                <p>${item.quantity} x ${item.price}€</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-total">
                    <strong>Total: ${total.toFixed(2)}€</strong>
                </div>
            `;
        }
        
        cartModal.classList.add('active');
    }

    // Mise à jour du compteur de panier
    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('shop974_cart') || '[]');
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartCounts = document.querySelectorAll('#cartCount, #mobileCartCount');
        cartCounts.forEach(counter => {
            counter.textContent = count;
        });
    }

    // Affichage de notifications
    showNotification(message, type = 'info') {
        if (window.shop974 && window.shop974.showNotification) {
            window.shop974.showNotification(message, type);
        } else {
            // Fallback simple
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Affichage d'erreurs
    showError(message) {
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erreur</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Réessayer
                    </button>
                </div>
            `;
        }
    }
}

// Initialisation de la page des produits
document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('productsGrid');
    const productsLoader = document.getElementById('productsLoader');
    
    if (productsGrid && productsLoader) {
        window.productsPage = new ProductsPage();
    }
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductsPage;
}