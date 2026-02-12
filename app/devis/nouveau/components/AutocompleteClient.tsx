'use client'

import { useState, useEffect, useRef } from 'react'

interface Client {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  adresse: string
  code_postal: string
  ville: string
}

interface AutocompleteClientProps {
  onSelect: (client: Client) => void
  selectedClient: Client | null
}

export default function AutocompleteClient({ onSelect, selectedClient }: AutocompleteClientProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Client[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (search.length === 0) {
      // Charger tous les clients au focus
      return
    }
    
    if (search.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(() => {
      searchClients()
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const loadAllClients = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/clients?limit=50')
      if (!response.ok) throw new Error('Erreur de chargement')
      
      const { data } = await response.json()
      setResults(data)
      setIsOpen(true)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const searchClients = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/clients/search?q=${encodeURIComponent(search)}`)
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

  const handleSelect = (client: Client) => {
    onSelect(client)
    setSearch(`${client.nom} ${client.prenom}`)
    setIsOpen(false)
  }

  const handleClear = () => {
    setSearch('')
    setResults([])
    setIsOpen(false)
    onSelect({
      id: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      code_postal: '',
      ville: ''
    })
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Rechercher un client
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => {
              if (search.length === 0) {
                loadAllClients()
              }
            }}
            placeholder="Tapez le nom du client ou cliquez pour voir la liste..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {search && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={loadAllClients}
          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap"
        >
          📋 Tous les clients
        </button>
      </div>

      {/* Dropdown results */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-600">Recherche...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-600">Aucun client trouvé</div>
          ) : (
            results.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => handleSelect(client)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">
                  {client.nom} {client.prenom}
                </div>
                {client.email && (
                  <div className="text-sm text-gray-600">{client.email}</div>
                )}
                {client.telephone && (
                  <div className="text-sm text-gray-600">{client.telephone}</div>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Selected client display */}
      {selectedClient && selectedClient.id && (
        <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-gray-900">
                ✓ {selectedClient.nom} {selectedClient.prenom}
              </div>
              {selectedClient.email && (
                <div className="text-sm text-gray-600">{selectedClient.email}</div>
              )}
              {selectedClient.telephone && (
                <div className="text-sm text-gray-600">{selectedClient.telephone}</div>
              )}
              {selectedClient.adresse && (
                <div className="text-sm text-gray-600">
                  {selectedClient.adresse}, {selectedClient.code_postal} {selectedClient.ville}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
