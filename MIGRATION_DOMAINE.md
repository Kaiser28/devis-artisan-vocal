# Migration vers clicetdevis.fr

## État actuel
- Domaine acheté : **clicetdevis.fr** (Hostinger, expiration 2027-02-13)
- Serveurs DNS actuels : ns1.dns-parking.com, ns2.dns-parking.com
- Projet Vercel : devis-artisan-vocal-f2sf.vercel.app
- Contact : contact@sferia.fr

## Étapes de migration

### 1️⃣ Ajouter le domaine dans Vercel

**Action** :
1. Ouvrir https://vercel.com/kaiser28s-projects/devis-artisan-vocal/settings/domains
2. Cliquer "Add Domain"
3. Entrer `clicetdevis.fr`
4. Cliquer "Add" puis "Add www.clicetdevis.fr" (optionnel)

**Résultat attendu** :
- Vercel affiche les enregistrements DNS requis :
  ```
  Type: A
  Name: @
  Value: 76.76.21.21
  
  Type: CNAME
  Name: www
  Value: cname.vercel-dns.com
  ```

### 2️⃣ Configurer les DNS chez Hostinger

**Action** :
1. Connexion Hostinger : https://hpanel.hostinger.com/domain/clicetdevis.fr/dns
2. Section "DNS / Serveurs de noms" → Modifier
3. Choisir "Use Hostinger nameservers" (si pas déjà fait)
4. Aller dans "Gérer" → "Zone DNS"
5. Ajouter/Modifier les enregistrements :

   **Enregistrement A** :
   - Type : A
   - Nom : @ (ou vide)
   - Pointe vers : 76.76.21.21
   - TTL : 14400

   **Enregistrement CNAME** (si www souhaité) :
   - Type : CNAME
   - Nom : www
   - Pointe vers : cname.vercel-dns.com
   - TTL : 14400

6. Supprimer les enregistrements A/AAAA existants pointant vers le parking Hostinger

**Délai** : Propagation DNS 10 min à 48h (généralement < 1h)

### 3️⃣ Vérifier le certificat SSL

**Action** :
1. Attendre 10-60 minutes
2. Tester `https://clicetdevis.fr`
3. Vercel provisionne automatiquement le certificat Let's Encrypt

**Vérification** :
```bash
# Vérifier DNS
dig clicetdevis.fr +short
# Doit retourner 76.76.21.21

# Vérifier HTTPS
curl -I https://clicetdevis.fr
# Doit retourner 200 OK
```

### 4️⃣ Mettre à jour le webhook Stripe

**Action** :
1. Ouvrir Stripe Dashboard : https://dashboard.stripe.com/test/webhooks
2. Sélectionner le webhook existant
3. Modifier l'URL endpoint :
   - Ancienne : `https://devis-artisan-vocal-f2sf.vercel.app/api/stripe/webhook`
   - Nouvelle : `https://clicetdevis.fr/api/stripe/webhook`
4. Vérifier les événements écoutés :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

**Important** : Si passage en PRODUCTION (clés live), créer un nouveau webhook avec l'URL production.

### 5️⃣ Variables d'environnement Vercel

**Vérifier** :
- `NEXT_PUBLIC_APP_URL` → `https://clicetdevis.fr` (si définie)
- `STRIPE_WEBHOOK_SECRET` → doit correspondre au webhook configuré

**Action si nécessaire** :
1. Vercel → Settings → Environment Variables
2. Ajouter/modifier `NEXT_PUBLIC_APP_URL=https://clicetdevis.fr`
3. Redéployer : `git commit --allow-empty -m "Trigger redeploy" && git push`

### 6️⃣ Redirection www → apex (optionnel)

**Si www configuré** :
- Vercel redirige automatiquement `www.clicetdevis.fr` → `clicetdevis.fr`
- Ou inverse selon préférence (configurable dans Vercel)

### 7️⃣ Tests complets

**Checklist** :
- [ ] https://clicetdevis.fr charge la landing page
- [ ] https://clicetdevis.fr/signup → inscription fonctionne
- [ ] https://clicetdevis.fr/login → connexion fonctionne
- [ ] Clic "Entrer ma CB" → Stripe Checkout affiche 29,99 €
- [ ] Paiement test → webhook reçu (vérifier logs Stripe)
- [ ] Dashboard → bouton "Gérer mon abonnement" fonctionne
- [ ] Mobile responsive OK
- [ ] Certificat SSL valide (cadenas vert)

### 8️⃣ SEO et indexation

**Actions post-migration** :
1. Google Search Console : https://search.google.com/search-console
   - Ajouter propriété `clicetdevis.fr`
   - Vérifier via DNS TXT (fourni par Google)
2. Soumettre sitemap (si configuré) : `https://clicetdevis.fr/sitemap.xml`
3. robots.txt : vérifier `https://clicetdevis.fr/robots.txt`
4. Meta tags : déjà configurés dans app/page.tsx
   - Title : "Récupérez 15h par semaine grâce à l'IA | CLIC DEVIS"
   - Description OK

### 9️⃣ Email professionnel (optionnel)

**Hostinger propose** :
- Email @clicetdevis.fr
- Configurer dans hPanel → Emails

**Alternative** :
- Google Workspace (payant)
- Zoho Mail (gratuit jusqu'à 5 utilisateurs)

### 🔟 Ancien domaine Vercel

**Options** :
1. **Conserver** : `devis-artisan-vocal-f2sf.vercel.app` reste accessible (utile pour tests)
2. **Rediriger** : Vercel redirige automatiquement vers domaine custom si configuré comme "Primary"
3. **Désactiver** : Supprimer domaine Vercel (non recommandé)

**Recommandation** : Conserver comme backup.

## Timeline

| Étape | Durée | Status |
|-------|-------|--------|
| 1. Ajouter domaine Vercel | 2 min | ⏳ À faire |
| 2. DNS Hostinger | 5 min | ⏳ À faire |
| 3. Propagation DNS | 10-60 min | ⏳ Attente |
| 4. Certificat SSL | Auto (10-60 min) | ⏳ Attente |
| 5. Webhook Stripe | 3 min | ⏳ À faire |
| 6. Variables env | 2 min (si besoin) | ⏳ À faire |
| 7. Tests complets | 15 min | ⏳ À faire |
| 8. SEO | 10 min | ⏳ Optionnel |

**Total : 30-90 minutes**

## Commandes utiles

```bash
# Vérifier DNS
dig clicetdevis.fr
dig www.clicetdevis.fr

# Tester HTTPS
curl -I https://clicetdevis.fr

# Forcer redéploiement Vercel
cd /home/user/devis-vocal
git commit --allow-empty -m "🌐 Migration domaine clicetdevis.fr"
git push origin main
```

## Rollback (si problème)

**Si migration échoue** :
1. Vercel → Settings → Domains → Supprimer `clicetdevis.fr`
2. Hostinger → DNS → Restaurer parking (`ns1.dns-parking.com`)
3. App reste accessible sur `devis-artisan-vocal-f2sf.vercel.app`

## Contacts

- Hostinger support : https://www.hostinger.fr/contact
- Vercel support : https://vercel.com/help
- Stripe support : https://support.stripe.com

## Notes

- Domaine enregistré le 2026-02-13
- Expiration : 2027-02-13 (renouvellement auto activé)
- Registraire : Hostinger
- Contact admin : contact@sferia.fr
- Téléphone : +33 698532545
