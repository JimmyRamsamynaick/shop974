const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import des modules
const connectDB = require('./config/database');
const userController = require('./controllers/userController');
const authController = require('./controllers/authController');
const EmailService = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à la base de données
connectDB();

// Middleware de sécurité
app.use(helmet({
    contentSecurityPolicy: false, // Désactivé pour le développement
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limite chaque IP à 100 requêtes par windowMs
});
app.use(limiter);

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// Routes API
app.use('/api/users', userController);
app.use('/api/auth', authController);

// Route principale - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/produits', (req, res) => {
    res.sendFile(path.join(__dirname, 'produits.html'));
});

app.get('/connexion', (req, res) => {
    res.sendFile(path.join(__dirname, 'connexion.html'));
});

app.get('/panier', (req, res) => {
    res.sendFile(path.join(__dirname, 'panier.html'));
});

app.get('/commande', (req, res) => {
    res.sendFile(path.join(__dirname, 'commande.html'));
});

// Routes pour les pages
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/home.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/products.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/register.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/cart.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/faq.html'));
});

app.get('/verify-email', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/verify-email.html'));
});

app.get('/test-auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-auth.html'));
});

// Route de vérification d'email
app.get('/api/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const User = require('./models/user');
        
        const user = await User.findOne({ 
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.redirect('/verify-email?status=error&message=Token invalide ou expiré');
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.redirect('/verify-email?status=success&message=Email vérifié avec succès');
    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        res.redirect('/verify-email?status=error&message=Erreur lors de la vérification');
    }
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'pages/404.html'));
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Erreur interne du serveur' 
    });
});

// Fonction pour vérifier la configuration email
async function checkEmailConfiguration() {
    const isConfigured = await EmailService.verifyConnection();
    
    if (!isConfigured) {
        console.log('⚠️  Configuration email non fonctionnelle');
        console.log('📧 Les emails ne seront pas envoyés');
        console.log('💡 Exécutez "node test-email.js" pour tester la configuration');
    }
}

// Démarrage du serveur
app.listen(PORT, async () => {
    console.log(`🚀 Serveur Shop974 démarré sur le port ${PORT}`);
    console.log(`📱 Accédez au site: http://localhost:${PORT}`);
    console.log(`🔧 Mode: ${process.env.NODE_ENV || 'development'}`);
    
    // Vérifier la configuration email
    await checkEmailConfiguration();
});

module.exports = app;