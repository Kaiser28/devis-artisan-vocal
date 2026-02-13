-- SOLUTION RAPIDE : Créer un prix test à 1€
-- 
-- OPTION A : Via Dashboard Stripe (RECOMMANDÉ)
-- =============================================
-- 1. Allez sur https://dashboard.stripe.com/test/products
-- 2. Créez un nouveau produit :
--    - Nom : "Abonnement Pro - Test 1€"
--    - Prix : 1,00 EUR
--    - Facturation : Mensuelle
--    - Essai gratuit : 7 jours
-- 3. Copiez le Price ID (ex: price_1ABC123xyz)
-- 4. Exécutez dans Supabase SQL Editor :

UPDATE subscription_plans 
SET stripe_price_id = 'VOTRE_PRICE_ID_1_EURO'
WHERE slug = 'pro';

-- OPTION B : Via API Stripe (si vous avez des clés valides)
-- ==========================================================
-- Créer le produit et prix automatiquement via curl
-- (nécessite clé API valide)

-- ÉTAPE SUIVANTE : Passer au prix réel 29,99€
-- ============================================
-- 1. Créez un nouveau prix sur le MÊME produit :
--    - Prix : 29,99 EUR
--    - Gardez les autres paramètres identiques
-- 2. Mettez à jour Supabase avec le nouveau Price ID
-- 3. Les NOUVEAUX abonnés paieront 29,99€
-- 4. Les abonnés existants à 1€ continueront à 1€ (sauf si vous migrez)

-- NOTE IMPORTANTE :
-- ================
-- Stripe permet d'avoir plusieurs prix pour le même produit.
-- Vous pouvez donc :
-- - Créer prix 1€ maintenant pour tests
-- - Créer prix 29,99€ plus tard
-- - Changer le Price ID dans Supabase quand vous êtes prêt
-- - Les anciens abonnements restent à leur prix initial
