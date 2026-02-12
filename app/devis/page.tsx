'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Devis {
  id: string
  numero: string
  date_creation: string
  client_nom: string
  client_prenom: string
  total_ttc: number
  statut: string
}

const STATUTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'brouillon', label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
  { value: 'envoye', label: 'Envoyé', color: 'bg-blue-100 text-blue-800' },
  { value: 'accepte', label: 'Accepté', color: 'bg-green-100 text-green-800' },
  { value: 'refuse', label: 'Refusé', color: 'bg-red-100 text-red-800' },
  { value: 'archive', label: 'Archivé', color: 'bg-gray-100 text-gray-600' }
]

export default function DevisPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [devis, setDevis] = useState<Devis[]>([])
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchDevis()
  }, [page, search, statut])

  const fetchDevis = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        statut
      })
      
      const response = await fetch(`/api/devis?${params}`)
      if (!response.ok) throw new Error('Erreur de chargement')
      
      const { data, pagination } = await response.json()
      setDevis(data)
      setTotalPages(pagination.totalPages)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce devis ?')) return

    try {
      const response = await fetch(`/api/devis/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erreur de suppression')
      
      fetchDevis()
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
  }

  const getStatutColor = (statut: string) => {
    return STATUTS.find(s => s.value === statut)?.color || 'bg-gray-100 text-gray-800'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/app')}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-md"
            >
              ← Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-800">📄 Mes devis</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/devis/vocal')}
              className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
            >
              🎙️ Devis vocal
            </button>
            <button
              onClick={() => router.push('/devis/nouveau')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              ➕ Nouveau devis
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Rechercher par numéro ou client..."
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={statut}
              onChange={(e) => {
                setStatut(e.target.value)
                setPage(1)
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {STATUTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-600">Chargement...</div>
          ) : devis.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun devis</h3>
              <p className="text-gray-600 mb-6">Commencez par créer votre premier devis</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/devis/nouveau')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  ➕ Nouveau devis
                </button>
                <button
                  onClick={() => router.push('/devis/vocal')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  🎙️ Devis vocal
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Numéro</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Client</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Montant TTC</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Statut</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {devis.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.numero}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(item.date_creation)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {item.client_nom} {item.client_prenom}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {formatMontant(item.total_ttc)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(item.statut)}`}>
                            {STATUTS.find(s => s.value === item.statut)?.label || item.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => router.push(`/devis/${item.id}`)}
                              className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                              Voir
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm font-medium"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    ← Précédent
                  </button>
                  <span className="px-4 py-2 text-gray-700 font-medium">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
