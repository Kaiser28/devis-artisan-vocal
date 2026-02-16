# GUIDE PAS-À-PAS : Configuration Nameservers Vercel

## Vous êtes bloqué dans Vercel Domains ?

### Étape actuelle
Vous voyez :
```
www.clicetdevis.fr - Invalid Configuration - Production
devis-artisan-vocal-f2sf.vercel.app - Valid Configuration - Production
```

---

## ACTION IMMÉDIATE

### 1️⃣ Cliquer sur le domaine invalide

**Dans l'interface Vercel Domains** :
- Cliquez sur la ligne `www.clicetdevis.fr` (celle avec "Invalid Configuration")
- OU cliquez sur `clicetdevis.fr` si visible dans la liste

**Résultat attendu** : Une page s'ouvre avec :
- Détails du domaine
- Section "DNS Records" ou "Nameservers"
- Options de configuration

---

## 2️⃣ Chercher l'option Nameservers

**Sur la page du domaine, cherchez** :
- Section "Nameservers" (en haut ou milieu de page)
- Bouton "Use Vercel DNS" ou "Switch to Vercel Nameservers"
- Lien "View DNS Configuration" → puis "Use Vercel Nameservers"

**Si vous trouvez cette option** :
1. Cliquez sur "Use Vercel Nameservers"
2. Vercel affichera :
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. **Copiez ces valeurs**
4. Passez à l'étape 3️⃣ ci-dessous

---

## 3️⃣ Alternative : Utiliser nameservers standards

**Si l'option "Use Vercel Nameservers" n'est PAS visible** :

✅ Utilisez directement les nameservers Vercel standards :
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Ces nameservers fonctionnent pour TOUS les projets Vercel.**

---

## 4️⃣ Configuration Hostinger (ACTION PRINCIPALE)

### A. Connexion Hostinger
1. Allez sur : https://hpanel.hostinger.com/
2. Connectez-vous avec vos identifiants

### B. Accéder au domaine
1. Menu de gauche → **"Domaines"** (ou "Domains")
2. Cliquez sur **`clicetdevis.fr`** dans la liste

### C. Modifier les Nameservers
1. Cherchez section **"DNS / Serveurs de noms"** (ou "DNS / Nameservers")
2. Cliquez sur **"Modifier"** ou **"Change Nameservers"**

### D. Interface Hostinger : 2 options possibles

**Option 1 : Si vous voyez des onglets**
- Sélectionnez l'onglet **"Utiliser des serveurs de noms personnalisés"**
- OU **"Custom nameservers"**

**Option 2 : Si vous voyez un menu déroulant**
- Sélectionnez **"Serveurs de noms personnalisés"** (au lieu de "Hostinger nameservers")

### E. Saisir les nameservers Vercel

**Champs affichés** (2 ou 4 champs) :
```
Serveur de noms 1 : ns1.vercel-dns.com
Serveur de noms 2 : ns2.vercel-dns.com
```

**Si 4 champs disponibles** :
```
Serveur de noms 1 : ns1.vercel-dns.com
Serveur de noms 2 : ns2.vercel-dns.com
Serveur de noms 3 : (laisser vide)
Serveur de noms 4 : (laisser vide)
```

### F. Sauvegarder
1. Cliquez sur **"Enregistrer"** ou **"Save"** ou **"Update Nameservers"**
2. Hostinger peut demander confirmation → **Confirmer**

**Message attendu** :
> "Les serveurs de noms ont été mis à jour avec succès. La propagation peut prendre jusqu'à 24 heures."

---

## 5️⃣ Vérification (après 5-10 minutes)

### A. Vérifier propagation nameservers

**En ligne** :
- Allez sur : https://dnschecker.org/#NS/clicetdevis.fr
- Attendez que la majorité des serveurs affichent `ns1.vercel-dns.com` et `ns2.vercel-dns.com`

**En ligne de commande** (optionnel) :
```bash
nslookup -type=NS clicetdevis.fr
```

### B. Vérifier statut Vercel

1. Retournez sur : https://vercel.com/kaiser28s-projects/devis-artisan-vocal/settings/domains
2. Attendez 5-10 minutes
3. Rafraîchissez la page (F5)
4. Le statut devrait changer :
   ```
   Avant : www.clicetdevis.fr - Invalid Configuration
   Après : www.clicetdevis.fr - Valid Configuration ✅
   ```

### C. Test HTTPS

**Après validation Vercel** (certificat SSL provisionné automatiquement) :
- Ouvrez : https://clicetdevis.fr
- Ouvrez : https://www.clicetdevis.fr
- Les deux doivent afficher votre landing page
- Cadenas vert visible dans la barre d'adresse

