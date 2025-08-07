// JavaScript spécifique à la page produits

class ProductsPage {
    constructor() {
        this.allProducts = [
            {
                id: 1,
                name: "Vanille Bourbon Premium",
                description: "Gousses de vanille de La Réunion, qualité exceptionnelle. Parfait pour vos desserts et pâtisseries.",
                price: 24.90,
                image: "🌿",
                category: "vanille",
                badge: "Premium",
                inStock: true
            },
            {
                id: 2,
                name: "Rhum Arrangé Ananas-Victoria",
                description: "Rhum traditionnel aux ananas Victoria de l'île. Macération de 6 mois minimum.",
                price: 32.50,
                image: "🥃",
                category: "rhums",
                badge: "Nouveau",
                inStock: true
            },
            {
                id: 3,
                name: "Massalé Authentique",
                description: "Mélange d'épices traditionnel réunionnais. Idéal pour les carry et rougails.",
                price: 8.90,
                image: "🌶️",
                category: "epices",
                badge: "",
                inStock: true
            },
            {
                id: 4,
                name: "Collier Coquillages",
                description: "Bijou artisanal en coquillages locaux. Pièce unique faite main.",
                price: 15.00,
                image: "🎨",
                category: "artisanat",
                badge: "Fait main",
                inStock: true
            },
            {
                id: 5,
                name: "Curcuma Bio",
                description: "Curcuma frais de La Réunion, séché et moulu. Propriétés anti-inflammatoires.",
                price: 12.50,
                image: "🌿",
                category: "epices",
                badge: "Bio",
                inStock: true
            },
            {
                id: 6,
                name: "Rhum Vieux 8 ans",
                description: "Rhum vieilli en fût de chêne pendant 8 ans. Notes boisées et vanillées.",
                price: 65.00,
                image: "🥃",
                category: "rhums",
                badge: "Vieilli",
                inStock: false
            },
            {
                id: 7,
                name: "Piment Confit",
                description: "Piments confits dans l'huile d'olive. Parfait pour relever vos plats.",
                price: 9.90,
                image: "🌶️",
                category: "epices",
                badge: "",
                inStock: true
            },
            {
                id: 8,
                name: "Sculpture Bois de Rose",
                description: "Sculpture artisanale en bois de rose. Représentation de la faune locale.",
                price: 45.00,
                image: "🎨",
                category: "artisanat",
                badge: "Unique",
                inStock: true
            },
            {
                id: 9,
                name: "Extrait de Vanille",
                description: "Extrait pur de vanille Bourbon. Concentration maximale pour vos recettes.",
                price: 18.90,
                image: "🌿",
                category: "vanille",
                badge: "",
                inStock: true
            },
            {
                id: 10,
                name: "Punch Coco",
                description: "Punch traditionnel à la noix de coco. Recette familiale transmise de génération en génération.",
                price: 28.00,
                image: "🥃",
                category: "rhums",
                badge: "Traditionnel",
                inStock: true
            }
        ];
        
        this.filteredProducts = [...this.allProducts];
        this.currentPage = 1;
        this.productsPerPage = 6;
        this.currentView = 'grid';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayProducts();
        this.updateResultsCount();
        this.setupPagination();
        this.loadFiltersFromURL();
    }

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        // Recherche
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        searchInput.addEventListener('input', () => this.debounce(this.handleSearch.bind(this), 300)());
        searchBtn.addEventListener('click', () => this.handleSearch());
        
