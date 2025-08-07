// Shop 974 - Script spécifique pour la page de connexion
class LoginPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupPasswordToggle();
        this.setupFormValidation();
        this.setupFormSubmission();
        this.checkRedirectUser();
        this.setupKeyboardShortcuts();
    }

    // Configuration du basculement de visibilité du mot de passe
    setupPasswordToggle() {
        const passwordToggles = document.querySelectorAll('.password-toggle');
        
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = toggle.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                const icon = toggle.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                    toggle.setAttribute('aria-label', 'Masquer le mot de passe');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                    toggle.setAttribute('aria-label', 'Afficher le mot de passe');
                }
            });
        });
    }

    // Configuration de la validation de formulaire en temps réel
    setupFormValidation() {
        // Validation de l'email en temps réel
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateEmailInput(input);
            });
            
            input.addEventListener('blur', () => {
                this.validateEmailInput(input);
            });
        });

        // Validation du mot de passe
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            if (input.name === 'password') {
                input.addEventListener('input', () => {
                    this.validatePasswordInput(input);
                });
            }
            
            if (input.name === 'confirmPassword') {
                input.addEventListener('input', () => {
                    this.validateConfirmPasswordInput(input);
                });
            }
        });

        // Validation des champs requis
        const requiredInputs = document.querySelectorAll('input[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateRequiredInput(input);
            });
        });
    }

    // Validation de l'email
    validateEmailInput(input) {
        const email = input.value.trim();
        const isValid = email === '' || this.isValidEmail(email);
        
        this.setInputValidation(input, isValid, 
            isValid ? '' : 'Veuillez entrer une adresse email valide');
    }

    // Validation du mot de passe
    validatePasswordInput(input) {
        const password = input.value;
        const isValid = password === '' || password.length >= 6;
        
        this.setInputValidation(input, isValid, 
            isValid ? '' : 'Le mot de passe doit contenir au moins 6 caractères');
    }

    // Validation de la confirmation de mot de passe
    validateConfirmPasswordInput(input) {
        const password = document.querySelector('input[name="password"]').value;
        const confirmPassword = input.value;
        const isValid = confirmPassword === '' || password === confirmPassword;
        
        this.setInputValidation(input, isValid, 
            isValid ? '' : 'Les mots de passe ne correspondent pas');
    }

    // Validation des champs requis
    validateRequiredInput(input) {
        const isValid = input.value.trim() !== '';
        
        this.setInputValidation(input, isValid, 
            isValid ? '' : 'Ce champ est requis');
    }

    // Définir l'état de validation d'un input
    setInputValidation(input, isValid, message) {
        const inputGroup = input.closest('.input-group') || input.closest('.form-group');
        let errorElement = inputGroup.querySelector('.field-error');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            inputGroup.appendChild(errorElement);
        }

        input.classList.toggle('error', !isValid);
        errorElement.textContent = message;
        errorElement.style.display = message ? 'block' : 'none';
    }

    // Configuration de la soumission de formulaire
    setupFormSubmission() {
        // Formulaire de connexion
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLoginSubmit(loginForm);
            });
        }

        // Formulaire d'inscription
        const registerForm = document.getElementById('registerFormElement');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegisterSubmit(registerForm);
            });
        }

        // Formulaire mot de passe oublié
        const forgotForm = document.getElementById('forgotPasswordFormElement');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleForgotPasswordSubmit(forgotForm);
            });
        }
    }

    // Gestion de la soumission du formulaire de connexion
    async handleLoginSubmit(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const messageContainer = form.querySelector('.form-message');
        
        // Validation finale
        if (!this.validateForm(form)) {
            this.showMessage(messageContainer, 'Veuillez corriger les erreurs dans le formulaire.', 'error');
            return;
        }

        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };

        this.setButtonLoading(submitBtn, true, 'Connexion...');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                this.showMessage(messageContainer, 'Connexion réussie ! Redirection...', 'success');
                
                // Redirection après 1 seconde
                setTimeout(() => {
                    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/';
                    window.location.href = redirectUrl;
                }, 1000);
            } else {
                this.showMessage(messageContainer, data.message || 'Erreur de connexion', 'error');
                
                // Focus sur le champ email en cas d'erreur
                form.querySelector('input[name="email"]').focus();
            }
        } catch (error) {
            console.error('Erreur connexion:', error);
            this.showMessage(messageContainer, 'Erreur de connexion. Veuillez réessayer.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false, 'Se connecter');
        }
    }

    // Gestion de la soumission du formulaire d'inscription
    async handleRegisterSubmit(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const messageContainer = form.querySelector('.form-message');
        
        // Validation finale
        if (!this.validateForm(form)) {
            this.showMessage(messageContainer, 'Veuillez corriger les erreurs dans le formulaire.', 'error');
            return;
        }

        const registerData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            phone: formData.get('phone'),
            acceptTerms: formData.get('acceptTerms') === 'on'
        };

        // Validation spécifique à l'inscription
        if (!registerData.acceptTerms) {
            this.showMessage(messageContainer, 'Vous devez accepter les conditions d\'utilisation.', 'error');
            return;
        }

        this.setButtonLoading(submitBtn, true, 'Inscription...');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(messageContainer, 
                    'Inscription réussie ! Un email de vérification vous a été envoyé.', 
                    'success'
                );
                form.reset();
                
                // Redirection vers la page de vérification
                setTimeout(() => {
                    window.location.href = '/verify-email?email=' + encodeURIComponent(registerData.email);
                }, 3000);
            } else {
                this.showMessage(messageContainer, data.message || 'Erreur d\'inscription', 'error');
            }
        } catch (error) {
            console.error('Erreur inscription:', error);
            this.showMessage(messageContainer, 'Erreur d\'inscription. Veuillez réessayer.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false, 'S\'inscrire');
        }
    }

    // Gestion du mot de passe oublié
    async handleForgotPasswordSubmit(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const messageContainer = form.querySelector('.form-message');
        
        const email = formData.get('email');

        if (!this.isValidEmail(email)) {
            this.showMessage(messageContainer, 'Veuillez entrer une adresse email valide.', 'error');
            return;
        }

        this.setButtonLoading(submitBtn, true, 'Envoi...');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(messageContainer, 
                    'Un email de réinitialisation vous a été envoyé.', 
                    'success'
                );
                form.reset();
            } else {
                this.showMessage(messageContainer, data.message || 'Erreur lors de l\'envoi', 'error');
            }
        } catch (error) {
            console.error('Erreur mot de passe oublié:', error);
            this.showMessage(messageContainer, 'Erreur de connexion. Veuillez réessayer.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false, 'Envoyer le lien');
        }
    }

    // Valider tout le formulaire
    validateForm(form) {
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (input.type === 'email') {
                if (!this.isValidEmail(input.value)) {
                    isValid = false;
                    this.setInputValidation(input, false, 'Adresse email invalide');
                }
            } else if (input.type === 'password' && input.name === 'password') {
                if (input.value.length < 6) {
                    isValid = false;
                    this.setInputValidation(input, false, 'Le mot de passe doit contenir au moins 6 caractères');
                }
            } else if (input.name === 'confirmPassword') {
                const password = form.querySelector('input[name="password"]').value;
                if (input.value !== password) {
                    isValid = false;
                    this.setInputValidation(input, false, 'Les mots de passe ne correspondent pas');
                }
            } else if (input.value.trim() === '') {
                isValid = false;
                this.setInputValidation(input, false, 'Ce champ est requis');
            }
        });

        return isValid;
    }

    // Vérifier si l'utilisateur est déjà connecté
    checkRedirectUser() {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Vérifier la validité du token
            fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (response.ok) {
                    // Utilisateur déjà connecté, rediriger
                    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/';
                    window.location.href = redirectUrl;
                }
            })
            .catch(error => {
                console.error('Erreur vérification token:', error);
                localStorage.removeItem('authToken');
            });
        }
    }

    // Configuration des raccourcis clavier
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter pour soumettre le formulaire visible
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const visibleForm = document.querySelector('.auth-form:not([style*="display: none"]) form');
                if (visibleForm) {
                    e.preventDefault();
                    visibleForm.dispatchEvent(new Event('submit'));
                }
            }
            
            // Échap pour fermer les messages d'erreur
            if (e.key === 'Escape') {
                const messages = document.querySelectorAll('.form-message[style*="display: block"]');
                messages.forEach(message => {
                    message.style.display = 'none';
                });
            }
        });
    }

    // Utilitaires
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showMessage(container, message, type) {
        if (!container) return;

        container.innerHTML = `<div class="message ${type}">${message}</div>`;
        container.style.display = 'block';

        // Faire défiler vers le message
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Auto-masquer les messages de succès après 5 secondes
        if (type === 'success') {
            setTimeout(() => {
                container.style.display = 'none';
            }, 5000);
        }
    }

    setButtonLoading(button, isLoading, text) {
        if (!button) return;

        button.disabled = isLoading;
        
        if (isLoading) {
            button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
            button.classList.add('loading');
        } else {
            button.innerHTML = `<i class="fas fa-${this.getButtonIcon(text)}"></i> ${text}`;
            button.classList.remove('loading');
        }
    }

    getButtonIcon(text) {
        const iconMap = {
            'Se connecter': 'sign-in-alt',
            'S\'inscrire': 'user-plus',
            'Envoyer le lien': 'paper-plane'
        };
        
        return iconMap[text] || 'check';
    }

    // Méthode pour afficher des notifications toast
    showNotification(message, type = 'info') {
        if (window.shop974 && window.shop974.showNotification) {
            window.shop974.showNotification(message, type);
        }
    }
}

// Initialisation de la page de connexion
document.addEventListener('DOMContentLoaded', () => {
    window.loginPage = new LoginPage();
});

// Gestion des erreurs spécifiques à la page
window.addEventListener('error', (event) => {
    console.error('Erreur page de connexion:', event.error);
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginPage;
}