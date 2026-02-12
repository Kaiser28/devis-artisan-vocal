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
            <div className="flex gap-3">
              <a
                href="/clients"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                👥 Clients
              </a>
              <a
                href="/devis"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                📄 Devis
              </a>
              <a
                href="/base-prix"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                💰 Base de prix
              </a>
              <a
                href="/parametres"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                ⚙️ Paramètres
              </a>
              <LogoutButton />
            </div>
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

        {/* Accès rapides */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🚀 Accès rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/devis/nouveau"
              className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl hover:shadow-lg transition-all border-2 border-indigo-200"
            >
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Créer un devis</h3>
              <p className="text-sm text-gray-600">Formulaire classique avec autocomplétion</p>
            </a>
            <a
              href="/chat"
              className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-lg transition-all border-2 border-green-200"
            >
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Assistant IA avec dictée vocale</h3>
              <p className="text-sm text-gray-600">Discutez ou dictez vos devis à l'oral</p>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