        // Filtres
        document.getElementById('category-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('price-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('sort-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());
        
        // Vues
        document.getElementById('grid-view').addEventListener('click', () => this.setView('grid'));
        document.getElementById('list-view').addEventListener('click', () => this.setView('list'));
        
        // Reset recherche
        const resetBtn = document.getElementById('reset-search');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSearch());
        }
    }

    // Gestion de la recherche
    handleSearch() {
        const query = document.getElementById('search-input').value.toLowerCase().trim();
        
        if (query === '') {
            this.filteredProducts = [...this.allProducts];
        } else {
            this.filteredProducts = this.allProducts.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            );
        }
        
        this.currentPage = 1;
        this.applyFilters();
    }

    // Application des filtres
    applyFilters() {
        let products = [...this.filteredProducts];
        
        // Filtre par catégorie
        const categoryFilter = document.getElementById('category-filter').value;
        if (categoryFilter) {
            products = products.filter(product => product.category === categoryFilter);
        }
        
        // Filtre par prix
        const priceFilter = document.getElementById('price-filter').value;
        if (priceFilter) {
            products = products.filter(product => {
                const price = product.price;
                switch (priceFilter) {
                    case '0-10': return price <= 10;
                    case '10-25': return price > 10 && price <= 25;
                    case '25-50': return price > 25 && price <= 50;
                    case '50+': return price > 50;
                    default: return true;
                }
            });
        }
        
        // Tri
        const sortFilter = document.getElementById('sort-filter').value;
        switch (sortFilter) {
            case 'name':
                products.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-asc':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                products.sort((a, b) => b.id - a.id);
                break;
        }
        
        this.filteredProducts = products;
        this.currentPage = 1;
        this.displayProducts();
        this.updateResultsCount();
        this.setupPagination();
        this.updateURL();
    }

    // Effacer les filtres
    clearFilters() {
        document.getElementById('search-input').value = '';
        document.getElementById('category-filter').value = '';
        document.getElementById('price-filter').value = '';
        document.getElementById('sort-filter').value = 'name';
        
        this.filteredProducts = [...this.allProducts];
        this.currentPage = 1;
        this.displayProducts();
        this.updateResultsCount();
        this.setupPagination();
        this.updateURL();
    }

    // Réinitialiser la recherche
    resetSearch() {
        this.clearFilters();
    }

    // Affichage des produits
    displayProducts() {
        const container = document.getElementById('products-grid');
        const noProductsDiv = document.getElementById('no-products');
        
        if (this.filteredProducts.length === 0) {
            container.style.display = 'none';
            noProductsDiv.style.display = 'block';
            return;
        }
        
        container.style.display = 'grid';
        noProductsDiv.style.display = 'none';
        
        // Pagination
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
        
        container.innerHTML = '';
        container.className = `products-grid ${this.currentView === 'list' ? 'list-view' : ''}`;
        
        productsToShow.forEach((product, index) => {
            const productCard = this.createProductCard(product);
            productCard.classList.add('fade-in-up');
            productCard.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(productCard);
        });
    }

    // Créer une carte produit
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = `product-card ${this.currentView === 'list' ? 'list-view' : ''}`;
        
        const badgeHTML = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';
        const stockClass = product.inStock ? '' : 'out-of-stock';
        const stockText = product.inStock ? 'Ajouter au panier' : 'Rupture de stock';
        
        card.innerHTML = `
            <div class="product-image">
                ${product.image}
                ${badgeHTML}
            </div>
            <div class="product-info">
                <div class="product-category">${this.getCategoryName(product.category)}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${window.commonApp ? window.commonApp.formatPrice(product.price) : product.price + '€'}</div>
            </div>
            <div class="product-actions">
                <button class="btn btn-small ${stockClass}" 
                        onclick="productsPage.addToCart(${product.id})"
                        ${!product.inStock ? 'disabled' : ''}>
                    ${stockText}
                </button>
                <button class="btn btn-secondary btn-small" onclick="productsPage.viewProduct(${product.id})">
                    Voir détails
                </button>
            </div>
        `;

        return card;
    }

    // Obtenir le nom de la catégorie
    getCategoryName(category) {
        const categories = {
            'epices': 'Épices & Condiments',
            'rhums': 'Rhums & Spiritueux',
            'vanille': 'Vanille & Arômes',
            'artisanat': 'Artisanat Local'
        };
        return categories[category] || category;
    }

    // Ajouter au panier
    addToCart(productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (!product || !product.inStock) return;

        if (window.commonApp) {
            window.commonApp.addToCart(productId, 1);
            window.commonApp.showNotification(`${product.name} ajouté au panier !`, 'success');
        } else {
            console.log('Produit ajouté au panier:', product);
        }
    }

    // Voir les détails d'un produit
    viewProduct(productId) {
        window.location.href = `/produit/${productId}`;
    }

    // Changer de vue
    setView(view) {
        this.currentView = view;
        
        // Mettre à jour les boutons
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${view}-view`).classList.add('active');
        
        // Réafficher les produits
        this.displayProducts();
    }

    // Mettre à jour le compteur de résultats
    updateResultsCount() {
        const count = this.filteredProducts.length;
        const total = this.allProducts.length;
        const resultsText = count === total 
            ? `${count} produit${count > 1 ? 's' : ''}`
            : `${count} produit${count > 1 ? 's' : ''} sur ${total}`;
        
        document.getElementById('results-count').textContent = resultsText;
    }

    // Configuration de la pagination
    setupPagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        const paginationContainer = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Bouton précédent
        paginationHTML += `
            <button class="pagination-btn" 
                    onclick="productsPage.goToPage(${this.currentPage - 1})"
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                ← Précédent
            </button>
        `;
        
        // Numéros de pages
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}"
                            onclick="productsPage.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
        }
        
        // Bouton suivant
        paginationHTML += `
            <button class="pagination-btn" 
                    onclick="productsPage.goToPage(${this.currentPage + 1})"
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                Suivant →
            </button>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
    }

    // Aller à une page
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.displayProducts();
        this.setupPagination();
        this.updateURL();
        
        // Scroll vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Mettre à jour l'URL avec les filtres
    updateURL() {
        const params = new URLSearchParams();
        
        const search = document.getElementById('search-input').value;
        const category = document.getElementById('category-filter').value;
        const price = document.getElementById('price-filter').value;
        const sort = document.getElementById('sort-filter').value;
        
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (price) params.set('price', price);
        if (sort && sort !== 'name') params.set('sort', sort);
        if (this.currentPage > 1) params.set('page', this.currentPage);
        
        const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({}, '', newURL);
    }

    // Charger les filtres depuis l'URL
    loadFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.get('search')) {
            document.getElementById('search-input').value = params.get('search');
        }
        if (params.get('category')) {
            document.getElementById('category-filter').value = params.get('category');
        }
        if (params.get('price')) {
            document.getElementById('price-filter').value = params.get('price');
        }
        if (params.get('sort')) {
            document.getElementById('sort-filter').value = params.get('sort');
        }
        if (params.get('page')) {
            this.currentPage = parseInt(params.get('page'));
        }
        
        // Appliquer les filtres si des paramètres sont présents
        if (params.toString()) {
            this.handleSearch();
        }
    }

    // Utilitaire debounce
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

    // Obtenir les statistiques
    getStats() {
        return {
            totalProducts: this.allProducts.length,
            filteredProducts: this.filteredProducts.length,
            categories: [...new Set(this.allProducts.map(p => p.category))],
            priceRange: {
                min: Math.min(...this.allProducts.map(p => p.price)),
                max: Math.max(...this.allProducts.map(p => p.price))
            }
        };
    }
}

// Initialiser la page des produits
document.addEventListener('DOMContentLoaded', () => {
    const initProductsPage = () => {
        if (window.commonApp) {
            window.productsPage = new ProductsPage();
        } else {
            setTimeout(initProductsPage, 100);
        }
    };
    
    initProductsPage();
});