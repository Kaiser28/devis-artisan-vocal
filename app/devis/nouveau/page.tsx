'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AutocompleteClient from './components/AutocompleteClient'
import LigneDevis from './components/LigneDevis'

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

interface Lot {
  id: string
  designation: string
  quantite: number
  unite: string
  prix_unitaire_ht: number
  tva_taux: number
  total_ht: number
}

interface Settings {
  raison_sociale: string
  siret: string
  adresse: string
  code_postal: string
  ville: string
  telephone: string
  email: string
  assurance_decennale_compagnie: string
  assurance_decennale_numero: string
  conditions_paiement_defaut: string
  tva_defaut: number
}

export default function NewDevisPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  
  const [lots, setLots] = useState<Lot[]>([
    {
      id: '1',
      designation: '',
      quantite: 1,
      unite: 'm²',
      prix_unitaire_ht: 0,
      tva_taux: 20,
      total_ht: 0
    }
  ])

  const [remise_pourcentage, setRemisePourcentage] = useState(0)
  const [acompte_pourcentage, setAcomptePourcentage] = useState(0)

  // Charger les paramètres de l'artisan
  useEffect(() => {
    fetchSettings()
    loadVocalData() // Charger données vocales si présentes
  }, [])

  const loadVocalData = () => {
    try {
      const vocalDataStr = sessionStorage.getItem('vocal_devis_data')
      if (!vocalDataStr) return

      const vocalData = JSON.parse(vocalDataStr)
      
      // Pré-remplir le client
      if (vocalData.client) {
        const clientData = vocalData.client
        setSelectedClient({
          id: clientData.client_id || '',
          nom: clientData.nom || '',
          prenom: clientData.prenom || '',
          email: '',
          telephone: clientData.telephone || '',
          adresse: clientData.adresse || '',
          code_postal: clientData.code_postal || '',
          ville: clientData.ville || ''
        })
      }

      // Pré-remplir les lots
      if (vocalData.lots && vocalData.lots.length > 0) {
        const lotsFromVocal = vocalData.lots.map((lot: any, index: number) => ({
          id: `${index + 1}`,
          designation: lot.designation,
          quantite: lot.quantite,
          unite: lot.unite,
          prix_unitaire_ht: lot.prix_unitaire_ht || lot.prix_suggere || 0,
          tva_taux: lot.tva_taux || 20,
          total_ht: (lot.quantite * (lot.prix_unitaire_ht || lot.prix_suggere || 0))
        }))
        setLots(lotsFromVocal)
      }

      // Pré-remplir remise et acompte
      if (vocalData.remise_pourcentage) {
        setRemisePourcentage(vocalData.remise_pourcentage)
      }
      if (vocalData.acompte_pourcentage) {
        setAcomptePourcentage(vocalData.acompte_pourcentage)
      }

      // Nettoyer sessionStorage
      sessionStorage.removeItem('vocal_devis_data')
    } catch (err) {
      console.error('Erreur chargement données vocales:', err)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (!response.ok) throw new Error('Paramètres non trouvés')
      
      const { data } = await response.json()
      setSettings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingSettings(false)
    }
  }

  // Calculs automatiques
  const calculateTotals = () => {
    const total_ht = lots.reduce((sum, lot) => sum + lot.total_ht, 0)
    const remise_montant = (total_ht * remise_pourcentage) / 100
    const total_apres_remise = total_ht - remise_montant
    
    // Calculer TVA moyenne pondérée
    const tva_montant = lots.reduce((sum, lot) => {
      const lot_ht = lot.total_ht
      const lot_tva = (lot_ht * lot.tva_taux) / 100
      return sum + lot_tva
    }, 0)
    
    const total_ttc = total_apres_remise + tva_montant
    const acompte_montant = (total_ttc * acompte_pourcentage) / 100

    return {
      total_ht,
      remise_montant,
      tva_montant,
      total_ttc,
      acompte_montant
    }
  }

  const totals = calculateTotals()

  // Gestion des lots
  const addLot = () => {
    const newLot: Lot = {
      id: Date.now().toString(),
      designation: '',
      quantite: 1,
      unite: 'm²',
      prix_unitaire_ht: 0,
      tva_taux: settings?.tva_defaut || 20,
      total_ht: 0
    }
    setLots([...lots, newLot])
  }

  const updateLot = (id: string, updatedLot: Lot) => {
    setLots(lots.map(lot => lot.id === id ? updatedLot : lot))
  }

  const deleteLot = (id: string) => {
    if (lots.length === 1) {
      alert('Le devis doit contenir au moins une ligne')
      return
    }
    setLots(lots.filter(lot => lot.id !== id))
  }

  const handleSubmit = async (statut: 'brouillon' | 'envoye') => {
    setLoading(true)
    setError(null)

    // Validation
    if (!selectedClient || !selectedClient.id) {
      setError('Veuillez sélectionner un client')
      setLoading(false)
      return
    }

    if (lots.some(lot => !lot.designation)) {
      setError('Veuillez remplir toutes les désignations')
      setLoading(false)
      return
    }

    try {
      const devisData = {
        // Client
        client_id: selectedClient.id,
        client_nom: selectedClient.nom,
        client_prenom: selectedClient.prenom,
        client_email: selectedClient.email,
        client_telephone: selectedClient.telephone,
        client_adresse: selectedClient.adresse,
        client_code_postal: selectedClient.code_postal,
        client_ville: selectedClient.ville,
        
        // Artisan
        artisan_raison_sociale: settings?.raison_sociale || '',
        artisan_siret: settings?.siret || '',
        artisan_adresse: settings?.adresse || '',
        artisan_code_postal: settings?.code_postal || '',
        artisan_ville: settings?.ville || '',
        artisan_telephone: settings?.telephone || '',
        artisan_email: settings?.email || '',
        
        // Assurance
        assurance_compagnie: settings?.assurance_decennale_compagnie || '',
        assurance_numero_police: settings?.assurance_decennale_numero || '',
        
        // Lots
        lots: lots.map(lot => ({
          designation: lot.designation,
          quantite: lot.quantite,
          unite: lot.unite,
          prix_unitaire_ht: lot.prix_unitaire_ht,
          tva_taux: lot.tva_taux,
          total_ht: lot.total_ht
        })),
        
        // Montants
        total_ht: totals.total_ht,
        tva_montant: totals.tva_montant,
        total_ttc: totals.total_ttc,
        remise_pourcentage,
        remise_montant: totals.remise_montant,
        acompte_pourcentage,
        acompte_montant: totals.acompte_montant,
        
        // Conditions
        conditions_paiement: settings?.conditions_paiement_defaut || '',
        
        // Statut
        statut
      }

      const response = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devisData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création')
      }

      router.push('/devis')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-md"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Nouveau devis</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          
          {/* Section Client */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">👤 Client</h2>
            <AutocompleteClient
              selectedClient={selectedClient}
              onSelect={setSelectedClient}
            />
          </div>

          {/* Section Artisan (read-only) */}
          {settings && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">🏢 Artisan</h2>
                <a
                  href="/parametres"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Modifier dans Paramètres →
                </a>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div><strong>Raison sociale :</strong> {settings.raison_sociale || '-'}</div>
                <div><strong>SIRET :</strong> {settings.siret || '-'}</div>
                <div><strong>Adresse :</strong> {settings.adresse || '-'} {settings.code_postal || ''} {settings.ville || ''}</div>
                <div><strong>Téléphone :</strong> {settings.telephone || '-'}</div>
                <div><strong>Email :</strong> {settings.email || '-'}</div>
              </div>
            </div>
          )}

          {/* Section Lignes de devis */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">📋 Lignes de devis</h2>
              <button
                type="button"
                onClick={addLot}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
              >
                ➕ Ajouter une ligne
              </button>
            </div>
            
            <div className="space-y-3">
              {lots.map((lot) => (
                <LigneDevis
                  key={lot.id}
                  lot={lot}
                  onChange={(updatedLot) => updateLot(lot.id, updatedLot)}
                  onDelete={() => deleteLot(lot.id)}
                />
              ))}
            </div>
          </div>

          {/* Section Totaux */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Totaux</h2>
            
            <div className="space-y-4">
              {/* Remise */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-semibold text-gray-700">
                  Remise (%)
                </label>
                <input
                  type="number"
                  value={remise_pourcentage}
                  onChange={(e) => setRemisePourcentage(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">
                  = {totals.remise_montant.toFixed(2)}€
                </span>
              </div>

              {/* Acompte */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-semibold text-gray-700">
                  Acompte (%)
                </label>
                <input
                  type="number"
                  value={acompte_pourcentage}
                  onChange={(e) => setAcomptePourcentage(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">
                  = {totals.acompte_montant.toFixed(2)}€
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Total HT</span>
                  <span className="font-semibold">{totals.total_ht.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Remise</span>
                  <span className="font-semibold">- {totals.remise_montant.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>TVA</span>
                  <span className="font-semibold">{totals.tva_montant.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                  <span>Total TTC</span>
                  <span>{totals.total_ttc.toFixed(2)}€</span>
                </div>
                {acompte_pourcentage > 0 && (
                  <div className="flex justify-between text-indigo-700 font-semibold">
                    <span>Acompte demandé</span>
                    <span>{totals.acompte_montant.toFixed(2)}€</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('brouillon')}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : '💾 Enregistrer brouillon'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('envoye')}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi...' : '✓ Valider et envoyer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
