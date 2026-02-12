import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Désactiver le parsing automatique du body (nécessaire pour Stripe webhook)
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // Debug: Vérifier que la clé webhook est présente
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET est undefined !')
      return NextResponse.json(
        { error: 'Webhook secret non configuré' },
        { status: 500 }
      )
    }
    
    console.log('🔑 Webhook secret présent:', webhookSecret.substring(0, 10) + '...')
    
    // Vérifier la signature Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
    
    console.log('✅ Signature webhook validée, événement:', event.type)
  } catch (err: any) {
    console.error('❌ Erreur signature webhook:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Client Supabase avec service_role pour bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id

        if (!userId) {
          console.error('user_id manquant dans metadata')
          break
        }

        const subscriptionId = session.subscription as string
        const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId)
        
        // Cast explicite pour TypeScript
        const subscription = subscriptionResponse as Stripe.Subscription

        // Récupérer le plan_id depuis subscription_plans
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('slug', 'pro')
          .single()

        if (!plan) {
          console.error('Plan Pro introuvable')
          break
        }

        // Vérifier si un abonnement existe déjà
        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', userId)
          .single()

        // Helper pour convertir timestamp Unix en ISO string de manière sécurisée
        const toISOStringOrNull = (timestamp: number | null | undefined): string | null => {
          if (!timestamp || typeof timestamp !== 'number' || timestamp <= 0) return null
          try {
            return new Date(timestamp * 1000).toISOString()
          } catch {
            return null
          }
        }

        const subscriptionData = {
          user_id: userId,
          plan_id: plan.id,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          trial_ends_at: toISOStringOrNull(subscription.trial_end as number),
          // @ts-ignore - Stripe type incomplet
          current_period_start: toISOStringOrNull(subscription.current_period_start),
          // @ts-ignore - Stripe type incomplet
          current_period_end: toISOStringOrNull(subscription.current_period_end)
        }

        if (existingSub) {
          // Mettre à jour l'abonnement existant
          await supabase
            .from('user_subscriptions')
            .update(subscriptionData)
            .eq('id', existingSub.id)
        } else {
          // Créer un nouvel abonnement
          await supabase
            .from('user_subscriptions')
            .insert(subscriptionData)
        }

        console.log('✅ Abonnement créé/mis à jour:', userId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Helper pour convertir timestamp Unix en ISO string de manière sécurisée
        const toISOStringOrNull = (timestamp: number | null | undefined): string | null => {
          if (!timestamp || typeof timestamp !== 'number' || timestamp <= 0) return null
          try {
            return new Date(timestamp * 1000).toISOString()
          } catch {
            return null
          }
        }

        await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            trial_ends_at: toISOStringOrNull(subscription.trial_end as number),
            // @ts-ignore - Stripe type incomplet
            current_period_start: toISOStringOrNull(subscription.current_period_start),
            // @ts-ignore - Stripe type incomplet
            current_period_end: toISOStringOrNull(subscription.current_period_end),
            canceled_at: toISOStringOrNull(subscription.canceled_at as number)
          })
          .eq('stripe_customer_id', customerId)

        console.log('✅ Abonnement mis à jour:', customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId)

        console.log('✅ Abonnement annulé:', customerId)
        break
      }

      default:
        console.log(`Event non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (err: any) {
    console.error('Erreur traitement webhook:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
