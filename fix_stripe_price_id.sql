-- Instructions pour corriger le Price ID Stripe
-- 
-- ÉTAPE 1 : Créer un prix dans Stripe Dashboard
-- https://dashboard.stripe.com/test/products
-- 
-- Créer un produit "Abonnement Pro" avec prix :
-- - Montant : 29,99 EUR
-- - Facturation : Mensuelle  
-- - Essai gratuit : 7 jours
--
-- ÉTAPE 2 : Copier le Price ID (ex: price_1ABC123xyz)
--
-- ÉTAPE 3 : Exécuter cette requête dans Supabase SQL Editor
-- Remplacer 'VOTRE_NOUVEAU_PRICE_ID' par le vrai Price ID

UPDATE subscription_plans 
SET stripe_price_id = 'VOTRE_NOUVEAU_PRICE_ID'
WHERE slug = 'pro';

-- ÉTAPE 4 : Vérifier la mise à jour
SELECT slug, name, stripe_price_id 
FROM subscription_plans 
WHERE slug = 'pro';
