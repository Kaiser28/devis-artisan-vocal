'use client'

import { useEffect, useState } from 'react'

interface Subscription {
  status: string
  plan_name: string
  stripe_customer_id?: string
  current_period_end?: string
}

export default function SubscriptionCard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    fetch('/api/subscription/status')
      .then(res => res.json())
      .then(data => {
        setSubscription(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handleManageSubscription = async () => {
    setPortalLoading(true)

    try {
      const res = await fetch('/api/stripe/customer-portal', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erreur')

      window.location.href = data.portal_url
    } catch (err: any) {
      alert(err.message)
      setPortalLoading(false)
    }
  }

  const handleSubscribe = async () => {
    setPortalLoading(true)

    try {
      const res = await fetch('/api/stripe/create-checkout-session', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erreur')

      window.location.href = data.checkout_url
    } catch (err: any) {
      alert(err.message)
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </section>
    )
  }

  const isActive = subscription && ['active', 'trialing'].includes(subscription.status)
  const hasStripeId = subscription?.stripe_customer_id

  return (
    <section className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">💳 Abonnement</h2>

      {isActive ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <p className="font-semibold text-green-900">
                ✅ {subscription.status === 'trialing' ? 'Essai gratuit actif' : 'Abonnement actif'}
              </p>
              <p className="text-sm text-green-700 mt-1">
                Plan : {subscription.plan_name}
              </p>
              {subscription.current_period_end && (
                <p className="text-xs text-green-600 mt-1">
                  Prochaine facturation : {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
            {hasStripeId && (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                {portalLoading ? '⏳' : '⚙️ Gérer'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="font-semibold text-yellow-900">⚠️ Aucun abonnement actif</p>
            <p className="text-sm text-yellow-700 mt-1">
              Démarrez votre essai gratuit de 7 jours pour accéder à toutes les fonctionnalités.
            </p>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={portalLoading}
            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {portalLoading ? '⏳ Chargement...' : '🚀 S\'abonner maintenant (7 jours gratuits)'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            29,99 €/mois après l'essai • Annulation à tout moment
          </p>
        </div>
      )}
    </section>
  )
}
