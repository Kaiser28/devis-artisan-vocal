# 🛠️ Devis Artisan - Application de Saisie Vocale

## 📋 Vue d'ensemble

Application web complète pour les artisans du BTP permettant de créer des devis professionnels par **saisie vocale** avec l'aide d'une **IA intelligente** qui apprend de vos prix.

**URL de l'application** : https://3000-ix7bae9zbw59gb71utmfj-cc2fbc16.sandbox.novita.ai

## ✨ Fonctionnalités principales

### 🎤 Saisie Vocale Intelligente
- **Reconnaissance vocale** en français (Chrome/Edge)
- **Détection automatique** : client, adresse, téléphone
- **Extraction des prestations** avec quantités et prix
- **Assistant IA conversationnel** qui pose des questions pour compléter les infos manquantes

### 📊 Génération de Devis en Temps Réel
- **Interface split** : vocal à gauche, devis à droite
- **Calcul automatique** des totaux HT, TVA, TTC
- **Lots automatiques** : l'IA sépare les différents types de travaux
- **Prix réalistes** basés sur le marché BTP français 2024-2025
- **Édition manuelle** : champs modifiables après génération

### 🤖 IA Apprenante et Personnalisée
- **Mode conversationnel** : l'IA pose 2-4 questions ciblées avant de générer
- **Utilise VOS prix** en priorité depuis votre base de données
- **Prix du marché** en fallback si aucun prix personnel trouvé
- **Apprentissage automatique** : extrait les prix de chaque devis validé

### 📁 Historique Complet des Devis
- **Liste de tous vos devis** avec recherche et filtres
- **Statuts** : Brouillon / Envoyé / Accepté / Refusé
- **Statistiques** : nombre de devis, CA potentiel
- **Duplication en 1 clic** pour réutiliser un devis existant
- **Sauvegarde automatique** à l'export PDF

### 💰 Base de Prix Personnelle
- **Extraction automatique** des prix depuis vos devis validés
- **Organisation par catégorie** : parquet, peinture, plomberie, etc.
- **Compteur d'usage** : voir vos prestations les plus utilisées
- **L'IA s'adapte** : utilise automatiquement vos prix réels

### 📄 Export PDF Professionnel
- **Design propre** avec logo et coordonnées entreprise
- **Sections claires** : Client / Prestations / Totaux / Conditions
- **Impression optimisée** avec CSS spécifique
- **Sauvegarde auto** dans l'historique lors de l'export

### ⚙️ Paramètres Entreprise
- **Configuration unique** : nom, adresse, téléphone, SIRET, email
- **Conditions de paiement** par défaut
- **Taux de TVA** par défaut
- **Clé API OpenAI** pour l'assistant IA
- **Stockage local** : vos données restent chez vous (localStorage)

## 🎯 Workflow typique

### 1️⃣ Première utilisation
1. **Cliquez sur "Paramètres"**
2. Remplissez vos **informations d'entreprise**
3. Ajoutez votre **clé API OpenAI** (optionnel mais recommandé)
4. Enregistrez

### 2️⃣ Créer un devis
1. **"Commencer la dictée"** (microphone)
2. Dictez : *"Client Jean Dupont, 15 rue de la Paix Paris. Je veux faire un parquet dans une chambre de 12 mètres carrés"*
3. Cliquez **"Assistant IA"**
4. Répondez aux questions de l'IA (si besoin)
5. Cliquez **"Appliquer au devis"**
6. Vérifiez et ajustez manuellement si nécessaire
7. **"Exporter PDF"** → sauvegarde automatique dans l'historique

### 3️⃣ Réutiliser un devis existant
1. Onglet **"Historique"**
2. Trouvez le devis similaire
3. Cliquez **"Dupliquer"**
4. Modifiez client et prestations
5. Exportez le nouveau devis

### 4️⃣ Gérer votre base de prix
1. Onglet **"Ma base de prix"**
2. Consultez les prix extraits de vos devis
3. Cliquez **"Actualiser depuis les devis"** pour synchroniser
4. L'IA utilisera automatiquement ces prix dans les prochains devis

## 🔧 Architecture technique

### Stack
- **Frontend** : HTML, TailwindCSS, JavaScript vanilla
- **Backend** : Hono (Cloudflare Workers)
- **IA** : OpenAI GPT-4o-mini
- **Stockage** : localStorage (navigateur)
- **Reconnaissance vocale** : Web Speech API

### Structure de données

#### Devis (historique_devis)
```json
{
  "id": "1735123456789",
  "numero": "DEV-20241224-0001",
  "date_creation": "2024-12-24T10:30:00Z",
  "client_nom": "Jean Dupont",
  "client_adresse": "15 rue de la Paix, 75002 Paris",
  "client_tel": "06 12 34 56 78",
  "artisan_nom": "Entreprise Martin",
  "artisan_adresse": "...",
  "lots": [
    {
      "nom_lot": "PARQUET - REVÊTEMENT SOL",
      "prestations": [
        {
          "designation": "Fourniture parquet stratifié",
          "quantite": 27.5,
          "unite": "m²",
          "prix_unitaire": 20.00,
          "type": "fourniture"
        }
      ]
    }
  ],
  "total_ht": 750.00,
  "tva_taux": 20,
  "tva_montant": 150.00,
  "total_ttc": 900.00,
  "conditions_paiement": "Acompte de 30%...",
  "statut": "brouillon"
}
```

#### Base de prix (base_prix)
```json
{
  "id": "1735123456789",
  "designation": "Pose parquet stratifié",
  "categorie": "parquet",
  "type": "main_oeuvre",
  "prix_unitaire": 30.00,
  "unite": "m²",
  "notes": "Extrait du devis DEV-20241224-0001",
  "usage_count": 5,
  "date_creation": "2024-12-24T10:30:00Z",
  "date_modification": "2024-12-25T14:20:00Z"
}
```

## 💡 Conseils d'utilisation

### Pour de meilleurs résultats avec la saisie vocale
- Dictez **clairement** et **lentement**
- Utilisez des mots-clés : *"Client"*, *"Prestation"*, *"Fourniture"*
- Indiquez toujours les **quantités** et **unités**
- Exemple : *"Prestation pose de parquet 25 mètres carrés à 30 euros le mètre carré"*

### Pour optimiser l'IA
- **Validez régulièrement** vos devis pour alimenter la base de prix
- **Corrigez les prix** avant export si l'IA se trompe
- **Vos prix personnels** seront utilisés en priorité
- Plus vous l'utilisez, plus l'IA devient précise pour VOTRE activité

### Sécurité et confidentialité
- ✅ Toutes les données stockées **localement** (localStorage)
- ✅ Aucune synchronisation cloud par défaut
- ✅ Votre clé API OpenAI reste **privée**
- ❌ Si vous videz le cache navigateur, vous perdez vos données
- 💡 Pensez à exporter régulièrement vos devis en PDF

## 🚀 Prochaines améliorations possibles

### En développement
- [ ] Export Excel/CSV de l'historique
- [ ] Envoi direct par email du devis
- [ ] Partage WhatsApp du PDF
- [ ] Templates de prestations fréquentes
- [ ] Signature électronique client
- [ ] Statistiques avancées (CA, taux conversion)
- [ ] Backup automatique dans le cloud
- [ ] Application mobile PWA

## 📞 Support

Pour toute question ou demande d'amélioration, contactez l'équipe de développement.

---

**Version** : 2.0  
**Dernière mise à jour** : 24 décembre 2024  
**Créé avec** : ❤️ pour les artisans qui en ont marre de l'administratif
