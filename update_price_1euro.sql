-- Mettre à jour le Price ID avec le prix 1€ test
UPDATE subscription_plans 
SET stripe_price_id = 'price_1T0AcgHalE8knkOxj2swyCc4'
WHERE slug = 'pro';

-- Vérifier la mise à jour
SELECT slug, name, price, stripe_price_id 
FROM subscription_plans 
WHERE slug = 'pro';
