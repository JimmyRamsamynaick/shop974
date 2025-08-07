// Page de commande - Logique JavaScript

class CheckoutPage {
    constructor() {
        this.currentStep = 1;
        this.orderData = null;
        this.formData = {
            personal: {},
            shipping: {},
            payment: {}
        };
        
        this.init();
    }

    init() {
        this.loadOrderData();
        this.setupEventListeners();
        this.renderOrderSummary();
        this.updateStepDisplay();
    }

    // Charger les données de commande depuis le localStorage
    loadOrderData() {
        const savedData = localStorage.getItem('checkout_data');
        if (!savedData) {
            this.showNotification('Aucune donnée de commande trouvée', 'error');
            setTimeout(() => {
                window.location.href = '/panier.html';
            }, 2000);
            return;
        }

        this.orderData = JSON.parse(savedData);
        console.log('Données de commande chargées:', this.orderData);
    }

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        // Gestion des options de livraison
        document.querySelectorAll('input[name="shipping"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateShippingCost();
            });
        });

        // Gestion des méthodes de paiement
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.togglePaymentForm();
            });
        });

        // Formatage automatique des champs de carte
        this.setupCardFormatting();
    }

    // Configurer le formatage automatique des champs de carte
    setupCardFormatting() {
        const cardNumberInput = document.getElementById('cardNumber');
        const expiryInput = document.getElementById('expiryDate');
        const cvvInput = document.getElementById('cvv');

        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }

        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }
    }

    // Rendre le résumé de commande
    renderOrderSummary() {
        if (!this.orderData) return;

        // Afficher les articles
        const itemsContainer = document.getElementById('checkout-items');
        itemsContainer.innerHTML = '';

        this.orderData.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="checkout-item-details">
                    <h5>${item.name}</h5>
                    <p>Quantité: ${item.quantity}</p>
                </div>
                <div class="checkout-item-price">${this.formatPrice(item.price * item.quantity)}</div>
            `;
            itemsContainer.appendChild(itemElement);
        });

        // Mettre à jour les totaux
        this.updateOrderTotals();
    }

    // Mettre à jour les totaux de commande
    updateOrderTotals() {
        if (!this.orderData) return;

        const itemsCount = this.orderData.items.reduce((total, item) => total + item.quantity, 0);
        
        document.getElementById('checkout-items-count').textContent = itemsCount;
        document.getElementById('checkout-subtotal').textContent = this.formatPrice(this.orderData.subtotal);
        document.getElementById('checkout-shipping').textContent = 
            this.orderData.shippingCost === 0 ? 'Gratuite' : this.formatPrice(this.orderData.shippingCost);
        document.getElementById('checkout-total').textContent = this.formatPrice(this.orderData.total);

        // Afficher/masquer la ligne de réduction
        const discountLine = document.getElementById('checkout-discount-line');
        if (this.orderData.discountAmount > 0) {
            discountLine.style.display = 'flex';
            document.getElementById('checkout-discount').textContent = `-${this.formatPrice(this.orderData.discountAmount)}`;
        } else {
            discountLine.style.display = 'none';
        }
    }

    // Mettre à jour les coûts de livraison
    updateShippingCost() {
        const selectedShipping = document.querySelector('input[name="shipping"]:checked');
        if (!selectedShipping) return;

        let shippingCost = 0;
        switch (selectedShipping.value) {
            case 'standard':
                shippingCost = 5.99;
                break;
            case 'express':
                shippingCost = 9.99;
                break;
            case 'pickup':
                shippingCost = 0;
                break;
        }

        // Mettre à jour les données de commande
        this.orderData.shippingCost = shippingCost;
        this.orderData.total = this.orderData.subtotal + shippingCost - this.orderData.discountAmount;

        // Mettre à jour l'affichage
        this.updateOrderTotals();
    }

    // Basculer l'affichage du formulaire de paiement
    togglePaymentForm() {
        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        const cardForm = document.getElementById('card-form');

        if (selectedPayment && selectedPayment.value === 'card') {
            cardForm.style.display = 'block';
        } else {
            cardForm.style.display = 'none';
        }
    }

    // Passer à l'étape suivante
    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            this.currentStep++;
            
            if (this.currentStep > 4) {
                this.processOrder();
                return;
            }
            
            this.updateStepDisplay();
        }
    }

    // Revenir à l'étape précédente
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    // Valider l'étape actuelle
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validatePersonalInfo();
            case 2:
                return this.validateShippingInfo();
            case 3:
                return this.validatePaymentInfo();
            default:
                return true;
        }
    }

    // Valider les informations personnelles
    validatePersonalInfo() {
        const form = document.getElementById('personal-info-form');
        const formData = new FormData(form);
        
        const required = ['firstName', 'lastName', 'email', 'phone'];
        for (let field of required) {
            if (!formData.get(field)) {
                this.showNotification(`Le champ ${this.getFieldLabel(field)} est requis`, 'error');
                return false;
            }
        }

        // Validation email
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Veuillez saisir un email valide', 'error');
            return false;
        }

        return true;
    }

    // Valider les informations de livraison
    validateShippingInfo() {
        const form = document.getElementById('shipping-form');
        const formData = new FormData(form);
        
        const required = ['address', 'city', 'postalCode', 'country'];
        for (let field of required) {
            if (!formData.get(field)) {
                this.showNotification(`Le champ ${this.getFieldLabel(field)} est requis`, 'error');
                return false;
            }
        }

        return true;
    }

    // Valider les informations de paiement
    validatePaymentInfo() {
        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        
        if (!selectedPayment) {
            this.showNotification('Veuillez sélectionner une méthode de paiement', 'error');
            return false;
        }

        // Validation spécifique pour carte bancaire
        if (selectedPayment.value === 'card') {
            const cardNumber = document.getElementById('cardNumber').value;
            const expiryDate = document.getElementById('expiryDate').value;
            const cvv = document.getElementById('cvv').value;
            const cardName = document.getElementById('cardName').value;

            if (!cardNumber || !expiryDate || !cvv || !cardName) {
                this.showNotification('Veuillez remplir tous les champs de la carte', 'error');
                return false;
            }

            // Validation basique du numéro de carte
            const cleanCardNumber = cardNumber.replace(/\s/g, '');
            if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
                this.showNotification('Numéro de carte invalide', 'error');
                return false;
            }

            // Validation date d'expiration
            const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!expiryRegex.test(expiryDate)) {
                this.showNotification('Date d\'expiration invalide (MM/AA)', 'error');
                return false;
            }

            // Validation CVV
            if (cvv.length < 3 || cvv.length > 4) {
                this.showNotification('CVV invalide', 'error');
                return false;
            }
        }

        return true;
    }

    // Sauvegarder les données de l'étape actuelle
    saveCurrentStepData() {
        switch (this.currentStep) {
            case 1:
                const personalForm = document.getElementById('personal-info-form');
                this.formData.personal = Object.fromEntries(new FormData(personalForm));
                break;
            case 2:
                const shippingForm = document.getElementById('shipping-form');
                this.formData.shipping = Object.fromEntries(new FormData(shippingForm));
                break;
            case 3:
                const paymentForm = document.getElementById('payment-form');
                this.formData.payment = Object.fromEntries(new FormData(paymentForm));
                break;
        }
    }

    // Mettre à jour l'affichage des étapes
    updateStepDisplay() {
        // Mettre à jour les indicateurs d'étapes
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index + 1 <= this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Afficher/masquer les sections
        document.querySelectorAll('.checkout-step').forEach((step, index) => {
            if (index + 1 === this.currentStep) {
                step.classList.remove('hidden');
            } else {
                step.classList.add('hidden');
            }
        });
    }

    // Traiter la commande finale
    processOrder() {
        this.showNotification('Traitement de votre commande...', 'info');
        
        // Simuler le traitement de la commande
        setTimeout(() => {
            const orderNumber = this.generateOrderNumber();
            
            // Afficher la confirmation
            document.getElementById('order-number').textContent = orderNumber;
            this.renderFinalOrderSummary();
            
            // Vider le panier
            localStorage.removeItem('cart');
            localStorage.removeItem('checkout_data');
            
            // Sauvegarder la commande
            this.saveOrder(orderNumber);
            
            this.showNotification('Commande confirmée avec succès !', 'success');
            
            // Mettre à jour l'affichage
            this.currentStep = 4;
            this.updateStepDisplay();
            
        }, 2000);
    }

    // Générer un numéro de commande
    generateOrderNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `CMD${timestamp}${random}`.slice(-12);
    }

    // Rendre le résumé final de commande
    renderFinalOrderSummary() {
        const container = document.getElementById('final-order-summary');
        
        container.innerHTML = `
            <div class="order-items">
                ${this.orderData.items.map(item => `
                    <div class="checkout-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="checkout-item-details">
                            <h5>${item.name}</h5>
                            <p>Quantité: ${item.quantity}</p>
                        </div>
                        <div class="checkout-item-price">${this.formatPrice(item.price * item.quantity)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="order-totals">
                <div class="total-line">
                    <span>Sous-total</span>
                    <span>${this.formatPrice(this.orderData.subtotal)}</span>
                </div>
                ${this.orderData.discountAmount > 0 ? `
                    <div class="total-line">
                        <span>Réduction</span>
                        <span class="discount">-${this.formatPrice(this.orderData.discountAmount)}</span>
                    </div>
                ` : ''}
                <div class="total-line">
                    <span>Livraison</span>
                    <span>${this.orderData.shippingCost === 0 ? 'Gratuite' : this.formatPrice(this.orderData.shippingCost)}</span>
                </div>
                <div class="total-line total">
                    <span><strong>Total</strong></span>
                    <span><strong>${this.formatPrice(this.orderData.total)}</strong></span>
                </div>
            </div>
        `;
    }

    // Sauvegarder la commande
    saveOrder(orderNumber) {
        const order = {
            orderNumber,
            ...this.formData,
            items: this.orderData.items,
            totals: {
                subtotal: this.orderData.subtotal,
                shipping: this.orderData.shippingCost,
                discount: this.orderData.discountAmount,
                total: this.orderData.total
            },
            date: new Date().toISOString(),
            status: 'confirmed'
        };

        // Sauvegarder dans localStorage (en réalité, on enverrait au serveur)
        const orders = JSON.parse(localStorage.getItem('user_orders') || '[]');
        orders.push(order);
        localStorage.setItem('user_orders', JSON.stringify(orders));
        
        console.log('Commande sauvegardée:', order);
    }

    // Obtenir le libellé d'un champ
    getFieldLabel(field) {
        const labels = {
            firstName: 'Prénom',
            lastName: 'Nom',
            email: 'Email',
            phone: 'Téléphone',
            address: 'Adresse',
            city: 'Ville',
            postalCode: 'Code postal',
            country: 'Pays'
        };
        return labels[field] || field;
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        const container = document.getElementById('checkout-notifications');
        
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
}

// Initialiser la page de commande
document.addEventListener('DOMContentLoaded', () => {
    const initCheckoutPage = () => {
        if (window.commonApp) {
            window.checkoutPage = new CheckoutPage();
        } else {
            setTimeout(initCheckoutPage, 100);
        }
    };
    
    initCheckoutPage();
});

// Gestion de la fermeture avec Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Fermer les notifications ou autres éléments modaux si nécessaire
    }
});