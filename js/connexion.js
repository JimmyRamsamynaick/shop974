// JavaScript spécifique à la page connexion

class AuthPage {
    constructor() {
        this.currentTab = 'login';
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordToggles();
        this.setupPasswordStrength();
        this.setupFormValidation();
    }

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        // Onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Formulaires
        document.getElementById('login-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('register-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Boutons sociaux
        document.querySelectorAll('.btn-social').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSocialLogin(btn.classList.contains('btn-google') ? 'google' : 'facebook');
            });
        });

        // Mot de passe oublié
        document.querySelector('.forgot-password').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });
    }

    // Basculer entre les onglets
    switchTab(tab) {
        if (this.isLoading) return;
        
        this.currentTab = tab;
        
        // Mettre à jour les onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Mettre à jour les formulaires
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tab}-form`);
        });
        
        // Effacer les messages
        this.clearMessages();
    }

    // Configuration des boutons de basculement de mot de passe
    setupPasswordToggles() {
        document.querySelectorAll('.password-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const input = document.getElementById(targetId);
                
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.textContent = '🙈';
                } else {
                    input.type = 'password';
                    btn.textContent = '👁️';
                }
            });
        });
    }

    // Configuration de l'indicateur de force du mot de passe
    setupPasswordStrength() {
        const passwordInput = document.getElementById('register-password');
        const strengthIndicator = document.getElementById('password-strength');
        
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strength = this.calculatePasswordStrength(password);
            
            strengthIndicator.className = 'password-strength';
            if (password.length > 0) {
                strengthIndicator.classList.add(strength);
            }
        });
    }

    // Calculer la force du mot de passe
    calculatePasswordStrength(password) {
        let score = 0;
        
        // Longueur
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Caractères
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score <= 2) return 'weak';
        if (score <= 4) return 'medium';
        return 'strong';
    }

    // Configuration de la validation des formulaires
    setupFormValidation() {
        // Validation en temps réel
        document.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('invalid')) {
                    this.validateField(input);
                }
            });
        });

        // Validation de la confirmation de mot de passe
        const confirmPassword = document.getElementById('register-confirm-password');
        const password = document.getElementById('register-password');
        
        confirmPassword.addEventListener('input', () => {
            this.validatePasswordConfirmation(password, confirmPassword);
        });
        
        password.addEventListener('input', () => {
            if (confirmPassword.value) {
                this.validatePasswordConfirmation(password, confirmPassword);
            }
        });
    }

    // Valider un champ
    validateField(input) {
        const group = input.closest('.form-group');
        let isValid = true;
        
        // Validation de base
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
        }
        
        // Validation spécifique par type
        if (input.type === 'email' && input.value) {
            isValid = this.isValidEmail(input.value);
        }
        
        if (input.type === 'password' && input.value) {
            isValid = input.value.length >= 6;
        }
        
        // Appliquer les classes
        group.classList.toggle('valid', isValid && input.value);
        group.classList.toggle('invalid', !isValid && input.value);
        
        return isValid;
    }

    // Valider la confirmation de mot de passe
    validatePasswordConfirmation(password, confirmPassword) {
        const group = confirmPassword.closest('.form-group');
        const isValid = password.value === confirmPassword.value && confirmPassword.value.length > 0;
        
        group.classList.toggle('valid', isValid);
        group.classList.toggle('invalid', !isValid && confirmPassword.value);
        
        return isValid;
    }

    // Valider un email
    isValidEmail(email) {
        return window.commonApp ? window.commonApp.isValidEmail(email) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Gestion de la connexion
    async handleLogin() {
        if (this.isLoading) return;
        
        const form = document.getElementById('login-form-element');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validation
        if (!this.validateLoginForm(data)) {
            return;
        }
        
        this.setLoading(true);
        this.clearMessages();
        
        try {
            // Appel API réel pour la connexion
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                    rememberMe: document.getElementById('remember-me')?.checked || false
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Succès - Afficher le formulaire de vérification du code
                this.showMessage('Code de vérification envoyé par email !', 'success');
                this.showVerificationForm(result.data.email, 'login');
            } else {
                this.showMessage(result.message || 'Email ou mot de passe incorrect.', 'error');
            }
            
        } catch (error) {
            console.error('Erreur connexion:', error);
            this.showMessage('Erreur de connexion. Veuillez réessayer.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // Gestion de l'inscription
    async handleRegister() {
        if (this.isLoading) return;
        
        const form = document.getElementById('register-form-element');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validation
        if (!this.validateRegisterForm(data)) {
            return;
        }
        
        this.setLoading(true);
        this.clearMessages();
        
        try {
            // Appel API réel pour l'inscription
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: data.firstname,
                    lastName: data.lastname,
                    email: data.email,
                    password: data.password,
                    phone: data.phone || '',
                    newsletter: document.getElementById('newsletter').checked
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Succès - Afficher le formulaire de vérification du code
                this.showMessage('Code de vérification envoyé par email !', 'success');
                this.showVerificationForm(result.data.email, 'register');
            } else {
                this.showMessage(result.message || 'Erreur lors de l\'inscription', 'error');
            }
            
        } catch (error) {
            console.error('Erreur inscription:', error);
            this.showMessage('Erreur de connexion. Veuillez réessayer.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // Validation du formulaire de connexion
    validateLoginForm(data) {
        let isValid = true;
        
        if (!data.email || !this.isValidEmail(data.email)) {
            this.showMessage('Veuillez saisir une adresse email valide.', 'error');
            isValid = false;
        }
        
        if (!data.password || data.password.length < 6) {
            this.showMessage('Le mot de passe doit contenir au moins 6 caractères.', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    // Validation du formulaire d'inscription
    validateRegisterForm(data) {
        let isValid = true;
        
        if (!data.firstname || data.firstname.trim().length < 2) {
            this.showMessage('Le prénom doit contenir au moins 2 caractères.', 'error');
            isValid = false;
        }
        
        if (!data.lastname || data.lastname.trim().length < 2) {
            this.showMessage('Le nom doit contenir au moins 2 caractères.', 'error');
            isValid = false;
        }
        
        if (!data.email || !this.isValidEmail(data.email)) {
            this.showMessage('Veuillez saisir une adresse email valide.', 'error');
            isValid = false;
        }
        
        if (!data.password || data.password.length < 6) {
            this.showMessage('Le mot de passe doit contenir au moins 6 caractères.', 'error');
            isValid = false;
        }
        
        if (data.password !== data.confirmPassword) {
            this.showMessage('Les mots de passe ne correspondent pas.', 'error');
            isValid = false;
        }
        
        if (!document.getElementById('accept-terms').checked) {
            this.showMessage('Vous devez accepter les conditions d\'utilisation.', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    // Gestion de la connexion sociale
    async handleSocialLogin(provider) {
        if (this.isLoading) return;
        
        this.setLoading(true);
        this.clearMessages();
        
        try {
            this.showMessage(`Redirection vers ${provider}...`, 'info');
            
            // Simulation de redirection
            await this.simulateApiCall();
            
            // En réalité, on redirigerait vers l'API OAuth
            // window.location.href = `/auth/${provider}`;
            
        } catch (error) {
            this.showMessage(`Erreur de connexion avec ${provider}.`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // Gestion du mot de passe oublié
    async handleForgotPassword() {
        const email = prompt('Veuillez saisir votre adresse email :');
        
        if (!email) return;
        
        if (!this.isValidEmail(email)) {
            this.showMessage('Adresse email invalide.', 'error');
            return;
        }
        
        this.setLoading(true);
        this.clearMessages();
        
        try {
            await this.simulateApiCall();
            this.showMessage('Un email de réinitialisation a été envoyé à votre adresse.', 'success');
        } catch (error) {
            this.showMessage('Erreur lors de l\'envoi de l\'email.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // Afficher le formulaire de vérification 2FA
    showVerificationForm(email, type) {
        const container = document.querySelector('.auth-container');
        
        // Créer le formulaire de vérification
        const verificationHTML = `
            <div id="verification-form" class="auth-form active">
                <div class="form-header">
                    <h2>Vérification du code</h2>
                    <p>Un code de vérification a été envoyé à <strong>${email}</strong></p>
                </div>
                
                <form id="verification-form-element">
                    <div class="form-group">
                        <label for="verification-code">Code de vérification (6 chiffres)</label>
                        <input type="text" id="verification-code" name="code" 
                               placeholder="123456" maxlength="6" pattern="[0-9]{6}" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full">
                        Vérifier le code
                    </button>
                    
                    <div class="form-footer">
                        <button type="button" id="resend-code" class="btn-link">
                            Renvoyer le code
                        </button>
                        <button type="button" id="back-to-form" class="btn-link">
                            Retour
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Masquer les autres formulaires
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // Ajouter le formulaire de vérification
        container.insertAdjacentHTML('beforeend', verificationHTML);
        
        // Ajouter les événements
        document.getElementById('verification-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleVerification(email, type);
        });
        
        document.getElementById('resend-code').addEventListener('click', () => {
            this.resendVerificationCode(email, type);
        });
        
        document.getElementById('back-to-form').addEventListener('click', () => {
            this.hideVerificationForm();
        });
        
        // Focus sur le champ de code
        document.getElementById('verification-code').focus();
    }
    
    // Gérer la vérification du code
    async handleVerification(email, type) {
        if (this.isLoading) return;
        
        const code = document.getElementById('verification-code').value;
        
        if (!code || code.length !== 6) {
            this.showMessage('Veuillez saisir un code à 6 chiffres.', 'error');
            return;
        }
        
        this.setLoading(true);
        this.clearMessages();
        
        try {
            const endpoint = type === 'register' ? '/api/auth/register/verify' : '/api/auth/login/verify';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    code: code
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Vérification réussie:', result);
                
                if (type === 'register') {
                    // Inscription réussie - Connexion automatique
                    this.showMessage('Inscription réussie ! Connexion automatique...', 'success');
                    
                    // Stocker le token et les données utilisateur
                    if (result.data && result.data.token) {
                        console.log('Stockage du token d\'inscription:', result.data.token);
                        localStorage.setItem('authToken', result.data.token);
                        this.setCurrentUser(result.data.user);
                        
                        // Rediriger vers la page de profil/compte
                        setTimeout(() => {
                            console.log('Redirection vers profile.html après inscription');
                            window.location.href = '/profile.html';
                        }, 1500);
                    } else {
                        console.log('Pas de token reçu pour l\'inscription');
                        // Fallback si pas de token
                        setTimeout(() => {
                            this.hideVerificationForm();
                            this.switchTab('login');
                        }, 2000);
                    }
                } else {
                    // Connexion réussie
                    console.log('Connexion réussie, données reçues:', result.data);
                    
                    if (result.data && result.data.token) {
                        console.log('Stockage du token de connexion:', result.data.token);
                        localStorage.setItem('authToken', result.data.token);
                        this.setCurrentUser(result.data.user);
                        
                        this.showMessage('Connexion réussie ! Redirection...', 'success');
                        
                        setTimeout(() => {
                            console.log('Redirection vers profile.html après connexion');
                            window.location.href = '/profile.html';
                        }, 1000);
                    } else {
                        console.log('Pas de token reçu pour la connexion');
                        this.showMessage('Erreur: Token manquant', 'error');
                    }
                }
            } else {
                this.showMessage(result.message || 'Code de vérification invalide.', 'error');
            }
            
        } catch (error) {
            console.error('Erreur vérification:', error);
            this.showMessage('Erreur de connexion. Veuillez réessayer.', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    // Renvoyer le code de vérification
    async resendVerificationCode(email, type) {
        if (this.isLoading) return;
        
        this.setLoading(true);
        this.clearMessages();
        
        try {
            const endpoint = '/api/auth/resend-code';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Nouveau code envoyé !', 'success');
            } else {
                this.showMessage(result.message || 'Erreur lors de l\'envoi du code.', 'error');
            }
            
        } catch (error) {
            console.error('Erreur renvoi code:', error);
            this.showMessage('Erreur de connexion. Veuillez réessayer.', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    // Masquer le formulaire de vérification
    hideVerificationForm() {
        const verificationForm = document.getElementById('verification-form');
        if (verificationForm) {
            verificationForm.remove();
        }
        
        // Réafficher le formulaire principal
        this.switchTab('register');
    }

    // Simulation d'appel API
    simulateApiCall() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 90% de chance de succès
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('Erreur simulée'));
                }
            }, 1500);
        });
    }

    // Gestion de l'état de chargement
    setLoading(loading) {
        this.isLoading = loading;
        
        const submitBtns = document.querySelectorAll('button[type="submit"]');
        submitBtns.forEach(btn => {
            btn.disabled = loading;
            btn.classList.toggle('loading', loading);
            
            if (loading) {
                btn.dataset.originalText = btn.textContent;
                btn.textContent = 'Chargement...';
            } else {
                btn.textContent = btn.dataset.originalText || btn.textContent;
            }
        });
    }

    // Afficher un message
    showMessage(message, type = 'info') {
        const container = document.getElementById('auth-messages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        container.innerHTML = '';
        container.appendChild(messageDiv);
        
        // Auto-suppression après 5 secondes pour les messages de succès et d'info
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 5000);
        }
    }

    // Effacer les messages
    clearMessages() {
        document.getElementById('auth-messages').innerHTML = '';
    }

    // Obtenir les données utilisateur (simulation)
    getCurrentUser() {
        // En réalité, on récupérerait depuis localStorage ou un token JWT
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    }

    // Sauvegarder les données utilisateur (simulation)
    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    // Déconnexion
    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = '/';
    }
}

// Initialiser la page d'authentification
document.addEventListener('DOMContentLoaded', () => {
    const initAuthPage = () => {
        if (window.commonApp) {
            window.authPage = new AuthPage();
        } else {
            setTimeout(initAuthPage, 100);
        }
    };
    
    initAuthPage();
});

// Gestion de l'historique du navigateur
window.addEventListener('popstate', () => {
    // Gérer le retour en arrière si nécessaire
});

// Préremplir les champs en mode développement
if (window.location.hostname === 'localhost') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            // Préremplir le formulaire de connexion pour les tests
            const loginEmail = document.getElementById('login-email');
            const loginPassword = document.getElementById('login-password');
            
            if (loginEmail && !loginEmail.value) {
                loginEmail.value = 'test@shop974.com';
                loginPassword.value = 'password123';
            }
        }, 1000);
    });
}