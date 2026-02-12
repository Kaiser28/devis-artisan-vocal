'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const UNITES = ['m²', 'm', 'ml', 'pièce', 'lot', 'heure', 'jour', 'kg', 'L', 'forfait']
const CATEGORIES = ['Maçonnerie', 'Plomberie', 'Électricité', 'Peinture', 'Carrelage', 'Menuiserie', 'Plâtrerie', 'Isolation', 'Couverture', 'Autre']

export default function NewBasePrixPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    designation: '',
    categorie: '',
    unite: 'm²',
    prix_unitaire_ht: '',
    tva_taux: '20',
    notes: '',
    fournisseur: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/base-prix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création')
      }

      router.push('/base-prix')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-md"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Nouveau prix</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Désignation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Désignation *
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ex: Peinture acrylique blanc mat"
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">-- Sélectionner --</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Unité et Prix HT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unité *
                </label>
                <select
                  name="unite"
                  value={formData.unite}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {UNITES.map(unite => (
                    <option key={unite} value={unite}>{unite}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix unitaire HT * (€)
                </label>
                <input
                  type="number"
                  name="prix_unitaire_ht"
                  value={formData.prix_unitaire_ht}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="12.50"
                />
              </div>
            </div>

            {/* TVA et Fournisseur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Taux TVA (%)
                </label>
                <input
                  type="number"
                  name="tva_taux"
                  value={formData.tva_taux}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fournisseur
                </label>
                <input
                  type="text"
                  name="fournisseur"
                  value={formData.fournisseur}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Leroy Merlin, Point P..."
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Informations complémentaires..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enregistrement...' : '✓ Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
