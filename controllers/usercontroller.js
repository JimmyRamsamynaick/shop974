const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const emailService = require('../services/emailService');

const router = express.Router();

// Middleware pour vérifier le token JWT
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token d\'accès requis' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Utilisateur non trouvé' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Token invalide' 
        });
    }
};

// Inscription
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, newsletter } = req.body;

        // Validation des données
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs obligatoires doivent être remplis'
            });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Un compte avec cet email existe déjà'
            });
        }

        // Créer le nouvel utilisateur
        const user = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            phone,
            newsletter: newsletter || false
        });

        // Générer le token de vérification
        const verificationToken = user.generateEmailVerificationToken();

        // Sauvegarder l'utilisateur
        await user.save();

        // Envoyer l'email de vérification
        const emailResult = await emailService.sendVerificationEmail(user, verificationToken);

        if (!emailResult.success) {
            console.error('Erreur envoi email:', emailResult.error);
            // Ne pas faire échouer l'inscription si l'email ne peut pas être envoyé
        }

        res.status(201).json({
            success: true,
            message: 'Compte créé avec succès ! Vérifiez votre email pour activer votre compte.',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified
                },
                emailSent: emailResult.success
            }
        });

    } catch (error) {
        console.error('Erreur inscription:', error);
        
        // Gestion des erreurs de validation Mongoose
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

// Connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation des données
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            });
        }

        // Trouver l'utilisateur avec le mot de passe
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Vérifier si le compte est verrouillé
        if (user.isLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Compte temporairement verrouillé. Réessayez plus tard.'
            });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            // Incrémenter les tentatives de connexion
            await user.incLoginAttempts();
            
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Vérifier si l'email est vérifié
        if (!user.isEmailVerified) {
            return res.status(401).json({
                success: false,
                message: 'Veuillez vérifier votre email avant de vous connecter',
                needEmailVerification: true
            });
        }

        // Réinitialiser les tentatives de connexion
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Mettre à jour la dernière connexion
        user.lastLogin = new Date();
        await user.save();

        // Générer le token JWT
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Connexion réussie',
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    lastLogin: user.lastLogin
                }
            }
        });

    } catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

// Renvoyer l'email de vérification
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email requis'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email déjà vérifié'
            });
        }

        // Générer un nouveau token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        // Envoyer l'email
        const emailResult = await emailService.sendVerificationEmail(user, verificationToken);

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'envoi de l\'email'
            });
        }

        res.json({
            success: true,
            message: 'Email de vérification renvoyé avec succès'
        });

    } catch (error) {
        console.error('Erreur renvoi email:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

// Obtenir le profil utilisateur
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    newsletter: user.newsletter,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                }
            }
        });

    } catch (error) {
        console.error('Erreur profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

// Mettre à jour le profil
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, phone, address, newsletter } = req.body;
        
        const user = await User.findById(req.user._id);
        
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (newsletter !== undefined) user.newsletter = newsletter;
        
        await user.save();

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    newsletter: user.newsletter
                }
            }
        });

    } catch (error) {
        console.error('Erreur mise à jour profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

// Déconnexion (côté client principalement)
router.post('/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Déconnexion réussie'
    });
});

// Route de test pour vérifier l'API
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'API utilisateur fonctionnelle',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;