---

## 📸 Captures écran attendues

### Hostinger - Avant modification
```
DNS / Serveurs de noms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Serveurs de noms actuels :
  ns1.dns-parking.com
  ns2.dns-parking.com
  
[Modifier]
```

### Hostinger - Après modification
```
DNS / Serveurs de noms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Serveurs de noms actuels :
  ns1.vercel-dns.com
  ns2.vercel-dns.com
  
[Modifier]
```

### Vercel - Après validation
```
Domains
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ clicetdevis.fr - Valid Configuration - Production
✅ www.clicetdevis.fr - Valid Configuration - Production
✅ devis-artisan-vocal-f2sf.vercel.app - Valid Configuration - Production
```

---

## ⏱️ Timeline complète

| Étape | Action | Durée |
|-------|--------|-------|
| 1 | Copier nameservers Vercel | 1 min |
| 2 | Hostinger → Modifier nameservers | 2 min |
| 3 | Sauvegarder modifications | 30 sec |
| 4 | **Attente propagation DNS** | **5-15 min** |
| 5 | Vercel validation automatique | 2 min |
| 6 | Certificat SSL provisionné | Auto |
| **TOTAL** | | **10-20 min** |

---

## 🚨 Problèmes courants

### Problème 1 : "Je ne trouve pas où modifier les nameservers"

**Solution** :
1. Hostinger → Menu "Domaines" → `clicetdevis.fr`
2. Cherchez onglet/section **"DNS"** ou **"Serveurs de noms"**
3. Si introuvable, cherchez menu **"Gérer"** → **"DNS/Nameservers"**
4. Alternative : support chat Hostinger (https://www.hostinger.fr/contact)

### Problème 2 : "Hostinger refuse mes nameservers"

**Erreur possible** :
- Format incorrect (espace, majuscule, slash)

**Format correct** :
```
ns1.vercel-dns.com    ✅
ns2.vercel-dns.com    ✅

ns1.vercel-dns.com/   ❌ (pas de slash)
NS1.VERCEL-DNS.COM    ❌ (minuscules uniquement)
ns1. vercel-dns.com   ❌ (pas d'espace)
```

### Problème 3 : "Statut Vercel reste Invalid après 20 min"

**Causes possibles** :
1. Nameservers mal saisis (faute de frappe)
2. Cache DNS local
3. Propagation lente

**Solutions** :
1. Vérifier orthographe nameservers Hostinger
2. Vérifier avec https://dnschecker.org/#NS/clicetdevis.fr
3. Attendre 30-60 min supplémentaires
4. Vercel → Supprimer domaine → Re-ajouter

### Problème 4 : "Email @clicetdevis.fr ne fonctionne plus"

**Normal** :
- Nameservers Vercel = DNS géré par Vercel
- Email Hostinger désactivé

**Solution** :
- Configurer email externe (Zoho, Google) après migration
- Instructions dans section "Email professionnel" du guide

---

## ✅ Checklist complète

### Hostinger
- [ ] Connexion https://hpanel.hostinger.com/
- [ ] Menu Domaines → `clicetdevis.fr`
- [ ] Section "DNS / Serveurs de noms" → Modifier
- [ ] Sélectionner "Serveurs de noms personnalisés"
- [ ] Saisir `ns1.vercel-dns.com`
- [ ] Saisir `ns2.vercel-dns.com`
- [ ] Cliquer "Enregistrer"
- [ ] Confirmation affichée

### Vérification
- [ ] Attendre 5-10 minutes
- [ ] https://dnschecker.org/#NS/clicetdevis.fr → affiche nameservers Vercel
- [ ] Vercel Domains → Status "Valid Configuration" ✅
- [ ] https://clicetdevis.fr → charge landing page
- [ ] https://www.clicetdevis.fr → charge landing page
- [ ] Certificat SSL valide (cadenas vert)

### Post-migration
- [ ] Webhook Stripe : https://clicetdevis.fr/api/stripe/webhook
- [ ] Test inscription/paiement complet
- [ ] Email externe configuré (optionnel)
- [ ] Google Search Console ajouté

---

## 📞 Besoin d'aide ?

**Si bloqué après cette procédure** :
1. Faire capture écran interface Hostinger (section nameservers)
2. Faire capture écran interface Vercel (domains)
3. Vérifier https://dnschecker.org/#NS/clicetdevis.fr
4. Partager résultats pour diagnostic

**Support direct** :
- Hostinger chat : https://www.hostinger.fr/contact
- Vercel docs : https://vercel.com/docs/projects/domains/working-with-nameservers
