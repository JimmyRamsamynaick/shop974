const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // true pour 465, false pour les autres ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    // Vérifier la configuration email
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Service email configuré correctement');
            return true;
        } catch (error) {
            console.error('❌ Erreur configuration email:', error.message);
            return false;
        }
    }

    // Envoyer un email de vérification
    async sendVerificationEmail(user, verificationToken) {
        const verificationUrl = `${process.env.CORS_ORIGIN}/api/verify-email/${verificationToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: '🔐 Vérifiez votre compte Shop 974',
            html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Vérification de compte - Shop 974</title>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f4f4f4;
                        }
                        .container {
                            background: white;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .logo {
                            font-size: 28px;
                            font-weight: bold;
                            color: #e74c3c;
                            margin-bottom: 10px;
                        }
                        .subtitle {
                            color: #666;
                            font-size: 16px;
                        }
                        .content {
                            margin: 30px 0;
                        }
                        .btn {
                            display: inline-block;
                            background: linear-gradient(135deg, #e74c3c, #c0392b);
                            color: white;
                            padding: 15px 30px;
                            text-decoration: none;
                            border-radius: 25px;
                            font-weight: bold;
                            margin: 20px 0;
                            transition: transform 0.3s ease;
                        }
                        .btn:hover {
                            transform: translateY(-2px);
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #eee;
                            text-align: center;
                            color: #666;
                            font-size: 14px;
                        }
                        .warning {
                            background: #fff3cd;
                            border: 1px solid #ffeaa7;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                            color: #856404;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🏝️ Shop 974</div>
                            <div class="subtitle">Votre boutique réunionnaise en ligne</div>
                        </div>
                        
                        <div class="content">
                            <h2>Bonjour ${user.firstName} ! 👋</h2>
                            
                            <p>Bienvenue sur <strong>Shop 974</strong> ! Nous sommes ravis de vous compter parmi nous.</p>
                            
                            <p>Pour finaliser votre inscription et sécuriser votre compte, veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email :</p>
                            
                            <div style="text-align: center;">
                                <a href="${verificationUrl}" class="btn">
                                    ✅ Vérifier mon email
                                </a>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Important :</strong> Ce lien est valide pendant 24 heures seulement. Si vous ne vérifiez pas votre email dans ce délai, vous devrez créer un nouveau compte.
                            </div>
                            
                            <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
                            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
                                ${verificationUrl}
                            </p>
                            
                            <p>Une fois votre email vérifié, vous pourrez :</p>
                            <ul>
                                <li>🛍️ Parcourir nos produits locaux</li>
                                <li>🛒 Ajouter des articles à votre panier</li>
                                <li>💳 Passer des commandes en toute sécurité</li>
                                <li>📦 Suivre vos livraisons</li>
                                <li>💌 Recevoir nos offres exclusives</li>
                            </ul>
                        </div>
                        
                        <div class="footer">
                            <p>Si vous n'avez pas créé de compte sur Shop 974, vous pouvez ignorer cet email.</p>
                            <p>
                                <strong>Shop 974</strong><br>
                                La boutique qui vous fait découvrir les trésors de La Réunion<br>
                                📧 contact@shop974.com | 📱 +262 692 XX XX XX
                            </p>
                            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                                © 2024 Shop 974. Tous droits réservés.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email de vérification envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Erreur envoi email:', error);
            return { success: false, error: error.message };
        }
    }

    // Envoyer un code 2FA par email
    async send2FACode(email, code, type = 'login') {
        const isLogin = type === 'login';
        const subject = isLogin ? '🔐 Code de connexion - Shop 974' : '🔐 Code de vérification - Shop 974';
        const title = isLogin ? 'Connexion à votre compte' : 'Vérification de votre inscription';
        const message = isLogin ? 
            'Quelqu\'un tente de se connecter à votre compte. Si c\'est bien vous, utilisez le code ci-dessous :' :
            'Pour finaliser votre inscription, utilisez le code de vérification ci-dessous :';

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: subject,
            html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${title} - Shop 974</title>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f4f4f4;
                        }
                        .container {
                            background: white;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .logo {
                            font-size: 28px;
                            font-weight: bold;
                            color: #e74c3c;
                            margin-bottom: 10px;
                        }
                        .subtitle {
                            color: #666;
                            font-size: 16px;
                        }
                        .content {
                            margin: 30px 0;
                            text-align: center;
                        }
                        .code-container {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            border-radius: 15px;
                            margin: 30px 0;
                            text-align: center;
                        }
                        .code {
                            font-size: 36px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            margin: 10px 0;
                            font-family: 'Courier New', monospace;
                        }
                        .code-label {
                            font-size: 14px;
                            opacity: 0.9;
                            margin-bottom: 10px;
                        }
                        .expiry {
                            background: #fff3cd;
                            border: 1px solid #ffeaa7;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 20px 0;
                            color: #856404;
                            text-align: center;
                        }
                        .security-notice {
                            background: #f8d7da;
                            border: 1px solid #f5c6cb;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 20px 0;
                            color: #721c24;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #eee;
                            text-align: center;
                            color: #666;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🏝️ Shop 974</div>
                            <div class="subtitle">Votre boutique réunionnaise en ligne</div>
                        </div>
                        
                        <div class="content">
                            <h2>${title}</h2>
                            
                            <p>${message}</p>
                            
                            <div class="code-container">
                                <div class="code-label">Votre code de vérification</div>
                                <div class="code">${code}</div>
                            </div>
                            
                            <div class="expiry">
                                <strong>⏰ Important :</strong> Ce code expire dans <strong>15 minutes</strong>. 
                                Ne le partagez avec personne.
                            </div>
                            
                            ${isLogin ? `
                            <div class="security-notice">
                                <strong>🔒 Sécurité :</strong> Si vous n'êtes pas à l'origine de cette tentative de connexion, 
                                ignorez cet email et changez votre mot de passe immédiatement.
                            </div>
                            ` : ''}
                            
                            <p>Saisissez ce code sur la page de ${isLogin ? 'connexion' : 'vérification'} pour continuer.</p>
                        </div>
                        
                        <div class="footer">
                            <p>
                                <strong>Shop 974</strong><br>
                                La boutique qui vous fait découvrir les trésors de La Réunion<br>
                                📧 contact@shop974.com | 📱 +262 692 XX XX XX
                            </p>
                            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                                © 2024 Shop 974. Tous droits réservés.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Code 2FA envoyé (${type}):`, info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Erreur envoi code 2FA:', error);
            return { success: false, error: error.message };
        }
    }

    // Envoyer un email de bienvenue après vérification
    async sendWelcomeEmail(user) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: '🎉 Bienvenue sur Shop 974 !',
            html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Bienvenue - Shop 974</title>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f4f4f4;
                        }
                        .container {
                            background: white;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .logo {
                            font-size: 28px;
                            font-weight: bold;
                            color: #e74c3c;
                            margin-bottom: 10px;
                        }
                        .btn {
                            display: inline-block;
                            background: linear-gradient(135deg, #e74c3c, #c0392b);
                            color: white;
                            padding: 15px 30px;
                            text-decoration: none;
                            border-radius: 25px;
                            font-weight: bold;
                            margin: 20px 0;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #eee;
                            text-align: center;
                            color: #666;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🏝️ Shop 974</div>
                        </div>
                        
                        <div class="content">
                            <h2>Félicitations ${user.firstName} ! 🎉</h2>
                            
                            <p>Votre compte a été vérifié avec succès ! Vous faites maintenant partie de la communauté Shop 974.</p>
                            
                            <p>Découvrez dès maintenant nos produits authentiques de La Réunion :</p>
                            
                            <div style="text-align: center;">
                                <a href="${process.env.CORS_ORIGIN}/products" class="btn">
                                    🛍️ Découvrir nos produits
                                </a>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p><strong>Shop 974</strong> - Made with ❤️ in Réunion</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email de bienvenue envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Erreur envoi email de bienvenue:', error);
            return { success: false, error: error.message };
        }
    }

    // Envoyer un email de réinitialisation de mot de passe
    async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: '🔑 Réinitialisation de votre mot de passe - Shop 974',
            html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Réinitialisation mot de passe - Shop 974</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="font-size: 28px; font-weight: bold; color: #e74c3c;">🏝️ Shop 974</div>
                        </div>
                        
                        <h2>Réinitialisation de mot de passe</h2>
                        
                        <p>Bonjour ${user.firstName},</p>
                        
                        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="display: inline-block; background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                                🔑 Réinitialiser mon mot de passe
                            </a>
                        </div>
                        
                        <p style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; color: #856404;">
                            <strong>⚠️ Important :</strong> Ce lien est valide pendant 10 minutes seulement.
                        </p>
                        
                        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
                            <p><strong>Shop 974</strong> - Made with ❤️ in Réunion</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email de réinitialisation envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Erreur envoi email de réinitialisation:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();