'use client'

import { useState, useEffect, useRef } from 'react'

interface BasePrix {
  id: string
  designation: string
  unite: string
  prix_unitaire_ht: number
  tva_taux: number
  categorie: string | null
}

interface Lot {
  id: string
  designation: string
  quantite: number
  unite: string
  prix_unitaire_ht: number
  tva_taux: number
  total_ht: number
}

interface LigneDevisProps {
  lot: Lot
  onChange: (lot: Lot) => void
  onDelete: () => void
}

export default function LigneDevis({ lot, onChange, onDelete }: LigneDevisProps) {
  const [search, setSearch] = useState(lot.designation)
  const [results, setResults] = useState<BasePrix[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (search.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(() => {
      searchPrix()
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Recalculer total HT quand quantité ou prix change
  useEffect(() => {
    const total = lot.quantite * lot.prix_unitaire_ht
    if (total !== lot.total_ht) {
      onChange({ ...lot, total_ht: total })
    }
  }, [lot.quantite, lot.prix_unitaire_ht])

  const searchPrix = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/base-prix/search?q=${encodeURIComponent(search)}`)
      if (!response.ok) throw new Error('Erreur de recherche')
      
      const { data } = await response.json()
      setResults(data)
      setIsOpen(true)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPrix = (prix: BasePrix) => {
    setSearch(prix.designation)
    setIsOpen(false)
    onChange({
      ...lot,
      designation: prix.designation,
      unite: prix.unite,
      prix_unitaire_ht: prix.prix_unitaire_ht,
      tva_taux: prix.tva_taux,
      total_ht: lot.quantite * prix.prix_unitaire_ht
    })
  }

  const handleFieldChange = (field: string, value: any) => {
    if (field === 'designation') {
      setSearch(value)
    }
    onChange({ ...lot, [field]: value })
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          {/* Désignation avec autocomplete */}
          <div ref={wrapperRef} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => handleFieldChange('designation', e.target.value)}
              placeholder="Désignation (ex: Peinture...)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            
            {/* Dropdown autocomplete */}
            {isOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {loading ? (
                  <div className="p-3 text-center text-sm text-gray-600">Recherche...</div>
                ) : results.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-600">Aucun prix trouvé</div>
                ) : (
                  results.map((prix) => (
                    <button
                      key={prix.id}
                      type="button"
                      onClick={() => handleSelectPrix(prix)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-sm text-gray-900">{prix.designation}</div>
                      <div className="text-xs text-gray-600">
                        {prix.unite} • {prix.prix_unitaire_ht.toFixed(2)}€ HT • TVA {prix.tva_taux}%
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Ligne avec quantité, unité, prix, total */}
          <div className="grid grid-cols-5 gap-2">
            <div>
              <input
                type="number"
                value={lot.quantite}
                onChange={(e) => handleFieldChange('quantite', parseFloat(e.target.value) || 0)}
                placeholder="Qté"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <input
                type="text"
                value={lot.unite}
                onChange={(e) => handleFieldChange('unite', e.target.value)}
                placeholder="Unité"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <input
                type="number"
                value={lot.prix_unitaire_ht}
                onChange={(e) => handleFieldChange('prix_unitaire_ht', parseFloat(e.target.value) || 0)}
                placeholder="PU HT"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <input
                type="number"
                value={lot.tva_taux}
                onChange={(e) => handleFieldChange('tva_taux', parseFloat(e.target.value) || 20)}
                placeholder="TVA %"
                step="0.1"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center justify-end">
              <span className="text-sm font-semibold text-gray-900">
                {lot.total_ht.toFixed(2)}€
              </span>
            </div>
          </div>
        </div>

        {/* Bouton supprimer */}
        <button
          type="button"
          onClick={onDelete}
          className="mt-8 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
