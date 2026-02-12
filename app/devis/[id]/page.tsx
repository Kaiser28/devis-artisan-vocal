'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Devis {
  id: string
  numero: string
  date_creation: string
  client_nom: string
  client_prenom: string
  client_email: string
  client_telephone: string
  client_adresse: string
  client_code_postal: string
  client_ville: string
  artisan_raison_sociale: string
  artisan_siret: string
  artisan_adresse: string
  artisan_code_postal: string
  artisan_ville: string
  artisan_telephone: string
  artisan_email: string
  assurance_compagnie: string
  assurance_numero_police: string
  lots: any[]
  total_ht: number
  tva_montant: number
  total_ttc: number
  remise_pourcentage: number
  remise_montant: number
  acompte_pourcentage: number
  acompte_montant: number
  conditions_paiement: string
  statut: string
}

const STATUTS = [
  { value: 'brouillon', label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
  { value: 'envoye', label: 'Envoyé', color: 'bg-blue-100 text-blue-800' },
  { value: 'accepte', label: 'Accepté', color: 'bg-green-100 text-green-800' },
  { value: 'refuse', label: 'Refusé', color: 'bg-red-100 text-red-800' },
  { value: 'archive', label: 'Archivé', color: 'bg-gray-100 text-gray-600' }
]

export default function DevisDetailPage() {
  const router = useRouter()
  const params = useParams()
  const devisId = params.id as string

  const [loading, setLoading] = useState(true)
  const [devis, setDevis] = useState<Devis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    fetchDevis()
  }, [devisId])

  const fetchDevis = async () => {
    try {
      const response = await fetch(`/api/devis/${devisId}`)
      if (!response.ok) throw new Error('Devis non trouvé')
      
      const { data } = await response.json()
      setDevis(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) return

    try {
      const response = await fetch(`/api/devis/${devisId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erreur de suppression')
      
      router.push('/devis')
    } catch (err: any) {
      alert('Erreur lors de la suppression')
    }
  }

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true)
    try {
      // Import dynamique pour éviter le chargement côté serveur
      const { generateDevisPDF } = await import('@/lib/pdf/generateDevisPDF')
      
      // Récupérer les paramètres artisan
      const settingsResponse = await fetch('/api/settings')
      const settingsData = settingsResponse.ok ? await settingsResponse.json() : null
      
      // Générer le PDF
      const doc = await generateDevisPDF(devis as any, settingsData?.data)
      
      // Télécharger
      doc.save(`Devis_${devis?.numero}.pdf`)
    } catch (err: any) {
      alert('Erreur lors de la génération du PDF')
      console.error(err)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant)
  }

  const getStatutColor = (statut: string) => {
    return STATUTS.find(s => s.value === statut)?.color || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    )
  }

  if (error || !devis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6">
            {error || 'Devis non trouvé'}
          </div>
          <button
            onClick={() => router.push('/devis')}
            className="mt-4 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-md"
          >
            ← Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/devis')}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-md"
            >
              ← Retour
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Devis {devis.numero}</h1>
              <p className="text-gray-600">Créé le {formatDate(devis.date_creation)}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(devis.statut)}`}>
              {STATUTS.find(s => s.value === devis.statut)?.label || devis.statut}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={generatingPDF}
              className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingPDF ? '⏳ Génération...' : '📥 Télécharger PDF'}
            </button>
            <button
              onClick={() => router.push(`/devis/${devisId}/edit`)}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              ✏️ Modifier
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Section Client */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">👤 Client</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-gray-700">Nom complet</div>
                <div className="text-gray-900">{devis.client_nom} {devis.client_prenom}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Email</div>
                <div className="text-gray-900">{devis.client_email || '-'}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Téléphone</div>
                <div className="text-gray-900">{devis.client_telephone || '-'}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Adresse</div>
                <div className="text-gray-900">
                  {devis.client_adresse || '-'}<br />
                  {devis.client_code_postal} {devis.client_ville}
                </div>
              </div>
            </div>
          </div>

          {/* Section Artisan */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🏢 Artisan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-gray-700">Raison sociale</div>
                <div className="text-gray-900">{devis.artisan_raison_sociale || '-'}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">SIRET</div>
                <div className="text-gray-900">{devis.artisan_siret || '-'}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Adresse</div>
                <div className="text-gray-900">
                  {devis.artisan_adresse || '-'}<br />
                  {devis.artisan_code_postal} {devis.artisan_ville}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Contact</div>
                <div className="text-gray-900">
                  {devis.artisan_telephone || '-'}<br />
                  {devis.artisan_email || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Section Lignes de devis */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Lignes de devis</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Désignation</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qté</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Unité</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">PU HT</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">TVA</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {devis.lots && devis.lots.length > 0 ? (
                    devis.lots.map((lot: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{lot.designation}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">{lot.quantite}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">{lot.unite}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">{formatMontant(lot.prix_unitaire_ht)}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">{lot.tva_taux}%</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatMontant(lot.total_ht)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        Aucune ligne de devis
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section Totaux */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Totaux</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Total HT</span>
                <span className="font-semibold">{formatMontant(devis.total_ht)}</span>
              </div>
              {devis.remise_montant > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Remise ({devis.remise_pourcentage}%)</span>
                  <span className="font-semibold">- {formatMontant(devis.remise_montant)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700">
                <span>TVA</span>
                <span className="font-semibold">{formatMontant(devis.tva_montant)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-300">
                <span>Total TTC</span>
                <span>{formatMontant(devis.total_ttc)}</span>
              </div>
              {devis.acompte_montant > 0 && (
                <div className="flex justify-between text-indigo-700 font-semibold pt-2">
                  <span>Acompte demandé ({devis.acompte_pourcentage}%)</span>
                  <span>{formatMontant(devis.acompte_montant)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section Conditions */}
          {devis.conditions_paiement && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Conditions de paiement</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{devis.conditions_paiement}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
