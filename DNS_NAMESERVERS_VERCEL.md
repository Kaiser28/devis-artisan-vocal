# Configuration DNS via Nameservers Vercel (MÉTHODE SIMPLE)

## Pourquoi cette méthode ?

**Avantages** :
- ✅ Configuration unique (pas d'enregistrements A/CNAME manuels)
- ✅ Vercel gère automatiquement tous les DNS
- ✅ Certificat SSL provisionné instantanément
- ✅ Pas d'erreur "Invalid Configuration"
- ✅ Mise à jour automatique si Vercel change ses IPs

**Inconvénient** :
- ⚠️ Perte de contrôle DNS chez Hostinger
- ⚠️ Email (@clicetdevis.fr) devra être configuré dans Vercel ou externe

## Procédure complète (5 minutes)

### Étape 1 : Récupérer les Nameservers Vercel

**Option A : Via l'interface Vercel**
1. Aller sur : https://vercel.com/kaiser28s-projects/devis-artisan-vocal/settings/domains
2. Cliquer sur `clicetdevis.fr` (ligne avec "Invalid Configuration")
3. Chercher section "Nameservers" ou "Use Vercel DNS"
4. Cliquer "Use Vercel Nameservers"
5. Copier les nameservers affichés (format : `ns1.vercel-dns.com`, `ns2.vercel-dns.com`)

**Option B : Nameservers Vercel standards**
Si non visibles dans l'interface, utiliser :
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### Étape 2 : Modifier les Nameservers chez Hostinger

1. **Connexion Hostinger** : https://hpanel.hostinger.com/
2. **Menu Domaines** → Sélectionner `clicetdevis.fr`
3. **DNS / Serveurs de noms** → Cliquer "Modifier"
4. **Choisir** "Changer les serveurs de noms" (ou "Custom nameservers")
5. **Remplacer** :
   ```
   Ancien :
   ns1.dns-parking.com
   ns2.dns-parking.com
   
   Nouveau :
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
6. **Sauvegarder** les modifications
7. **Confirmer** le changement (Hostinger peut demander une confirmation)

### Étape 3 : Vérification Vercel

1. Attendre **2-10 minutes** (propagation nameservers très rapide)
2. Retourner Vercel → Settings → Domains
3. Le statut `clicetdevis.fr` devrait automatiquement passer à "Valid Configuration" ✅
4. `www.clicetdevis.fr` également validé
5. Certificat SSL provisionné automatiquement

### Étape 4 : Test

```bash
# Vérifier nameservers (doit retourner ns1/ns2.vercel-dns.com)
nslookup -type=NS clicetdevis.fr

# Vérifier résolution (après quelques minutes)
nslookup clicetdevis.fr

# Test HTTPS
curl -I https://clicetdevis.fr
```

**En ligne** :
- https://dnschecker.org/#NS/clicetdevis.fr
- Doit afficher `ns1.vercel-dns.com` et `ns2.vercel-dns.com`

## Configuration post-migration

### Email professionnel (@clicetdevis.fr)

**Option 1 : Email externe (Recommandé)**
- **Google Workspace** : https://workspace.google.com (payant, ~5€/mois/user)
- **Zoho Mail** : https://www.zoho.com/mail/ (gratuit jusqu'à 5 users)
- **Mailgun** : https://www.mailgun.com/ (transactionnel)

**Configuration** :
1. Créer compte chez fournisseur email
2. Vercel → Domaines → `clicetdevis.fr` → "DNS Records"
3. Ajouter enregistrements MX fournis par le provider

**Exemple Google Workspace** :
```
Type: MX
Name: @
Priority: 1
Value: aspmx.l.google.com

Type: MX
Name: @
Priority: 5
Value: alt1.aspmx.l.google.com
```

**Option 2 : Hostinger Email (Désactivé avec nameservers Vercel)**
⚠️ En utilisant nameservers Vercel, l'email Hostinger ne fonctionnera plus.
Solution : migrer vers fournisseur externe.

### Sous-domaines additionnels

**Ajout facile dans Vercel** :
1. Vercel → Domaines → `clicetdevis.fr` → "DNS Records"
2. Ajouter enregistrements :
   ```
   Type: CNAME
   Name: api
   Value: cname.vercel-dns.com
   
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```
3. Résultat : `api.clicetdevis.fr`, `app.clicetdevis.fr` pointent vers Vercel

## Timeline

| Étape | Durée |
|-------|-------|
| 1. Récupérer nameservers Vercel | 1 min |
| 2. Modifier Hostinger | 2 min |
| 3. Propagation nameservers | 2-10 min |
| 4. Validation Vercel | Automatique |
| 5. Certificat SSL | Automatique |
| **Total** | **5-15 minutes** |

## Comparaison méthodes

| Critère | Nameservers Vercel | DNS manuels (A/CNAME) |
|---------|-------------------|----------------------|
| Complexité | ⭐ Simple | ⭐⭐⭐ Complexe |
| Temps config | 5 min | 30-70 min |
| Erreurs | Aucune | Fréquentes |
| Email Hostinger | ❌ Non compatible | ✅ Compatible |
| Gestion DNS | Vercel | Hostinger |
| Recommandation | ✅ OUI | ❌ Non (sauf besoin email Hostinger) |

## Rollback (si nécessaire)

**Revenir aux nameservers Hostinger** :
1. Hostinger → DNS / Serveurs de noms → Modifier
2. Choisir "Use Hostinger nameservers"
3. Nameservers restaurés :
   ```
   ns1.dns-parking.com
   ns2.dns-parking.com
   ```
4. Reconfigurer DNS manuellement (A/CNAME)

## Checklist complète

- [ ] Récupérer nameservers Vercel (ns1/ns2.vercel-dns.com)
- [ ] Hostinger → DNS / Serveurs de noms → Modifier
- [ ] Remplacer par nameservers Vercel
- [ ] Sauvegarder modifications
- [ ] Attendre 5-10 minutes
- [ ] Vercel → Refresh → "Valid Configuration" ✅
- [ ] Tester https://clicetdevis.fr
- [ ] Tester https://www.clicetdevis.fr
- [ ] Certificat SSL valide (cadenas vert)
- [ ] Webhook Stripe : https://clicetdevis.fr/api/stripe/webhook
- [ ] Test inscription/paiement complet

## Prochaines étapes après validation

1. ✅ Domaine opérationnel
2. 🔄 Mettre à jour webhook Stripe
3. 📧 Configurer email @clicetdevis.fr (Zoho/Google)
4. 🧪 Tests complets flow utilisateur
5. 📊 Google Search Console
6. 🚀 Communication officielle nouveau domaine

## Support

**Vercel DNS** :
- Documentation : https://vercel.com/docs/projects/domains/working-with-nameservers
- Support : https://vercel.com/help

**Hostinger Nameservers** :
- Guide : https://support.hostinger.com/en/articles/1583227-how-to-change-nameservers-at-hostinger
- Chat : https://www.hostinger.fr/contact
