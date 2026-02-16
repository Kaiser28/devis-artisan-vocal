# Vérification propagation DNS nameservers

## ✅ Configuration Vercel correcte

Vercel affiche maintenant :
```
Update your domain's nameservers to enable Vercel DNS.
Nameservers:
  ns1.vercel-dns.com
  ns2.vercel-dns.com
```

**Cela signifie** : Vercel attend que vous configuriez ces nameservers chez Hostinger.

---

## 🔍 Comment vérifier la propagation DNS ?

### Méthode 1 : En ligne (RECOMMANDÉ)

**DNS Checker - Propagation mondiale** :
1. Ouvrir : https://dnschecker.org/#NS/clicetdevis.fr
2. Dans le menu déroulant, sélectionner "NS" (Nameserver)
3. Saisir : `clicetdevis.fr`
4. Cliquer "Search"

**Résultat attendu** :
```
✅ Propagé (vert) : ns1.vercel-dns.com, ns2.vercel-dns.com
⏳ En cours (orange) : mélange ancien/nouveau
❌ Non propagé (rouge) : ns1.dns-parking.com, ns2.dns-parking.com
```

**Propagation complète** : Majorité des serveurs (>70%) affichent nameservers Vercel

---

### Méthode 2 : Ligne de commande (si disponible)

**Windows** :
```cmd
nslookup -type=NS clicetdevis.fr
```

**Mac / Linux** :
```bash
dig NS clicetdevis.fr +short
```

**Résultat attendu** :
```
ns1.vercel-dns.com.
ns2.vercel-dns.com.
```

**Si vous voyez encore** :
```
ns1.dns-parking.com.
ns2.dns-parking.com.
```
→ Propagation pas encore terminée, attendre 5-10 min supplémentaires

---

### Méthode 3 : Via Google Public DNS

**Test en ligne** :
- Ouvrir : https://dns.google/query?name=clicetdevis.fr&type=NS

**Résultat attendu (JSON)** :
```json
{
  "Answer": [
    {
      "name": "clicetdevis.fr.",
      "type": 2,
      "data": "ns1.vercel-dns.com."
    },
    {
      "name": "clicetdevis.fr.",
      "type": 2,
      "data": "ns2.vercel-dns.com."
    }
  ]
}
```

---

### Méthode 4 : Vérifier dans Hostinger

**Confirmation visuelle** :
1. Connexion : https://hpanel.hostinger.com/
2. Menu "Domaines" → `clicetdevis.fr`
3. Section "DNS / Serveurs de noms"

**Doit afficher** :
```
Serveurs de noms actuels :
  ns1.vercel-dns.com
  ns2.vercel-dns.com
```

**Si vous voyez encore** :
```
  ns1.dns-parking.com
  ns2.dns-parking.com
```
→ Modification pas encore enregistrée, refaire la configuration

---

## ⏱️ Timeline de propagation

| Temps écoulé | État attendu | Action |
|--------------|--------------|--------|
| 0-2 min | Hostinger enregistre modification | Attendre |
| 2-5 min | Propagation vers DNS racine | Vérifier DNS Checker |
| 5-10 min | Propagation mondiale partielle | Voir mix ancien/nouveau |
| 10-15 min | Propagation majoritaire | >70% serveurs OK |
| 15-30 min | Propagation complète | 100% serveurs OK |
| 30+ min | Vercel détecte changement | Status "Valid" ✅ |

**Maximum** : 24-48h (théorique), généralement **10-30 minutes**

---

## ✅ Checklist vérification complète

### Étape 1 : Vérifier configuration Hostinger (maintenant)
- [ ] https://hpanel.hostinger.com/ → Domaines → `clicetdevis.fr`
- [ ] Section "DNS / Serveurs de noms" affiche `ns1.vercel-dns.com` et `ns2.vercel-dns.com`
- [ ] Si NON : refaire configuration (voir section "Problème" ci-dessous)

### Étape 2 : Vérifier propagation DNS (après 5 min)
- [ ] https://dnschecker.org/#NS/clicetdevis.fr
- [ ] Majorité des serveurs (>50%) affichent nameservers Vercel
- [ ] Attendre si propagation < 50%

### Étape 3 : Vérifier statut Vercel (après 15 min)
- [ ] https://vercel.com/kaiser28s-projects/devis-artisan-vocal/settings/domains
- [ ] Rafraîchir page (F5)
- [ ] Status `www.clicetdevis.fr` → "Valid Configuration" ✅
- [ ] Si NON : attendre 10 min supplémentaires, re-vérifier

### Étape 4 : Tester HTTPS (après validation Vercel)
- [ ] https://clicetdevis.fr → Charge landing page
- [ ] https://www.clicetdevis.fr → Charge landing page
- [ ] Certificat SSL valide (cadenas vert navigateur)

---

## 🚨 Problèmes courants

### Problème 1 : "Hostinger affiche encore anciens nameservers après 5 min"

**Cause** : Modification pas enregistrée correctement

**Solution** :
1. Hostinger → Domaines → `clicetdevis.fr`
2. DNS / Serveurs de noms → Modifier
3. **Re-saisir** :
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
4. **Bien cliquer "Enregistrer"** / "Save" / "Update"
5. Chercher message confirmation : "Nameservers updated successfully"

---

