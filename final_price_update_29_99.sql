-- MISE À JOUR FINALE : Price ID 29,99€
-- Price ID récupéré : price_1T0B4FHalE8knkOxuEvWefsc
-- Montant : 29,99 EUR/mois
-- Essai gratuit : 7 jours (configuré dans le code)

UPDATE subscription_plans 
SET stripe_price_id = 'price_1T0B4FHalE8knkOxuEvWefsc'
WHERE slug = 'pro';

-- Vérifier la mise à jour
SELECT slug, name, price, stripe_price_id 
FROM subscription_plans 
WHERE slug = 'pro';

-- RÉSULTAT ATTENDU :
-- slug: pro
-- name: Plan Pro  
-- price: 29.99
-- stripe_price_id: price_1T0B4FHalE8knkOxuEvWefsc

-- ÉTAT DES PRIX DANS STRIPE :
-- Prix 1 : price_1T0AcgHalE8knkOxj2swyCc4 → 1,00 EUR (votre abonnement actif)
-- Prix 2 : price_1T0B4FHalE8knkOxuEvWefsc → 29,99 EUR (nouveaux clients)

-- CONFIRMATION :
-- ✅ Votre abonnement reste à 1€ (grandfathering)
-- ✅ Nouveaux clients paieront 29,99€
-- ✅ Essai gratuit 7 jours maintenu
