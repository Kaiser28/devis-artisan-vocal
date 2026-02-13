-- Créer un nouveau prix 29,99€ dans Stripe
-- 
-- ÉTAPE 1 : Dans Stripe Dashboard
-- https://dashboard.stripe.com/test/products
-- 
-- Sur le produit existant "Abonnement Pro - Test 1€" :
-- 1. Cliquez "Ajouter un prix"
-- 2. Prix : 29,99 EUR
-- 3. Facturation : Récurrente / Mensuelle
-- 4. Copiez le Price ID (price_xxxxx)
--
-- ÉTAPE 2 : Mettre à jour Supabase avec le nouveau Price ID

UPDATE subscription_plans 
SET stripe_price_id = 'VOTRE_NOUVEAU_PRICE_ID_29_99_EUR'
WHERE slug = 'pro';

-- Vérifier
SELECT slug, name, price, stripe_price_id 
FROM subscription_plans 
WHERE slug = 'pro';

-- RÉSULTAT ATTENDU :
-- slug: pro
-- name: Plan Pro
-- price: 29.99
-- stripe_price_id: price_xxxxx (votre nouveau Price ID à 29,99€)

-- NOTE IMPORTANTE :
-- Votre abonnement actuel à 1€ reste à 1€ (grandfathering automatique Stripe)
-- Seuls les NOUVEAUX abonnements paieront 29,99€
