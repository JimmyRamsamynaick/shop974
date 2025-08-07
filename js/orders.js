/**
 * Orders Page JavaScript
 * Gère les fonctionnalités de la page des commandes
 */

class OrdersPage {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.currentPage = 1;
        this.ordersPerPage = 10;
        this.filters = {
            search: '',
            status: '',
            period: '',
            amount: ''
        };
        this.sortBy = 'date-desc';
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        
        this.init();
    }

    init() {
        // Vérifier si l'utilisateur est connecté
        if (!this.user) {
            window.location.href = 'login.html';
            return;
        }

        this.loadOrders();
        this.bindEvents();
        this.updateStats();
    }

    bindEvents() {
        // Recherche
        const searchInput = document.getElementById('orderSearch');
        searchInput?.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));

        // Filtres
        const filterToggle = document.getElementById('filterToggle');
        const filterMenu = document.getElementById('filterMenu');
        
        filterToggle?.addEventListener('click', () => {
            filterMenu.classList.toggle('active');
            filterToggle.classList.toggle('active');
        });

        // Fermer le menu de filtres en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-dropdown')) {
                filterMenu?.classList.remove('active');
                filterToggle?.classList.remove('active');
            }
        });

        // Boutons de filtre
        document.getElementById('applyFilters')?.addEventListener('click', this.applyFilters.bind(this));
        document.getElementById('clearFilters')?.addEventListener('click', this.clearFilters.bind(this));

        // Tri
        const sortSelect = document.getElementById('sortOrders');
        sortSelect?.addEventListener('change', this.handleSort.bind(this));

        // Modales
        this.bindModalEvents();

        // Actions des commandes (délégation d'événements)
        document.addEventListener('click', this.handleOrderAction.bind(this));
    }

    bindModalEvents() {
        // Modal détails commande
        const closeOrderModal = document.getElementById('closeOrderModal');
        closeOrderModal?.addEventListener('click', () => this.closeModal('orderDetailsModal'));

        // Modal suivi
        const closeTrackingModal = document.getElementById('closeTrackingModal');
        closeTrackingModal?.addEventListener('click', () => this.closeModal('trackingModal'));

        // Modal retour
        const closeReturnModal = document.getElementById('closeReturnModal');
        const cancelReturn = document.getElementById('cancelReturn');
        const returnForm = document.getElementById('returnForm');

        closeReturnModal?.addEventListener('click', () => this.closeModal('returnModal'));
        cancelReturn?.addEventListener('click', () => this.closeModal('returnModal'));
        returnForm?.addEventListener('submit', this.handleReturnSubmit.bind(this));

        // Fermer modales en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    loadOrders() {
        // Simuler le chargement des commandes
        this.showLoading();
        
        setTimeout(() => {
            this.orders = this.generateSampleOrders();
            this.filteredOrders = [...this.orders];
            this.sortOrders();
            this.renderOrders();
            this.updateStats();
            this.hideLoading();
        }, 1000);
    }

    generateSampleOrders() {
        const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
        const products = [
            { name: 'iPhone 14 Pro', price: 1199, image: 'https://via.placeholder.com/60x60' },
            { name: 'MacBook Air M2', price: 1299, image: 'https://via.placeholder.com/60x60' },
            { name: 'AirPods Pro', price: 279, image: 'https://via.placeholder.com/60x60' },
            { name: 'iPad Air', price: 649, image: 'https://via.placeholder.com/60x60' },
            { name: 'Apple Watch Series 8', price: 429, image: 'https://via.placeholder.com/60x60' },
            { name: 'Samsung Galaxy S23', price: 899, image: 'https://via.placeholder.com/60x60' },
            { name: 'Sony WH-1000XM4', price: 349, image: 'https://via.placeholder.com/60x60' },
            { name: 'Nintendo Switch', price: 299, image: 'https://via.placeholder.com/60x60' }
        ];

        const orders = [];
        
        for (let i = 1; i <= 25; i++) {
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 365));
            
            const numItems = Math.floor(Math.random() * 3) + 1;
            const orderItems = [];
            let total = 0;
            
            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                const itemTotal = product.price * quantity;
                
                orderItems.push({
                    id: `item-${i}-${j}`,
                    name: product.name,
                    price: product.price,
                    quantity: quantity,
                    total: itemTotal,
                    image: product.image,
                    variant: j % 2 === 0 ? 'Noir, 128GB' : 'Blanc, 256GB'
                });
                
                total += itemTotal;
            }
            
            const shipping = total > 100 ? 0 : 9.99;
            const tax = total * 0.2;
            const finalTotal = total + shipping + tax;
            
            orders.push({
                id: `ORD-${String(i).padStart(6, '0')}`,
                number: `#${String(i).padStart(6, '0')}`,
                date: orderDate,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                items: orderItems,
                subtotal: total,
                shipping: shipping,
                tax: tax,
                total: finalTotal,
                shippingAddress: {
                    name: `${this.user.firstName} ${this.user.lastName}`,
                    street: '123 Rue de la République',
                    city: 'Saint-Denis',
                    postalCode: '97400',
                    country: 'La Réunion'
                },
                billingAddress: {
                    name: `${this.user.firstName} ${this.user.lastName}`,
                    street: '123 Rue de la République',
                    city: 'Saint-Denis',
                    postalCode: '97400',
                    country: 'La Réunion'
                },
                paymentMethod: 'Carte bancaire ****1234',
                trackingNumber: i % 3 === 0 ? `TRK${String(Math.floor(Math.random() * 1000000)).padStart(8, '0')}` : null
            });
        }
        
        return orders.sort((a, b) => b.date - a.date);
    }

    handleSearch(e) {
        this.filters.search = e.target.value.toLowerCase();
        this.applyFiltersAndSort();
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const periodFilter = document.getElementById('periodFilter');
        const amountFilter = document.getElementById('amountFilter');

        this.filters.status = statusFilter?.value || '';
        this.filters.period = periodFilter?.value || '';
        this.filters.amount = amountFilter?.value || '';

        this.applyFiltersAndSort();
        
        // Fermer le menu de filtres
        const filterMenu = document.getElementById('filterMenu');
        const filterToggle = document.getElementById('filterToggle');
        filterMenu?.classList.remove('active');
        filterToggle?.classList.remove('active');
    }

    clearFilters() {
        this.filters = {
            search: '',
            status: '',
            period: '',
            amount: ''
        };

        // Réinitialiser les champs
        document.getElementById('orderSearch').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('periodFilter').value = '';
        document.getElementById('amountFilter').value = '';

        this.applyFiltersAndSort();
    }

    applyFiltersAndSort() {
        this.filteredOrders = this.orders.filter(order => {
            // Filtre de recherche
            if (this.filters.search) {
                const searchTerm = this.filters.search;
                const matchesSearch = 
                    order.number.toLowerCase().includes(searchTerm) ||
                    order.items.some(item => item.name.toLowerCase().includes(searchTerm));
                
                if (!matchesSearch) return false;
            }

            // Filtre de statut
            if (this.filters.status && order.status !== this.filters.status) {
                return false;
            }

            // Filtre de période
            if (this.filters.period) {
                const now = new Date();
                const orderDate = new Date(order.date);
                
                switch (this.filters.period) {
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (orderDate < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                        if (orderDate < monthAgo) return false;
                        break;
                    case 'quarter':
                        const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                        if (orderDate < quarterAgo) return false;
                        break;
                    case 'year':
                        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                        if (orderDate < yearAgo) return false;
                        break;
                }
            }

            // Filtre de montant
            if (this.filters.amount) {
                const total = order.total;
                switch (this.filters.amount) {
                    case '0-50':
                        if (total < 0 || total > 50) return false;
                        break;
                    case '50-100':
                        if (total < 50 || total > 100) return false;
                        break;
                    case '100-200':
                        if (total < 100 || total > 200) return false;
                        break;
                    case '200+':
                        if (total < 200) return false;
                        break;
                }
            }

            return true;
        });

        this.sortOrders();
        this.currentPage = 1;
        this.renderOrders();
        this.updateStats();
    }

    handleSort(e) {
        this.sortBy = e.target.value;
        this.sortOrders();
        this.renderOrders();
    }

    sortOrders() {
        this.filteredOrders.sort((a, b) => {
            switch (this.sortBy) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'amount-desc':
                    return b.total - a.total;
                case 'amount-asc':
                    return a.total - b.total;
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });
    }

    renderOrders() {
        const ordersList = document.getElementById('ordersList');
        const ordersEmpty = document.getElementById('ordersEmpty');
        const paginationContainer = document.getElementById('paginationContainer');

        if (this.filteredOrders.length === 0) {
            ordersList.style.display = 'none';
            ordersEmpty.style.display = 'block';
            paginationContainer.style.display = 'none';
            return;
        }

        ordersEmpty.style.display = 'none';
        ordersList.style.display = 'block';

        // Pagination
        const startIndex = (this.currentPage - 1) * this.ordersPerPage;
        const endIndex = startIndex + this.ordersPerPage;
        const ordersToShow = this.filteredOrders.slice(startIndex, endIndex);

        // Générer le HTML des commandes
        ordersList.innerHTML = ordersToShow.map(order => this.generateOrderHTML(order)).join('');

        // Mettre à jour la pagination
        this.updatePagination();
    }

    generateOrderHTML(order) {
        const statusText = this.getStatusText(order.status);
        const canCancel = ['pending', 'confirmed'].includes(order.status);
        const canReturn = ['delivered'].includes(order.status);
        const canTrack = ['processing', 'shipped'].includes(order.status) && order.trackingNumber;

        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-number">${order.number}</div>
                        <div class="order-date">${this.formatDate(order.date)}</div>
                    </div>
                    <div class="order-status">
                        <div class="status-badge ${order.status}">${statusText}</div>
                        <div class="order-total">${this.formatPrice(order.total)}</div>
                    </div>
                </div>
                
                <div class="order-body">
                    <div class="order-items">
                        ${order.items.slice(0, 3).map(item => `
                            <div class="order-item">
                                <img src="${item.image}" alt="${item.name}" class="item-image">
                                <div class="item-details">
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-variant">${item.variant}</div>
                                    <div class="item-quantity">Quantité: ${item.quantity}</div>
                                </div>
                                <div class="item-price">${this.formatPrice(item.total)}</div>
                            </div>
                        `).join('')}
                        ${order.items.length > 3 ? `
                            <div class="order-item">
                                <div class="item-details">
                                    <div class="item-name">+${order.items.length - 3} autre(s) article(s)</div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="order-actions">
                        <button class="order-action" data-action="view-details" data-order-id="${order.id}">
                            <i class="fas fa-eye"></i>
                            Voir détails
                        </button>
                        
                        ${canTrack ? `
                            <button class="order-action primary" data-action="track" data-order-id="${order.id}">
                                <i class="fas fa-truck"></i>
                                Suivre
                            </button>
                        ` : ''}
                        
                        <button class="order-action" data-action="download-invoice" data-order-id="${order.id}">
                            <i class="fas fa-download"></i>
                            Facture
                        </button>
                        
                        ${canReturn ? `
                            <button class="order-action" data-action="return" data-order-id="${order.id}">
                                <i class="fas fa-undo"></i>
                                Retourner
                            </button>
                        ` : ''}
                        
                        ${canCancel ? `
                            <button class="order-action danger" data-action="cancel" data-order-id="${order.id}">
                                <i class="fas fa-times"></i>
                                Annuler
                            </button>
                        ` : ''}
                        
                        <button class="order-action" data-action="reorder" data-order-id="${order.id}">
                            <i class="fas fa-redo"></i>
                            Recommander
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    handleOrderAction(e) {
        const actionButton = e.target.closest('[data-action]');
        if (!actionButton) return;

        const action = actionButton.dataset.action;
        const orderId = actionButton.dataset.orderId;
        const order = this.orders.find(o => o.id === orderId);

        if (!order) return;

        switch (action) {
            case 'view-details':
                this.showOrderDetails(order);
                break;
            case 'track':
                this.showTracking(order);
                break;
            case 'download-invoice':
                this.downloadInvoice(order);
                break;
            case 'return':
                this.showReturnModal(order);
                break;
            case 'cancel':
                this.cancelOrder(order);
                break;
            case 'reorder':
                this.reorder(order);
                break;
        }
    }

    showOrderDetails(order) {
        const modal = document.getElementById('orderDetailsModal');
        const modalTitle = document.getElementById('orderModalTitle');
        const modalBody = document.getElementById('orderModalBody');

        modalTitle.textContent = `Commande ${order.number}`;
        modalBody.innerHTML = this.generateOrderDetailsHTML(order);

        this.openModal('orderDetailsModal');
    }

    generateOrderDetailsHTML(order) {
        return `
            <div class="order-details">
                <div class="detail-section">
                    <h4>Informations générales</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">Numéro de commande</div>
                            <div class="detail-value">${order.number}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Date de commande</div>
                            <div class="detail-value">${this.formatDate(order.date)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Statut</div>
                            <div class="detail-value">
                                <span class="status-badge ${order.status}">${this.getStatusText(order.status)}</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Mode de paiement</div>
                            <div class="detail-value">${order.paymentMethod}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Articles commandés</h4>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <img src="${item.image}" alt="${item.name}" class="item-image">
                                <div class="item-details">
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-variant">${item.variant}</div>
                                    <div class="item-quantity">Quantité: ${item.quantity}</div>
                                </div>
                                <div class="item-price">${this.formatPrice(item.total)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Récapitulatif</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">Sous-total</div>
                            <div class="detail-value">${this.formatPrice(order.subtotal)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Livraison</div>
                            <div class="detail-value">${order.shipping === 0 ? 'Gratuite' : this.formatPrice(order.shipping)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">TVA</div>
                            <div class="detail-value">${this.formatPrice(order.tax)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label"><strong>Total</strong></div>
                            <div class="detail-value"><strong>${this.formatPrice(order.total)}</strong></div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Adresses</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">Adresse de livraison</div>
                            <div class="detail-value">
                                ${order.shippingAddress.name}<br>
                                ${order.shippingAddress.street}<br>
                                ${order.shippingAddress.postalCode} ${order.shippingAddress.city}<br>
                                ${order.shippingAddress.country}
                            </div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Adresse de facturation</div>
                            <div class="detail-value">
                                ${order.billingAddress.name}<br>
                                ${order.billingAddress.street}<br>
                                ${order.billingAddress.postalCode} ${order.billingAddress.city}<br>
                                ${order.billingAddress.country}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showTracking(order) {
        const modal = document.getElementById('trackingModal');
        const modalBody = document.getElementById('trackingModalBody');

        modalBody.innerHTML = this.generateTrackingHTML(order);
        this.openModal('trackingModal');
    }

    generateTrackingHTML(order) {
        const trackingSteps = this.generateTrackingSteps(order);
        
        return `
            <div class="tracking-info">
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Numéro de suivi</div>
                        <div class="detail-value">${order.trackingNumber}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Transporteur</div>
                        <div class="detail-value">Colissimo</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Statut actuel</div>
                        <div class="detail-value">
                            <span class="status-badge ${order.status}">${this.getStatusText(order.status)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tracking-timeline">
                ${trackingSteps.map(step => `
                    <div class="tracking-step ${step.status}">
                        <div class="tracking-content">
                            <div class="tracking-title">${step.title}</div>
                            <div class="tracking-description">${step.description}</div>
                            <div class="tracking-date">${step.date}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateTrackingSteps(order) {
        const steps = [
            {
                title: 'Commande confirmée',
                description: 'Votre commande a été confirmée et est en cours de préparation',
                date: this.formatDate(order.date),
                status: 'completed'
            },
            {
                title: 'En préparation',
                description: 'Votre commande est en cours de préparation dans notre entrepôt',
                date: this.formatDate(new Date(order.date.getTime() + 24 * 60 * 60 * 1000)),
                status: order.status === 'processing' ? 'current' : 'completed'
            },
            {
                title: 'Expédiée',
                description: 'Votre commande a été expédiée et est en route',
                date: order.status === 'shipped' || order.status === 'delivered' ? 
                      this.formatDate(new Date(order.date.getTime() + 48 * 60 * 60 * 1000)) : '',
                status: order.status === 'shipped' ? 'current' : 
                        order.status === 'delivered' ? 'completed' : 'pending'
            },
            {
                title: 'Livrée',
                description: 'Votre commande a été livrée avec succès',
                date: order.status === 'delivered' ? 
                      this.formatDate(new Date(order.date.getTime() + 72 * 60 * 60 * 1000)) : '',
                status: order.status === 'delivered' ? 'current' : 'pending'
            }
        ];

        return steps;
    }

    showReturnModal(order) {
        const modal = document.getElementById('returnModal');
        
        // Stocker l'ID de la commande pour le traitement
        modal.dataset.orderId = order.id;
        
        this.openModal('returnModal');
    }

    handleReturnSubmit(e) {
        e.preventDefault();
        
        const modal = document.getElementById('returnModal');
        const orderId = modal.dataset.orderId;
        const order = this.orders.find(o => o.id === orderId);
        
        if (!order) return;

        const formData = new FormData(e.target);
        const returnData = {
            orderId: orderId,
            reason: formData.get('returnReason'),
            description: formData.get('returnDescription'),
            photos: formData.getAll('returnPhotos')
        };

        // Validation
        if (!returnData.reason || !returnData.description.trim()) {
            this.showNotification('Veuillez remplir tous les champs requis', 'error');
            return;
        }

        // Simuler l'envoi de la demande
        this.showNotification('Demande de retour envoyée avec succès', 'success');
        
        // Mettre à jour le statut de la commande
        order.status = 'returned';
        this.renderOrders();
        this.updateStats();
        
        this.closeModal('returnModal');
        e.target.reset();
    }

    cancelOrder(order) {
        if (confirm(`Êtes-vous sûr de vouloir annuler la commande ${order.number} ?`)) {
            order.status = 'cancelled';
            this.renderOrders();
            this.updateStats();
            this.showNotification('Commande annulée avec succès', 'success');
        }
    }

    reorder(order) {
        // Ajouter tous les articles au panier
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        order.items.forEach(item => {
            const existingItem = cart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                cart.push({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    variant: item.variant
                });
            }
        });

        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Mettre à jour le compteur du panier
        if (window.shop974) {
            window.shop974.updateCartCount();
        }
        
        this.showNotification('Articles ajoutés au panier', 'success');
    }

    downloadInvoice(order) {
        // Simuler le téléchargement de facture
        this.showNotification('Téléchargement de la facture...', 'info');
        
        // En production, cela ferait une requête au serveur pour générer/télécharger la facture
        setTimeout(() => {
            this.showNotification('Facture téléchargée', 'success');
        }, 1000);
    }

    updateStats() {
        const totalOrders = this.orders.length;
        const totalSpent = this.orders.reduce((sum, order) => sum + order.total, 0);
        const pendingOrders = this.orders.filter(order => 
            ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
        ).length;

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalSpent').textContent = this.formatPrice(totalSpent);
        document.getElementById('pendingOrders').textContent = pendingOrders;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredOrders.length / this.ordersPerPage);
        const paginationContainer = document.getElementById('paginationContainer');
        const paginationInfo = document.getElementById('paginationInfo');
        const pagination = document.getElementById('pagination');

        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';

        // Info de pagination
        const startItem = (this.currentPage - 1) * this.ordersPerPage + 1;
        const endItem = Math.min(this.currentPage * this.ordersPerPage, this.filteredOrders.length);
        paginationInfo.textContent = `Affichage de ${startItem}-${endItem} sur ${this.filteredOrders.length} commandes`;

        // Boutons de pagination
        let paginationHTML = '';
        
        // Bouton précédent
        paginationHTML += `
            <button ${this.currentPage === 1 ? 'disabled' : ''} onclick="ordersPage.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Numéros de page
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<button onclick="ordersPage.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span>...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button ${i === this.currentPage ? 'class="active"' : ''} onclick="ordersPage.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span>...</span>`;
            }
            paginationHTML += `<button onclick="ordersPage.goToPage(${totalPages})">${totalPages}</button>`;
        }

        // Bouton suivant
        paginationHTML += `
            <button ${this.currentPage === totalPages ? 'disabled' : ''} onclick="ordersPage.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderOrders();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    showLoading() {
        document.getElementById('ordersLoading').style.display = 'flex';
        document.getElementById('ordersList').style.display = 'none';
        document.getElementById('ordersEmpty').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('ordersLoading').style.display = 'none';
    }

    getStatusText(status) {
        const statusTexts = {
            pending: 'En attente',
            confirmed: 'Confirmée',
            processing: 'En préparation',
            shipped: 'Expédiée',
            delivered: 'Livrée',
            cancelled: 'Annulée',
            returned: 'Retournée'
        };
        return statusTexts[status] || status;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
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

    showNotification(message, type = 'info') {
        if (window.shop974) {
            window.shop974.showNotification(message, type);
        } else {
            // Fallback
            alert(message);
        }
    }
}

// Utilitaires pour les commandes
class OrderUtils {
    static exportOrders() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const exportData = {
            orders: orders.map(order => ({
                ...order,
                // Exclure les données sensibles si nécessaire
            })),
            exportDate: new Date().toISOString(),
            totalOrders: orders.length,
            totalAmount: orders.reduce((sum, order) => sum + order.total, 0)
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'commandes-shop974.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    static printOrder(orderId) {
        const order = ordersPage.orders.find(o => o.id === orderId);
        if (!order) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Commande ${order.number}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .order-info { margin-bottom: 20px; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .items-table th { background-color: #f2f2f2; }
                    .total { text-align: right; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Shop 974</h1>
                    <h2>Commande ${order.number}</h2>
                </div>
                
                <div class="order-info">
                    <p><strong>Date:</strong> ${ordersPage.formatDate(order.date)}</p>
                    <p><strong>Statut:</strong> ${ordersPage.getStatusText(order.status)}</p>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Article</th>
                            <th>Quantité</th>
                            <th>Prix unitaire</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>${ordersPage.formatPrice(item.price)}</td>
                                <td>${ordersPage.formatPrice(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="total">
                    <p>Sous-total: ${ordersPage.formatPrice(order.subtotal)}</p>
                    <p>Livraison: ${order.shipping === 0 ? 'Gratuite' : ordersPage.formatPrice(order.shipping)}</p>
                    <p>TVA: ${ordersPage.formatPrice(order.tax)}</p>
                    <p><strong>Total: ${ordersPage.formatPrice(order.total)}</strong></p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.ordersPage = new OrdersPage();
});

// Export pour utilisation globale
window.OrderUtils = OrderUtils;