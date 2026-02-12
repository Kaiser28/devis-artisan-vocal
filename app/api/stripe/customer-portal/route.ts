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

    // Récupérer le stripe_customer_id
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Aucun abonnement Stripe trouvé' },
        { status: 404 }
      )
    }

    // Créer une session de portail client Stripe
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app`
    })

    return NextResponse.json({
      portal_url: portalSession.url
    })

  } catch (err: any) {
    console.error('Erreur création portal session:', err)
    return NextResponse.json(
      { error: err.message || 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}
