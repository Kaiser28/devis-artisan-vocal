'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LogoUpload from './LogoUpload'
import SubscriptionCard from './SubscriptionCard'

interface Settings {
  raison_sociale: string
  siret: string
  adresse: string
  code_postal: string
  ville: string
  telephone: string
  email: string
  site_web: string
  logo_url: string | null
  assurance_decennale_compagnie: string
  assurance_decennale_numero: string
  assurance_decennale_validite: string | null
  mentions_legales: string
  tva_defaut: number
  conditions_paiement_defaut: string
  validite_devis_jours: number
}

export default function SettingsForm() {
  const router = useRouter()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }

      setMessage({ type: 'success', text: '✅ Paramètres sauvegardés' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ ${err.message}` })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Settings, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return <div className="max-w-4xl mx-auto p-8 text-red-600">Erreur de chargement</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">⚙️ Paramètres</h1>
        <p className="text-gray-600 mt-1">Configurez les informations de votre entreprise</p>
      </div>

      {message && (
        <div className={`
          p-4 rounded-lg mb-6 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }
        `}>
          {message.text}
        </div>
      )}

      {/* Section abonnement */}
      <SubscriptionCard />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1 : Informations entreprise */}
        <section className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🏢 Informations entreprise</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raison sociale *
              </label>
              <input
                type="text"
                value={settings.raison_sociale}
                onChange={(e) => handleChange('raison_sociale', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="SARL Dupont Plomberie"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SIRET
              </label>
              <input
                type="text"
                value={settings.siret}
                onChange={(e) => handleChange('siret', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="123 456 789 00012"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={settings.telephone}
                onChange={(e) => handleChange('telephone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="01 23 45 67 89"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={settings.adresse}
                onChange={(e) => handleChange('adresse', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="123 rue de la Paix"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code postal
              </label>
              <input
                type="text"
                value={settings.code_postal}
                onChange={(e) => handleChange('code_postal', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="75001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                type="text"
                value={settings.ville}
                onChange={(e) => handleChange('ville', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Paris"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="contact@entreprise.fr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site web
              </label>
              <input
                type="url"
                value={settings.site_web}
                onChange={(e) => handleChange('site_web', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="https://www.entreprise.fr"
              />
            </div>
          </div>

          <div className="mt-6">
            <LogoUpload 
              currentLogoUrl={settings.logo_url}
              onLogoChange={(url) => handleChange('logo_url', url)}
            />
          </div>
        </section>

        {/* Section 2 : Assurance décennale */}
        <section className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🛡️ Assurance décennale</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compagnie d'assurance
              </label>
              <input
                type="text"
                value={settings.assurance_decennale_compagnie}
                onChange={(e) => handleChange('assurance_decennale_compagnie', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="AXA, Allianz, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de police
              </label>
              <input
                type="text"
                value={settings.assurance_decennale_numero}
                onChange={(e) => handleChange('assurance_decennale_numero', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="ABC123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de validité
              </label>
              <input
                type="date"
                value={settings.assurance_decennale_validite || ''}
                onChange={(e) => handleChange('assurance_decennale_validite', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </section>

        {/* Section 3 : Paramètres devis */}
        <section className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📄 Paramètres des devis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TVA par défaut (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.tva_defaut}
                onChange={(e) => handleChange('tva_defaut', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validité des devis (jours)
              </label>
              <input
                type="number"
                value={settings.validite_devis_jours}
                onChange={(e) => handleChange('validite_devis_jours', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conditions de paiement par défaut
              </label>
              <textarea
                value={settings.conditions_paiement_defaut}
                onChange={(e) => handleChange('conditions_paiement_defaut', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Acompte de 30% à la commande..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mentions légales
              </label>
              <textarea
                value={settings.mentions_legales}
                onChange={(e) => handleChange('mentions_legales', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="En cas de litige..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Ces mentions seront affichées en bas de chaque devis PDF
              </p>
            </div>
          </div>
        </section>

        {/* Boutons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer les paramètres'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/app')}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
