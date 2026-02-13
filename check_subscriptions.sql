-- Vérifier les abonnements actuels
SELECT 
  user_id,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  current_period_start,
  current_period_end
FROM user_subscriptions
LIMIT 5;
