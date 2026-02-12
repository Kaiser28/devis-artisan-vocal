'use client'

import { useEffect, useState } from 'react'

interface QuotaData {
  has_access: boolean
  status: string
  trial_ends_at: string | null
  devis_remaining: number
  user_id: string
  email: string
}

export default function SubscriptionStatus() {
  const [data, setData] = useState<QuotaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/user/quota')
      .then(res => res.json())
      .then(data => {
        setData(data)
        
        // Calculer jours restants du trial
        if (data.trial_ends_at) {
          const trialEnd = new Date(data.trial_ends_at)
          const now = new Date()
          const diff = trialEnd.getTime() - now.getTime()
          const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
          setDaysRemaining(days > 0 ? days : 0)
        }
        
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur quota:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-red-50 rounded-xl p-6">
        <p className="text-red-800">❌ Impossible de charger les informations d'abonnement</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Badge statut */}
      {data.status === 'trialing' && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">🎁 Période d'essai gratuite</h3>
          <p className="text-indigo-100 text-lg">
            {daysRemaining !== null && daysRemaining > 0 
              ? `Plus que ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`
              : 'Votre essai expire aujourd\'hui'}
          </p>
          <p className="text-indigo-200 text-sm mt-2">Accès illimité pendant la période d'essai</p>
        </div>
      )}

      {data.status === 'active' && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">✅ Abonnement Pro actif</h3>
              <p className="text-green-100">Devis illimités • Support prioritaire</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">∞</div>
              <div className="text-green-100 text-sm">illimité</div>
            </div>
          </div>
        </div>
      )}

      {data.status === 'no_subscription' && (
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun abonnement</h3>
          <p className="text-gray-600">Commencez votre essai gratuit de 7 jours dès maintenant !</p>
        </div>
      )}

      {data.status === 'canceled' && (
        <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
          <h3 className="text-xl font-bold text-orange-800 mb-2">⚠️ Abonnement annulé</h3>
          <p className="text-orange-600">Votre abonnement prendra fin à la fin de la période en cours.</p>
        </div>
      )}

      {/* Infos détaillées */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">Informations du compte</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Email</span>
            <span className="font-medium text-gray-900">{data.email}</span>
          </div>
          <div className="flex justify-between">
            <span>Statut</span>
            <span className={`font-medium ${
              data.status === 'active' ? 'text-green-600' :
              data.status === 'trialing' ? 'text-indigo-600' :
              data.status === 'canceled' ? 'text-orange-600' :
              'text-gray-600'
            }`}>
              {data.status === 'trialing' ? 'Essai gratuit' :
               data.status === 'active' ? 'Actif' :
               data.status === 'canceled' ? 'Annulé' :
               'Aucun abonnement'}
            </span>
          </div>
          {data.trial_ends_at && (
            <div className="flex justify-between">
              <span>Fin de l'essai</span>
              <span className="font-medium text-gray-900">
                {new Date(data.trial_ends_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
