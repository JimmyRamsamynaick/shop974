# 📧 Guide de Configuration Email - Shop 974

## 🎯 Objectif
Ce guide vous explique comment configurer l'envoi d'emails réels pour votre boutique Shop 974.

## 🔍 Problème actuel
Les emails ne sont pas envoyés car les variables d'environnement contiennent des valeurs d'exemple et non de vraies informations de connexion.

## ✅ Solutions disponibles

### Option 1: Gmail (Recommandé pour les tests)

#### Étapes détaillées :

1. **Préparer votre compte Gmail**
   - Connectez-vous à votre compte Gmail
   - Allez sur https://myaccount.google.com/security

2. **Activer l'authentification à 2 facteurs**
   - Cliquez sur "Authentification à 2 facteurs"
   - Suivez les instructions pour l'activer (SMS ou application)

3. **Générer un mot de passe d'application**
   - Une fois la 2FA activée, retournez dans "Sécurité"
   - Cliquez sur "Mots de passe d'application"
   - Sélectionnez "Mail" comme application
   - Copiez le mot de passe de 16 caractères généré

4. **Modifier le fichier .env**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=votre_vraie_adresse@gmail.com
   EMAIL_PASS=abcd efgh ijkl mnop  # Le mot de passe d'application
   EMAIL_FROM=Shop974 <votre_vraie_adresse@gmail.com>
   ```

### Option 2: SendGrid (Recommandé pour la production)

1. **Créer un compte SendGrid**
   - Allez sur https://sendgrid.com
   - Créez un compte gratuit (100 emails/jour)

2. **Générer une clé API**
   - Dans le dashboard, allez dans "Settings" > "API Keys"
   - Créez une nouvelle clé avec les permissions d'envoi

3. **Configurer le .env**
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=SG.votre_cle_api_sendgrid
   EMAIL_FROM=Shop974 <noreply@votredomaine.com>
   ```

### Option 3: Mailgun

1. **Créer un compte Mailgun**
   - Allez sur https://www.mailgun.com
   - Créez un compte (5000 emails gratuits/mois)

2. **Configurer un domaine**
   - Ajoutez votre domaine ou utilisez le sandbox

3. **Récupérer les informations SMTP**
   ```env
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_USER=postmaster@votre-domaine.mailgun.org
   EMAIL_PASS=votre_mot_de_passe_mailgun
   EMAIL_FROM=Shop974 <noreply@votre-domaine.com>
   ```

## 🧪 Tester la configuration

1. **Exécuter le test automatique**
   ```bash
   node test-email.js
   ```

2. **Vérifier au démarrage du serveur**
   ```bash
   npm start
   ```
   Le serveur affichera si la configuration email fonctionne.

3. **Tester l'inscription**
   - Créez un nouveau compte sur le site
   - Vérifiez votre boîte email

## 🔧 Dépannage

### Erreur d'authentification Gmail
- Vérifiez que la 2FA est activée
- Utilisez bien le mot de passe d'application (16 caractères)
- Pas votre mot de passe Gmail habituel

### Emails non reçus
- Vérifiez les spams/courriers indésirables
- Attendez quelques minutes (délai possible)
- Vérifiez que l'adresse email est correcte

### Erreur de connexion
- Vérifiez votre connexion internet
- Vérifiez les paramètres SMTP (host, port)

## 📋 Checklist finale

- [ ] Variables d'environnement configurées avec de vraies valeurs
- [ ] Test `node test-email.js` réussi
- [ ] Serveur redémarré
- [ ] Email de test reçu
- [ ] Inscription testée sur le site

## 🎉 Une fois configuré

Votre boutique enverra automatiquement :
- ✅ Emails de vérification lors de l'inscription
- 🔐 Codes 2FA pour la connexion sécurisée
- 📧 Notifications de commande (à venir)
- 🎁 Emails promotionnels (à venir)

## 💡 Conseils de sécurité

- Ne partagez jamais vos clés API ou mots de passe
- Utilisez des domaines personnalisés en production
- Surveillez vos quotas d'envoi
- Configurez SPF/DKIM pour éviter les spams

---

**Besoin d'aide ?** Contactez le support technique avec les détails de votre configuration.