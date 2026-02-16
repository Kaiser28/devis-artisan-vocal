# DNS : CNAME vs Nameservers - Quelle méthode choisir ?

## Vous voyez cette interface Vercel

```
DNS Records - Vercel DNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type    Name    Value
CNAME   www     c11664de7c030341.vercel-dns-017.com.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🚨 ATTENTION : 2 méthodes INCOMPATIBLES

Vercel affiche les enregistrements CNAME **pour la méthode manuelle**.

**Vous avez le choix entre 2 méthodes** :

---

## Méthode 1 : Nameservers Vercel (RECOMMANDÉ ✅)

### Avantages
- ✅ Configuration simple (2 valeurs seulement)
- ✅ Pas d'erreur possible
- ✅ Vercel gère TOUT automatiquement
- ✅ Pas besoin de CNAME, A, AAAA
- ✅ Certificat SSL automatique
- ✅ Temps : 10-15 min

### Configuration

**Chez Hostinger** :
1. Domaines → `clicetdevis.fr`
2. DNS / Serveurs de noms → Modifier
3. Sélectionner "Serveurs de noms personnalisés"
4. Saisir :
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
5. Enregistrer

**Chez Vercel** :
- **RIEN À FAIRE** ✅
- Validation automatique après propagation nameservers

### ⚠️ Inconvénient
- Email Hostinger ne fonctionne plus
- Solution : configurer email externe (Zoho, Google)

---

## Méthode 2 : DNS manuels (CNAME) ❌

### Avantages
- ✅ Email Hostinger reste fonctionnel

### Inconvénients
- ❌ Configuration complexe (plusieurs enregistrements)
- ❌ Risque d'erreur élevé
- ❌ Temps : 30-70 min (propagation DNS)
- ❌ Nécessite configuration A + CNAME

### Configuration

**⚠️ Cette méthode nécessite PLUSIEURS enregistrements** :

**Chez Hostinger** :
1. Domaines → `clicetdevis.fr` → Gérer DNS
2. **Supprimer** enregistrements A/AAAA parking
3. **Ajouter enregistrement A** :
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 14400
   ```
4. **Ajouter enregistrement CNAME** :
   ```
   Type: CNAME
   Name: www
   Value: c11664de7c030341.vercel-dns-017.com.
   TTL: 14400
   ```
5. Enregistrer

**⚠️ ATTENTION** :
- Vercel affiche `c11664de7c030341.vercel-dns-017.com.` (avec point final)
- Hostinger peut demander **sans** le point final : `c11664de7c030341.vercel-dns-017.com`
- Vérifier interface Hostinger

**Chez Vercel** :
- Attendre 30-60 min
- Rafraîchir page
- Status passe à "Valid Configuration"

---

## 🎯 Recommandation

### Utilisez la Méthode 1 (Nameservers) SI :
- ✅ Vous n'utilisez PAS d'email Hostinger actuellement
- ✅ Vous acceptez de configurer email externe après (Zoho gratuit)
- ✅ Vous voulez une config rapide et sans erreur

### Utilisez la Méthode 2 (CNAME) SI :
- ✅ Vous avez DÉJÀ un email @clicetdevis.fr actif chez Hostinger
- ✅ Vous voulez le conserver sans interruption
- ✅ Vous êtes à l'aise avec configuration DNS manuelle

---

## 🚀 ACTION RECOMMANDÉE (Méthode 1)

**Puisque vous n'avez probablement PAS encore d'email actif @clicetdevis.fr** :

### Étape 1 : Ignorer les CNAME affichés dans Vercel
- Ne pas copier `c11664de7c030341.vercel-dns-017.com.`
- Ne rien configurer dans l'interface actuelle Vercel
- **Fermer cette page Vercel**

### Étape 2 : Aller sur Hostinger
1. https://hpanel.hostinger.com/
2. Domaines → `clicetdevis.fr`
3. DNS / Serveurs de noms → Modifier
4. Choisir "Serveurs de noms personnalisés"
5. Saisir :
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
6. Enregistrer

### Étape 3 : Attendre 10 minutes
- Propagation nameservers (très rapide)

### Étape 4 : Vérifier Vercel
- Retourner https://vercel.com/kaiser28s-projects/devis-artisan-vocal/settings/domains
- Rafraîchir (F5)
- Status → "Valid Configuration" ✅

---

## 📊 Comparaison visuelle

### Méthode 1 : Nameservers

