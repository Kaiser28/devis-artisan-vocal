'use client'

import { useState } from 'react'

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  const handleManage = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/stripe/customer-portal', {
        method: 'POST'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur')
      }

      // Rediriger vers le portail Stripe
      window.location.href = data.portal_url
    } catch (err: any) {
      console.error('Erreur portal:', err)
      alert(err.message)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
    >
      {loading ? '⏳ Chargement...' : '⚙️ Gérer mon abonnement'}
    </button>
  )
}
