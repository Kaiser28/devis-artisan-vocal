import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier si l'utilisateur a déjà un abonnement actif
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('status, stripe_customer_id, stripe_subscription_id')
      .eq('user_id', user.id)
      .single()

    // Si déjà abonné actif, rediriger vers le portail client
    if (existingSub && existingSub.status === 'active') {
      return NextResponse.json(
        { error: 'Vous avez déjà un abonnement actif', redirect: '/api/stripe/customer-portal' },
        { status: 400 }
      )
    }

    // Récupérer le plan Pro
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('stripe_price_id')
      .eq('slug', 'pro')
      .single()

    if (planError || !plan?.stripe_price_id) {
      return NextResponse.json(
        { error: 'Plan Pro introuvable' },
        { status: 500 }
      )
    }

    // Créer la Checkout Session Stripe
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?canceled=true`,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: user.id
        }
      },
      metadata: {
        user_id: user.id
      }
    })

    return NextResponse.json({
      checkout_url: session.url
    })

  } catch (err: any) {
    console.error('Erreur création checkout session:', err)
    return NextResponse.json(
      { error: err.message || 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}