### Problème 2 : "DNS Checker affiche mélange ancien/nouveau après 30 min"

**Cause** : Propagation en cours (normal)

**Solution** :
- Attendre 30-60 min supplémentaires
- Vérifier cache DNS local (vider si possible)
- Tester en navigation privée

**Vider cache DNS** :
```bash
# Windows
ipconfig /flushdns

# Mac
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches
```

---

### Problème 3 : "Vercel status reste Invalid après 60 min"

**Causes possibles** :
1. Nameservers pas configurés chez Hostinger
2. Faute de frappe dans nameservers
3. Cache Vercel

**Solutions** :
1. Vérifier orthographe exacte :
   ```
   ns1.vercel-dns.com  ✅
   ns2.vercel-dns.com  ✅
   
   ns1.vercel-dns.com/ ❌ (pas de slash)
   ns1.vercel.dns.com  ❌ (faute)
   ns1 .vercel-dns.com ❌ (espace)
   ```
2. Vérifier https://dnschecker.org/#NS/clicetdevis.fr → >70% propagation
3. Vercel → Domaines → `www.clicetdevis.fr` → Menu "..." → "Refresh DNS"
4. Si échec persistant : Supprimer domaine Vercel → Attendre 5 min → Re-ajouter

---

### Problème 4 : "HTTPS ne fonctionne pas après validation"

**Cause** : Certificat SSL en cours de provisionnement

**Solution** :
- Attendre 10-30 min après validation Vercel
- Vercel provisionne automatiquement certificat Let's Encrypt
- Tester en navigation privée (éviter cache)

---

## 📊 Tableaux de diagnostic

### État DNS Checker après 10 minutes

| Propagation | Diagnostic | Action |
|-------------|-----------|--------|
| 0-20% Vercel NS | Modification récente | Attendre 10 min |
| 20-70% Vercel NS | Propagation normale | Attendre 10-20 min |
| >70% Vercel NS | Propagation OK | Vérifier Vercel status |
| 100% Vercel NS | Propagation complète | Tester HTTPS |
| 0% Vercel NS | Erreur config | Re-vérifier Hostinger |

---

### État Vercel après propagation DNS

| Status Vercel | DNS propagation | Diagnostic | Action |
|---------------|----------------|-----------|--------|
| Invalid | <50% | Normal | Attendre propagation |
| Invalid | >70% | Cache Vercel | Refresh DNS / Attendre |
| Valid ✅ | >70% | OK | Tester HTTPS |
| Valid ✅ | 100% | Parfait | Migration complète ✅ |

---

## 🎯 Actions immédiates (maintenant)

### 1. Vérifier Hostinger (2 min)
```
https://hpanel.hostinger.com/
→ Domaines → clicetdevis.fr → DNS / Serveurs de noms
```

**Doit afficher** :
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Si non** : Refaire configuration nameservers

---

### 2. Vérifier propagation DNS (2 min)
```
https://dnschecker.org/#NS/clicetdevis.fr
```

**Résultat attendu** :
- 0-10 min après modif : 0-30% propagation
- 10-20 min après : 30-80% propagation
- 20-30 min après : >80% propagation

**Si 0% après 10 min** : Problème config Hostinger

---

### 3. Attendre selon propagation

| Propagation actuelle | Attente recommandée |
|---------------------|-------------------|
| 0-20% | 15 min |
| 20-50% | 10 min |
| 50-80% | 5 min |
| >80% | Vérifier Vercel maintenant |

---

### 4. Vérifier Vercel status

**Après propagation >70%** :
1. https://vercel.com/kaiser28s-projects/devis-artisan-vocal/settings/domains
2. Rafraîchir (F5)
3. Status devrait être "Valid Configuration" ✅

**Si reste Invalid** :
- Cliquer sur `www.clicetdevis.fr` → Menu "..." → "Refresh DNS"
- Attendre 5 min
- Re-vérifier

---

## ✅ Propagation complète confirmée quand :

1. ✅ Hostinger affiche `ns1/ns2.vercel-dns.com`
2. ✅ DNS Checker : >80% serveurs avec nameservers Vercel
3. ✅ Vercel status : "Valid Configuration"
4. ✅ https://clicetdevis.fr charge landing page
5. ✅ https://www.clicetdevis.fr charge landing page
6. ✅ Certificat SSL valide (cadenas vert)

---

## 🔗 Liens utiles

- **Vérification propagation** : https://dnschecker.org/#NS/clicetdevis.fr
- **Hostinger domaines** : https://hpanel.hostinger.com/
- **Vercel domaines** : https://vercel.com/kaiser28s-projects/devis-artisan-vocal/settings/domains
- **Google DNS query** : https://dns.google/query?name=clicetdevis.fr&type=NS

---

## 📞 Prochaines étapes

**Une fois "Valid Configuration" dans Vercel** :

1. 🔄 Mettre à jour webhook Stripe : `https://clicetdevis.fr/api/stripe/webhook`
2. 🧪 Tester flow complet : inscription → paiement → dashboard
3. 📧 Configurer email @clicetdevis.fr (Zoho/Google)
4. 📊 Ajouter domaine dans Google Search Console
5. 🚀 Communication officielle nouveau domaine

---

**Vérifiez maintenant Hostinger et DNS Checker, puis partagez les résultats.**
