import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import SubscriptionStatus from './SubscriptionStatus'
import SubscribeButton from './SubscribeButton'
import ManageSubscriptionButton from './ManageSubscriptionButton'

export default async function AppPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer le statut d'abonnement (server-side)
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single()

  const hasActiveSubscription = subscription && ['trialing', 'active'].includes(subscription.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-1">Bienvenue, {user.email}</p>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Statut abonnement */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Mon abonnement</h2>
          <SubscriptionStatus />
          
          <div className="mt-6">
            {hasActiveSubscription ? (
              <ManageSubscriptionButton />
            ) : (
              <SubscribeButton />
            )}
          </div>
        </div>

        {/* Section devis (placeholder) */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Mes devis</h2>
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🎤</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Reconnaissance vocale</h3>
            <p className="text-gray-600 mb-6">Créez vos devis en dictant simplement les informations</p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              🎙️ Créer un devis vocal
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
