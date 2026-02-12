'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface BasePrix {
  id: string
  designation: string
  categorie: string | null
  unite: string
  prix_unitaire_ht: number
  tva_taux: number
  fournisseur: string | null
  usage_count: number
  source: string
}

export default function BasePrixPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [prix, setPrix] = useState<BasePrix[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPrix()
  }, [page, search])

  const fetchPrix = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search
      })
      
      const response = await fetch(`/api/base-prix?${params}`)
      if (!response.ok) throw new Error('Erreur de chargement')
      
      const { data, pagination } = await response.json()
      setPrix(data)
      setTotalPages(pagination.totalPages)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce prix ?')) return

    try {
      const response = await fetch(`/api/base-prix/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erreur de suppression')
      
      fetchPrix()
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
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
            <h1 className="text-3xl font-bold text-gray-800">💰 Base de prix</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/base-prix/import')}
              className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
            >
              📥 Importer CSV
            </button>
            <button
              onClick={() => router.push('/base-prix/nouveau')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              ➕ Nouveau prix
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Rechercher une désignation..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-600">Chargement...</div>
          ) : prix.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun prix enregistré</h3>
              <p className="text-gray-600 mb-6">Commencez par ajouter vos premiers prix</p>
              <button
                onClick={() => router.push('/base-prix/nouveau')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                ➕ Ajouter un prix
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Désignation</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Catégorie</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Unité</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Prix HT</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">TVA</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Utilisations</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {prix.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{item.designation}</div>
                          {item.fournisseur && (
                            <div className="text-sm text-gray-500">{item.fournisseur}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.categorie || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.unite}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {item.prix_unitaire_ht.toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                          {item.tva_taux}%
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {item.usage_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => router.push(`/base-prix/${item.id}`)}
                              className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                              Modifier
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
