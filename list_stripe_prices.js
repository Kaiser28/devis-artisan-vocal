const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function listPrices() {
  try {
    console.log('🔍 Listing all Stripe prices...\n');
    
    const prices = await stripe.prices.list({
      limit: 10,
      expand: ['data.product']
    });
    
    if (prices.data.length === 0) {
      console.log('❌ No prices found. Creating a new one...\n');
      
      // Créer un produit
      const product = await stripe.products.create({
        name: 'Abonnement Pro',
        description: 'Accès illimité aux fonctionnalités de devis vocal'
      });
      
      console.log('✅ Product created:', product.id);
      
      // Créer un prix avec essai gratuit
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 2999, // 29,99 EUR
        currency: 'eur',
        recurring: {
          interval: 'month',
          trial_period_days: 7
        }
      });
      
      console.log('✅ Price created:', price.id);
      console.log('\n📋 UPDATE SUPABASE WITH THIS PRICE ID:');
      console.log(`   ${price.id}`);
      console.log('\n📋 SQL TO RUN:');
      console.log(`   UPDATE subscription_plans SET stripe_price_id = '${price.id}' WHERE slug = 'pro';`);
      
    } else {
      console.log('📋 Existing prices:\n');
      prices.data.forEach(price => {
        console.log(`ID: ${price.id}`);
        console.log(`Product: ${price.product?.name || price.product}`);
        console.log(`Amount: ${price.unit_amount / 100} ${price.currency.toUpperCase()}`);
        console.log(`Recurring: ${price.recurring?.interval || 'N/A'}`);
        console.log(`Active: ${price.active}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listPrices();
