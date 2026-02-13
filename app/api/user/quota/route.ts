import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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

    // Appeler la fonction PostgreSQL check_user_access
    const { data, error } = await supabase
      .rpc('check_user_access', { p_user_id: user.id })
      .single()

    if (error) {
      console.error('Erreur check_user_access:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des quotas' },
        { status: 500 }
      )
    }

    // Récupérer stripe_customer_id séparément
    const { data: subData } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    // Si aucune donnée (pas d'abonnement), retourner valeurs par défaut
    if (!data) {
      return NextResponse.json({
        has_access: false,
        status: 'no_subscription',
        trial_ends_at: null,
        devis_remaining: 0,
        user_id: user.id,
        email: user.email,
        stripe_customer_id: null
      })
    }

    // Retourner les données d'accès
    return NextResponse.json({
      has_access: (data as any).has_access,
      status: (data as any).status,
      trial_ends_at: (data as any).trial_ends_at,
      devis_remaining: (data as any).devis_remaining,
      user_id: user.id,
      email: user.email,
      stripe_customer_id: subData?.stripe_customer_id || null
    })

  } catch (err) {
    console.error('Erreur serveur /api/user/quota:', err)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}