**Hostinger** :
```
DNS / Serveurs de noms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Serveurs de noms personnalisés :
  ns1.vercel-dns.com
  ns2.vercel-dns.com
```

**Vercel** :
```
✅ clicetdevis.fr - Valid Configuration
✅ www.clicetdevis.fr - Valid Configuration
```

**Résultat** : Vercel gère TOUT (A, CNAME, SSL, etc.)

---

### Méthode 2 : CNAME manuels

**Hostinger** :
```
Zone DNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type    Name    Value
A       @       76.76.21.21
CNAME   www     c11664de7c030341.vercel-dns-017.com
```

**Vercel** :
```
✅ clicetdevis.fr - Valid Configuration
✅ www.clicetdevis.fr - Valid Configuration
```

**Résultat** : Vous gérez manuellement chaque enregistrement

---

## ❓ FAQ

### Q : "Dois-je copier `c11664de7c030341.vercel-dns-017.com.` quelque part ?"

**R** : 
- **Méthode 1 (nameservers)** : NON ❌
- **Méthode 2 (CNAME manuels)** : OUI, dans Hostinger zone DNS

### Q : "Pourquoi Vercel affiche ce CNAME ?"

**R** : Vercel affiche les enregistrements pour la méthode manuelle (Méthode 2). Si vous utilisez nameservers Vercel, ignorez ces valeurs.

### Q : "Puis-je utiliser les deux méthodes ?"

**R** : NON ❌ Incompatible. Choisissez-en UNE.

### Q : "Que se passe-t-il si j'utilise nameservers Vercel ?"

**R** : Vercel devient le gestionnaire DNS complet. Les CNAME affichés deviennent inutiles car Vercel les configure automatiquement en interne.

### Q : "L'email Hostinger fonctionnera-t-il avec nameservers Vercel ?"

**R** : Non. Solution :
- Configurer email externe (Zoho gratuit : https://www.zoho.com/mail/)
- OU utiliser Méthode 2 (CNAME manuels) pour conserver email Hostinger

### Q : "Quelle méthode est la plus rapide ?"

**R** :
- Méthode 1 (nameservers) : **10-15 min** ✅
- Méthode 2 (CNAME) : **30-70 min**

---

## ✅ Checklist finale

### Si Méthode 1 (Nameservers - RECOMMANDÉ)

- [ ] Ignorer les CNAME affichés dans Vercel
- [ ] Hostinger → DNS / Serveurs de noms → Modifier
- [ ] Saisir `ns1.vercel-dns.com` et `ns2.vercel-dns.com`
- [ ] Enregistrer
- [ ] Attendre 10 min
- [ ] Vercel validation automatique ✅
- [ ] Plus tard : configurer email externe (Zoho/Google)

### Si Méthode 2 (CNAME manuels - Avancé)

- [ ] Noter le CNAME exact : `c11664de7c030341.vercel-dns-017.com.`
- [ ] Hostinger → Zone DNS
- [ ] Supprimer A/AAAA parking
- [ ] Ajouter A : @ → 76.76.21.21
- [ ] Ajouter CNAME : www → `c11664de7c030341.vercel-dns-017.com`
- [ ] Enregistrer
- [ ] Attendre 30-60 min
- [ ] Vercel → Refresh → "Valid Configuration"

---

## 🎯 Décision finale

**Recommandation** : **Méthode 1 (Nameservers)** 

**Raisons** :
1. Plus simple (2 valeurs vs 5+ enregistrements)
2. Plus rapide (10 min vs 60 min)
3. Zero erreur possible
4. Email externe gratuit disponible (Zoho)

**Utilisez Méthode 2 UNIQUEMENT si** :
- Email @clicetdevis.fr DÉJÀ configuré et actif chez Hostinger
- Impossibilité de migrer email

---

## 🚀 Prochaine action

**Si vous choisissez Méthode 1 (recommandé)** :
1. Fermez l'interface Vercel actuelle
2. Allez sur https://hpanel.hostinger.com/
3. Configurez nameservers `ns1.vercel-dns.com` et `ns2.vercel-dns.com`
4. Attendez 10 min
5. Vérifiez Vercel → Status "Valid" ✅

**Si vous choisissez Méthode 2** :
1. Copiez exactement : `c11664de7c030341.vercel-dns-017.com`
2. Allez sur Hostinger zone DNS
3. Configurez A + CNAME
4. Attendez 30-60 min
5. Vérifiez Vercel

**Quelle méthode choisissez-vous ?**
