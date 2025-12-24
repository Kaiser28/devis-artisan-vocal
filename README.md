# Devis Artisan - Saisie Vocale

## 📋 Vue d'ensemble du projet
Application web pour faciliter la création de devis pour les artisans grâce à la **saisie vocale intelligente**.

**Objectif** : Gagner du temps pour les artisans en leur permettant de dicter leurs devis au lieu de les taper manuellement.

**Fonctionnalités principales** :
- ✅ Reconnaissance vocale native du navigateur (Web Speech API)
- ✅ Analyse automatique du texte dicté pour remplir le devis
- ✅ Prévisualisation du devis en temps réel
- ✅ Calcul automatique des totaux HT, TVA et TTC
- ✅ Export PDF du devis généré
- 🔄 **À venir** : Amélioration de l'analyse avec OpenAI pour une meilleure précision

## 🌐 URLs

- **Application (sandbox)** : https://3000-ix7bae9zbw59gb71utmfj-cc2fbc16.sandbox.novita.ai
- **GitHub** : (À configurer)
- **Production Cloudflare** : (À déployer)

## 📊 Architecture des données

### Modèle de données
Le devis comprend :
- **Informations entreprise** : Nom, adresse, téléphone de l'artisan
- **Informations client** : Nom, adresse, téléphone
- **Prestations** : Liste des prestations avec désignation, quantité, prix unitaire HT et total HT
- **Totaux** : Total HT, TVA (configurable), Total TTC
- **Conditions de paiement** : Texte libre pour les modalités de paiement
- **Métadonnées** : Date, numéro de devis, timestamp de génération

### Services de stockage
- **Version actuelle** : Stockage temporaire côté client (localStorage possible dans une future version)
- **Pas de base de données** pour le moment (tout en mémoire navigateur)
- **Export** : Génération de PDF côté client avec jsPDF

## 👤 Guide d'utilisation

### 1. Saisie vocale
1. Cliquez sur "**Commencer la dictée**"
2. Autorisez l'accès au microphone si demandé
3. Dictez naturellement votre devis

**Exemple de dictée** :
> "Client Jean Dupont, 15 rue de la Paix Paris. Prestation peinture chambre 12 mètres carrés à 25 euros le mètre carré. Fourniture peinture 3 pots à 45 euros."

4. Cliquez sur "**Arrêter la dictée**" quand vous avez fini

### 2. Analyse et remplissage
1. Cliquez sur "**Analyser et remplir le devis**"
2. L'application détecte automatiquement :
   - Le nom du client
   - L'adresse
   - Le téléphone
   - Les prestations avec quantités et prix

### 3. Modification manuelle
Vous pouvez modifier tous les champs directement :
- Informations client
- Informations artisan
- Prestations (ajout/suppression de lignes)
- Taux de TVA
- Conditions de paiement

Les totaux se recalculent automatiquement !

### 4. Export PDF
Cliquez sur "**Export PDF**" pour télécharger le devis au format PDF professionnel.

## 🚀 Statut de déploiement

- **Environnement** : Cloudflare Pages (Hono framework)
- **Statut** : ✅ Actif en sandbox
- **Stack technique** :
  - Backend : Hono (TypeScript)
  - Frontend : Vanilla JavaScript
  - UI : TailwindCSS + FontAwesome
  - Export PDF : jsPDF
  - Reconnaissance vocale : Web Speech API (Chrome/Edge)

## ✨ Fonctionnalités implémentées

### Version 1.0 (Actuelle)
- ✅ Interface à deux colonnes (saisie vocale / devis)
- ✅ Reconnaissance vocale en français
- ✅ Analyse intelligente du texte pour extraire :
  - Nom du client (détection de "client", "monsieur", "madame")
  - Adresse (détection automatique)
  - Téléphone (format français)
  - Prestations avec quantités et prix
- ✅ Gestion des prestations :
  - Ajout/suppression de lignes
  - Calcul automatique des totaux par ligne
- ✅ Calculs automatiques :
  - Total HT
  - TVA configurable (par défaut 20%)
  - Total TTC
- ✅ Export PDF professionnel
- ✅ Design responsive et moderne
- ✅ Conditions de paiement personnalisables

## 🔮 Fonctionnalités à venir

### Version 2.0 (Planifiée)
- 🔄 Intégration OpenAI GPT pour améliorer l'analyse du texte dicté
- 🔄 Meilleure détection des nuances et des synonymes
- 🔄 Correction automatique des erreurs de reconnaissance vocale
- 🔄 Sauvegarde locale des devis (localStorage)
- 🔄 Historique des devis créés
- 🔄 Templates de devis personnalisables
- 🔄 Ajout de logo d'entreprise
- 🔄 Envoi du devis par email

## 🛠️ Prochaines étapes recommandées

1. **Tester l'application** avec des cas d'usage réels d'artisans
2. **Configurer l'API OpenAI** pour améliorer la qualité de l'analyse
3. **Ajouter la sauvegarde locale** des devis avec localStorage
4. **Déployer sur Cloudflare Pages** pour production
5. **Créer un système de templates** pour différents types de prestations
6. **Ajouter la possibilité d'uploader un logo** d'entreprise

## 💡 Notes techniques

### Compatibilité navigateur
- **Reconnaissance vocale** : Chrome, Edge, Safari (iOS 14.5+)
- **Export PDF** : Tous les navigateurs modernes
- **Design responsive** : Mobile, tablette, desktop

### Limitations actuelles
- Pas de sauvegarde serveur (tout côté client)
- Reconnaissance vocale nécessite une connexion internet
- Analyse basique du texte (sera améliorée avec OpenAI)

### Commandes utiles
```bash
# Démarrer en local
npm run build
pm2 start ecosystem.config.cjs

# Voir les logs
pm2 logs webapp --nostream

# Redémarrer
fuser -k 3000/tcp && pm2 restart webapp

# Déployer sur Cloudflare
npm run deploy
```

---

**Dernière mise à jour** : 24 décembre 2025
