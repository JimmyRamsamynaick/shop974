const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfiguration() {
    console.log('🧪 Test de la configuration email...\n');
    
    // Vérifier les variables d'environnement
    console.log('📋 Variables d\'environnement :');
    console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST}`);
    console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT}`);
    console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***configuré***' : '❌ NON CONFIGURÉ'}`);
    console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}\n`);
    
    // Vérifier si les variables sont configurées
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
        process.env.EMAIL_USER.includes('votre_email') || 
        process.env.EMAIL_PASS.includes('votre_mot_de_passe')) {
        console.log('❌ ERREUR: Les variables d\'environnement email ne sont pas configurées correctement.');
        console.log('\n📝 Instructions pour configurer Gmail :');
        console.log('1. Allez sur https://myaccount.google.com/security');
        console.log('2. Activez l\'authentification à 2 facteurs');
        console.log('3. Allez dans "Mots de passe d\'application"');
        console.log('4. Générez un nouveau mot de passe pour "Mail"');
        console.log('5. Copiez le mot de passe de 16 caractères');
        console.log('6. Modifiez le fichier .env avec vos vraies informations\n');
        return;
    }
    
    // Créer le transporteur
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    try {
        // Test de connexion
        console.log('🔌 Test de connexion au serveur SMTP...');
        await transporter.verify();
        console.log('✅ Connexion SMTP réussie !\n');
        
        // Envoyer un email de test
        console.log('📧 Envoi d\'un email de test...');
        const testEmail = {
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER, // Envoyer à soi-même pour le test
            subject: '🧪 Test - Configuration email Shop 974',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #e74c3c;">🎉 Configuration email réussie !</h2>
                    <p>Félicitations ! Votre configuration email fonctionne parfaitement.</p>
                    <p>Les emails d'inscription et de vérification seront maintenant envoyés automatiquement.</p>
                    <hr style="margin: 20px 0;">
                    <p style="color: #666; font-size: 14px;">
                        <strong>Shop 974</strong><br>
                        Test envoyé le ${new Date().toLocaleString('fr-FR')}
                    </p>
                </div>
            `
        };
        
        const info = await transporter.sendMail(testEmail);
        console.log('✅ Email de test envoyé avec succès !');
        console.log(`📨 ID du message: ${info.messageId}`);
        console.log(`📬 Vérifiez votre boîte email: ${process.env.EMAIL_USER}\n`);
        
        console.log('🎉 Configuration email complète et fonctionnelle !');
        console.log('Les utilisateurs recevront maintenant des emails lors de l\'inscription.');
        
    } catch (error) {
        console.error('❌ Erreur lors du test email:');
        console.error(error.message);
        
        if (error.code === 'EAUTH') {
            console.log('\n💡 Erreur d\'authentification. Vérifiez :');
            console.log('- Que l\'email est correct');
            console.log('- Que le mot de passe d\'application Gmail est correct (16 caractères)');
            console.log('- Que l\'authentification à 2 facteurs est activée sur Gmail');
        } else if (error.code === 'ECONNECTION') {
            console.log('\n💡 Erreur de connexion. Vérifiez :');
            console.log('- Votre connexion internet');
            console.log('- Les paramètres SMTP (host, port)');
        }
    }
}

// Exécuter le test
testEmailConfiguration().catch(console.error);