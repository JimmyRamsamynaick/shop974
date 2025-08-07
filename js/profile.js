class ProfilePage {
    constructor() {
        this.user = null;
        this.token = null;
        this.currentTab = 'personal';
        this.init();
    }

    async init() {
        // Vérifier l'authentification
        this.token = localStorage.getItem('authToken');
        if (!this.token) {
            window.location.href = '/connexion.html';
            return;
        }

        // Charger les données utilisateur
        await this.loadUserFromServer();
        
        // Initialiser l'interface
        this.bindEvents();
        this.loadUserData();
        this.loadTab('personal');
    }

    async loadUserFromServer() {
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.user = await response.json();
                localStorage.setItem('user', JSON.stringify(this.user));
            } else if (response.status === 401) {
                // Token invalide
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/connexion.html';
            } else {
                throw new Error('Erreur lors du chargement des données utilisateur');
            }
        } catch (error) {
            console.error('Erreur:', error);
            // Fallback sur les données locales
            const userData = localStorage.getItem('user');
            if (userData) {
                this.user = JSON.parse(userData);
            } else {
                window.location.href = '/connexion.html';
            }
        }
    }

    bindEvents() {
        // Navigation entre onglets
        document.querySelectorAll('.nav-link[data-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.dataset.tab;
                this.loadTab(tab);
            });
        });

        // Bouton de déconnexion
        document.querySelector('.logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Formulaires
        this.bindFormEvents();
    }

    loadTab(tabName) {
        // Mettre à jour la navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

        // Mettre à jour le contenu
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`)?.classList.add('active');

        this.currentTab = tabName;
    }

    logout() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/connexion.html';
        }
    }

    bindFormEvents() {
        // Formulaire informations personnelles
        const personalForm = document.getElementById('personal-form');
        personalForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updatePersonalInfo();
        });

        // Formulaire de changement de mot de passe
        const passwordForm = document.getElementById('password-form');
        passwordForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updatePassword();
        });

        // Formulaire de paramètres
        const settingsForm = document.getElementById('settings-form');
        settingsForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updateSettings();
        });
    }

    async updatePersonalInfo() {
        const formData = new FormData(document.getElementById('personal-form'));
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                this.user = updatedUser;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                this.showMessage('Informations mises à jour avec succès', 'success');
                this.loadUserData();
            } else {
                throw new Error('Erreur lors de la mise à jour');
            }
        } catch (error) {
            this.showMessage('Erreur lors de la mise à jour des informations', 'error');
        }
    }

    async updatePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            this.showMessage('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (response.ok) {
                this.showMessage('Mot de passe modifié avec succès', 'success');
                document.getElementById('password-form').reset();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors du changement de mot de passe');
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async updateSettings() {
        const formData = new FormData(document.getElementById('settings-form'));
        const settings = {
            emailNotifications: formData.get('email-notifications') === 'on',
            newsletter: formData.get('newsletter-setting') === 'on'
        };

        try {
            const response = await fetch('/api/auth/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                this.showMessage('Paramètres mis à jour avec succès', 'success');
            } else {
                throw new Error('Erreur lors de la mise à jour des paramètres');
            }
        } catch (error) {
            this.showMessage('Erreur lors de la mise à jour des paramètres', 'error');
        }
    }

    loadUserData() {
        // Charger les données utilisateur dans l'interface
        const fullName = `${this.user.firstName} ${this.user.lastName}`;
        
        // Mettre à jour le nom et email dans la sidebar
        document.getElementById('user-name').textContent = fullName;
        document.getElementById('user-email').textContent = this.user.email;
        
        // Mettre à jour les initiales dans l'avatar
        const initials = `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase();
        document.getElementById('user-initials').textContent = initials;

        // Remplir le formulaire personnel
        this.fillPersonalForm();
        
        // Statut email vérifié
        const emailVerified = document.getElementById('email-verified');
        if (this.user.isEmailVerified) {
            emailVerified.textContent = '✅ Vérifié';
            emailVerified.className = 'security-status verified';
        } else {
            emailVerified.textContent = '⏳ En attente';
            emailVerified.className = 'security-status pending';
        }

        // Charger les paramètres de notification
        this.loadNotificationSettings();
    }

    fillPersonalForm() {
        // Remplir le formulaire avec les données utilisateur
        document.getElementById('firstName').value = this.user.firstName || '';
        document.getElementById('lastName').value = this.user.lastName || '';
        document.getElementById('email').value = this.user.email || '';
        document.getElementById('phone').value = this.user.phone || '';
        document.getElementById('newsletter').checked = this.user.newsletter || false;
    }

    loadNotificationSettings() {
        // Charger les paramètres de notification
        document.getElementById('email-notifications').checked = true;
        document.getElementById('newsletter-setting').checked = this.user.newsletter || false;
    }

    showMessage(message, type) {
        // Créer et afficher un message de notification
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 1000;
            background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Initialiser la page de profil
document.addEventListener('DOMContentLoaded', () => {
    new ProfilePage();
});