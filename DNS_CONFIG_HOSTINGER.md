# Configuration DNS Hostinger pour clicetdevis.fr

## Problème détecté
Vercel affiche "Invalid Configuration" pour `clicetdevis.fr` et `www.clicetdevis.fr`

## Solution : Configurer les DNS chez Hostinger

### Étape 1 : Accéder à la zone DNS Hostinger

1. Connexion : https://hpanel.hostinger.com/
2. Menu "Domaines" → Sélectionner `clicetdevis.fr`
3. Cliquer "DNS / Serveurs de noms"
4. Cliquer "Gérer les enregistrements DNS" ou "Modifier la zone DNS"

### Étape 2 : Vérifier les DNS Vercel requis

Dans Vercel, cliquer sur `clicetdevis.fr` → "View DNS Records" pour voir les valeurs exactes.

**Configuration standard Vercel** :

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**OU si Vercel utilise CNAME pour apex** :

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Étape 3 : Configuration dans Hostinger

#### Option A : DNS Management (Gestion DNS)

**Supprimer les enregistrements existants** :
- Supprimer tout enregistrement A pointant vers l'IP parking Hostinger
- Supprimer tout enregistrement AAAA (IPv6) vers parking
- Conserver les enregistrements MX (email) si configurés

**Ajouter les enregistrements Vercel** :

1. **Pour le domaine principal (clicetdevis.fr)** :
   - Type : `A`
   - Nom : `@` (ou laisser vide selon interface)
   - Pointe vers : `76.76.21.21`
   - TTL : `14400` ou `Auto`
   - Cliquer "Ajouter l'enregistrement"

2. **Pour www.clicetdevis.fr** :
   - Type : `CNAME`
   - Nom : `www`
   - Pointe vers : `cname.vercel-dns.com`
   - TTL : `14400` ou `Auto`
   - Cliquer "Ajouter l'enregistrement"

#### Option B : Nameservers Vercel (Alternative avancée)

**Si configuration DNS personnalisée ne fonctionne pas** :

1. Dans Vercel → Domaines → `clicetdevis.fr` → "Use Vercel Nameservers"
2. Vercel fournira :
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. Hostinger → DNS / Serveurs de noms → "Modifier"
4. Choisir "Serveurs de noms personnalisés"
5. Remplacer par :
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
6. Sauvegarder

**⚠️ Attention** : Cette option transfère la gestion DNS complète à Vercel. Perte de contrôle des MX (email), TXT, etc.

### Étape 4 : Vérification Vercel

1. Retourner Vercel → Settings → Domains
2. Attendre 5-10 minutes
3. Cliquer "Refresh" à côté de `clicetdevis.fr`
4. Le statut devrait passer de "Invalid Configuration" à "Valid Configuration"
5. Certificat SSL provisionné automatiquement

### Étape 5 : Tester la propagation DNS

**En ligne de commande** :
```bash
# Vérifier DNS (doit retourner 76.76.21.21)
nslookup clicetdevis.fr

# Vérifier www (doit retourner cname.vercel-dns.com)
nslookup www.clicetdevis.fr

# Test HTTPS (après validation)
curl -I https://clicetdevis.fr
```

**En ligne** :
- https://dnschecker.org/#A/clicetdevis.fr
- Vérifier propagation mondiale (peut prendre 24-48h, généralement < 1h)

### Étape 6 : Forcer la vérification Vercel

Si après 10 minutes le statut reste "Invalid" :

1. Vercel → Domaines → `clicetdevis.fr` → "..." (menu 3 points)
2. Cliquer "Remove Domain"
3. Attendre 2 minutes
4. "Add Domain" → Re-saisir `clicetdevis.fr`
5. Vercel re-vérifie les DNS

### Timeline

| Étape | Durée |
|-------|-------|
| Configuration DNS Hostinger | 5 min |
| Propagation DNS minimale | 10-30 min |
| Vérification Vercel | 2-5 min |
| Certificat SSL | Auto (10-30 min) |
| **Total** | **30-70 min** |

## Checklist complète

- [ ] Accéder zone DNS Hostinger
- [ ] Supprimer enregistrements A/AAAA parking
- [ ] Ajouter A record : @ → 76.76.21.21
- [ ] Ajouter CNAME : www → cname.vercel-dns.com
- [ ] Attendre 10 minutes
- [ ] Refresh Vercel → "Valid Configuration"
- [ ] Tester https://clicetdevis.fr
- [ ] Tester https://www.clicetdevis.fr
- [ ] Vérifier certificat SSL (cadenas vert)
- [ ] Tester inscription/paiement complet

## Troubleshooting

### Problème : "Invalid Configuration" persiste après 30 min

**Causes possibles** :
1. DNS mal configurés chez Hostinger
2. Cache DNS local
3. TTL ancien enregistrement parking

**Solutions** :
1. Vérifier enregistrements Hostinger (Type, Nom, Valeur)
2. Utiliser https://dnschecker.org pour voir propagation mondiale
3. Vider cache DNS local :
   - Windows : `ipconfig /flushdns`
   - Mac : `sudo dscacheutil -flushcache`
   - Linux : `sudo systemd-resolve --flush-caches`
4. Tester en navigation privée
5. Contacter support Hostinger si DNS OK mais Vercel refuse

### Problème : "www" fonctionne mais pas "clicetdevis.fr"

**Cause** : Enregistrement A manquant ou incorrect

**Solution** :
1. Vérifier dans Hostinger : enregistrement A avec nom "@" pointe vers 76.76.21.21
2. Supprimer tout autre A pointant vers parking
3. Attendre 10 min
4. Refresh Vercel

### Problème : "clicetdevis.fr" fonctionne mais pas "www"

**Cause** : CNAME manquant ou incorrect

**Solution** :
1. Hostinger : CNAME avec nom "www" pointe vers cname.vercel-dns.com
2. Pas de slash final dans la valeur CNAME
3. TTL = 14400 ou Auto

### Problème : Certificat SSL invalide

**Cause** : Vercel n'a pas encore provisionné Let's Encrypt

**Solution** :
1. Attendre 30-60 minutes
2. Vercel → Domaines → "Renew Certificate"
3. Si échec, supprimer/réajouter domaine

## Valeurs DNS exactes attendues

**Après configuration correcte** :

```bash
$ dig clicetdevis.fr +short
76.76.21.21

$ dig www.clicetdevis.fr +short
cname.vercel-dns.com.
76.76.21.21
```

## Contact Support

**Hostinger** :
- Chat : https://www.hostinger.fr/contact
- Email : support@hostinger.com

**Vercel** :
- Documentation : https://vercel.com/docs/projects/domains
- Support : https://vercel.com/help

## Prochaine étape après validation

Une fois "Valid Configuration" affiché :
1. Mettre à jour webhook Stripe : `https://clicetdevis.fr/api/stripe/webhook`
2. Tester flow complet inscription/paiement
3. Vérifier responsive mobile
4. SEO : Google Search Console
