# Identifiants de test CLIC DEVIS

## ⚠️ INFORMATION IMPORTANTE

Les identifiants de connexion ne sont **PAS stockés** dans le code source pour des raisons de sécurité.

Chaque utilisateur crée son propre compte lors de l'inscription.

---

## 📧 Email de test mentionné : Test5@sferia.fr

**Cet email n'a PAS été trouvé dans le code source.**

**Deux possibilités** :

### 1️⃣ Compte créé manuellement sur l'application

**Connexion** :
- URL : https://devis-artisan-vocal-f2sf.vercel.app/login
- OU (après migration) : https://clicetdevis.fr/login
- Email : `Test5@sferia.fr`
- Mot de passe : *(celui que vous avez défini lors de l'inscription)*

**Si mot de passe oublié** :
1. Cliquer "Mot de passe oublié ?" sur la page login
2. OU accéder Supabase → Authentication → Users → Rechercher `Test5@sferia.fr` → Reset password

---

### 2️⃣ Créer un nouveau compte de test

**Inscription rapide** :
1. Aller sur : https://devis-artisan-vocal-f2sf.vercel.app/signup
2. Saisir :
   - Email : `test@sferia.fr` (ou tout autre email)
   - Mot de passe : `Test123456!` (minimum 6 caractères)
3. Cliquer "S'inscrire"
4. Vérifier email de confirmation Supabase (si activé)

---

## 🔐 Accès Supabase pour gérer les utilisateurs

**Dashboard Supabase** :
- URL : https://supabase.com/dashboard/project/zfdcqnrsggbqgxsuwgxv
- Section : Authentication → Users

**Actions possibles** :
- Lister tous les utilisateurs
- Rechercher `Test5@sferia.fr`
- Réinitialiser mot de passe
- Supprimer compte
- Créer utilisateur manuellement

**Identifiants Supabase** (si requis) :
- Supabase URL : `https://zfdcqnrsggbqgxsuwgxv.supabase.co`
- Project : `zfdcqnrsggbqgxsuwgxv`
- Connexion : Via votre compte Supabase personnel

---

## 🧪 Comptes de test recommandés

### Compte Test Standard
```
Email : test@sferia.fr
Mot de passe : Test123456!
```

### Compte Test Admin
```
Email : admin@sferia.fr
Mot de passe : Admin123456!
```

### Compte Test Demo
```
Email : demo@clicetdevis.fr
Mot de passe : Demo123456!
```

**Note** : Ces comptes doivent être créés manuellement via /signup

---

## 📋 Procédure création compte de test

### Méthode 1 : Via l'application (Recommandé)

1. Aller sur : https://devis-artisan-vocal-f2sf.vercel.app/signup
2. Remplir formulaire :
   - Email : `test@sferia.fr`
   - Mot de passe : `Test123456!`
3. Cliquer "S'inscrire"
4. **Email de confirmation** :
   - Si confirmation email activée → Cliquer lien dans email
   - Si désactivée → Connexion immédiate

5. Connexion : https://devis-artisan-vocal-f2sf.vercel.app/login
   - Email : `test@sferia.fr`
   - Mot de passe : `Test123456!`

---

### Méthode 2 : Via Supabase Dashboard (Admin)

1. Connexion : https://supabase.com/dashboard/project/zfdcqnrsggbqgxsuwgxv
2. Menu : Authentication → Users
3. Cliquer "Add user" → "Create new user"
4. Remplir :
   - Email : `test@sferia.fr`
   - Password : `Test123456!`
   - Email Confirm : ✅ (si auto-confirmation souhaitée)
5. Cliquer "Create user"

**Avantage** : Pas besoin de confirmation email

---

## 🔍 Vérifier si Test5@sferia.fr existe

### Via Supabase Dashboard

1. https://supabase.com/dashboard/project/zfdcqnrsggbqgxsuwgxv
2. Authentication → Users
3. Barre recherche : Saisir `Test5@sferia.fr`

**Résultat** :
- **Utilisateur trouvé** : Cliquer dessus → "Reset password" → Définir nouveau mot de passe
- **Utilisateur non trouvé** : Créer compte via Méthode 1 ou 2 ci-dessus

---

### Via SQL Supabase

1. https://supabase.com/dashboard/project/zfdcqnrsggbqgxsuwgxv/sql/new
2. Exécuter requête :
```sql
SELECT 
  id,
  email,
  created_at,
  confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'Test5@sferia.fr';
```

**Résultat** :
- **1 ligne retournée** : Utilisateur existe
- **0 ligne** : Utilisateur n'existe pas

---

## 🔑 Réinitialiser mot de passe Test5@sferia.fr

### Si vous avez accès Supabase

1. https://supabase.com/dashboard/project/zfdcqnrsggbqgxsuwgxv
2. Authentication → Users
3. Rechercher `Test5@sferia.fr`
4. Cliquer sur l'utilisateur
5. Section "Password" → Saisir nouveau mot de passe : `Test123456!`
6. Cliquer "Update user"

**Connexion ensuite** :
- Email : `Test5@sferia.fr`
- Mot de passe : `Test123456!`

---

### Si vous n'avez pas accès Supabase

**Via l'application** :
1. https://devis-artisan-vocal-f2sf.vercel.app/login
2. Cliquer "Mot de passe oublié ?" (si lien existe)
3. Saisir `Test5@sferia.fr`
4. Recevoir email de réinitialisation
5. Cliquer lien → Définir nouveau mot de passe

**Note** : Vérifier si la fonctionnalité "Forgot password" est implémentée dans /login

---

## 📊 État actuel des utilisateurs

**Pour lister tous les utilisateurs de test** :

```sql
-- Dans Supabase SQL Editor
SELECT 
  email,
  created_at,
  confirmed_at
FROM auth.users
WHERE email LIKE '%sferia.fr'
ORDER BY created_at DESC;
```

---

## 🎯 Recommandation immédiate

### Option A : Créer nouveau compte de test

**Plus rapide** (2 minutes) :
1. https://devis-artisan-vocal-f2sf.vercel.app/signup
2. Email : `test-demo@sferia.fr`
3. Mot de passe : `TestDemo123!`
4. Connexion immédiate

---

### Option B : Réinitialiser Test5@sferia.fr

**Si compte existe** (nécessite accès Supabase) :
1. Supabase → Authentication → Users
2. Rechercher `Test5@sferia.fr`
3. Reset password → `Test123456!`
4. Connexion avec nouveau mot de passe

---

## 🔗 Liens utiles

- **Inscription** : https://devis-artisan-vocal-f2sf.vercel.app/signup
- **Connexion** : https://devis-artisan-vocal-f2sf.vercel.app/login
- **Supabase Auth** : https://supabase.com/dashboard/project/zfdcqnrsggbqgxsuwgxv/auth/users
- **Dashboard app** : https://devis-artisan-vocal-f2sf.vercel.app/app

---

## ⚠️ Sécurité

**IMPORTANT** :
- Ne jamais stocker mots de passe en clair dans le code
- Utiliser mots de passe forts (8+ caractères, majuscules, chiffres, symboles)
- Comptes de test : utiliser domaine @sferia.fr ou @clicetdevis.fr
- Production : chaque client crée son propre compte

---

## 📧 Emails de test Stripe

**Pour tester paiements Stripe** (mode test) :
- Email : `test@sferia.fr` (ou tout email)
- Carte test : `4242 4242 4242 4242`
- Expiration : `12/27`
- CVC : `123`
- Code postal : `75001`

---

**Voulez-vous que je crée un nouveau compte de test ou vérifier si Test5@sferia.fr existe dans Supabase ?**
