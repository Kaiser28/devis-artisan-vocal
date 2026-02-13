import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer l'abonnement
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        status,
        stripe_customer_id,
        stripe_subscription_id,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        subscription_plans (
          name,
          slug
        )
      `)
      .eq('user_id', user.id)
      .single()

    // Si pas d'abonnement, retourner un objet vide avec status null
    if (subError || !subscription) {
      return NextResponse.json({
        status: null,
        plan_name: 'Aucun',
        stripe_customer_id: null
      })
    }

    const planData = Array.isArray(subscription.subscription_plans) 
      ? subscription.subscription_plans[0] 
      : subscription.subscription_plans

    return NextResponse.json({
      status: subscription.status,
      plan_name: planData?.name || 'Inconnu',
      stripe_customer_id: subscription.stripe_customer_id,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end
    })

  } catch (err: any) {
    console.error('Erreur récupération status:', err)
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
