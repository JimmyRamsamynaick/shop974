const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
        
        // Gestion des événements de connexion
        mongoose.connection.on('error', (err) => {
            console.error('❌ Erreur MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB déconnecté');
        });

        // Fermeture propre lors de l'arrêt de l'application
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 Connexion MongoDB fermée');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;