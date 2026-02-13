-- VÉRIFIER l'état actuel de subscription_plans dans Supabase
SELECT 
  id,
  slug,
  name,
  price,
  stripe_price_id,
  created_at,
  updated_at
FROM subscription_plans
WHERE slug = 'pro';

-- Si le stripe_price_id est incorrect, le mettre à jour :
UPDATE subscription_plans 
SET 
  stripe_price_id = 'price_1T0AcgHalE8knkOxj2swyCc4',
  updated_at = NOW()
WHERE slug = 'pro';

-- Vérifier à nouveau
SELECT 
  id,
  slug,
  name,
  stripe_price_id
FROM subscription_plans
WHERE slug = 'pro';
