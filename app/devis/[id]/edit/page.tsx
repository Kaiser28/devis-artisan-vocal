'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AutocompleteClient from '../../nouveau/components/AutocompleteClient'
import LigneDevis from '../../nouveau/components/LigneDevis'

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

interface Devis {
  id: string
  numero: string
  client_id: string
  client_nom: string
  client_prenom: string
  client_email: string
  client_telephone: string
  client_adresse: string
  client_code_postal: string
  client_ville: string
  lots: Lot[]
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

export default function EditDevisPage() {
  const router = useRouter()
  const params = useParams()
  const devisId = params.id as string

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [devis, setDevis] = useState<Devis | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  
  const [lots, setLots] = useState<Lot[]>([])
  const [remise_pourcentage, setRemisePourcentage] = useState(0)
  const [acompte_pourcentage, setAcomptePourcentage] = useState(0)

  // Charger le devis existant
  useEffect(() => {
    fetchDevis()
    fetchSettings()
  }, [devisId])

  const fetchDevis = async () => {
    try {
      const response = await fetch(`/api/devis/${devisId}`)
      if (!response.ok) throw new Error('Devis non trouvé')
      
      const { data } = await response.json()
      setDevis(data)
      
      // Pré-remplir le client
      setSelectedClient({
        id: data.client_id,
        nom: data.client_nom,
        prenom: data.client_prenom,
        email: data.client_email,
        telephone: data.client_telephone,
        adresse: data.client_adresse,
        code_postal: data.client_code_postal,
        ville: data.client_ville
      })

      // Pré-remplir les lots
      setLots(data.lots.map((lot: any, index: number) => ({
        ...lot,
        id: `${index + 1}`
      })))

      // Pré-remplir remise et acompte
      setRemisePourcentage(data.remise_pourcentage || 0)
      setAcomptePourcentage(data.acompte_pourcentage || 0)
      
    } catch (err) {
      console.error(err)
      setError('Impossible de charger le devis')
    } finally {
      setLoadingData(false)
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
    }
  }

  // Calculs automatiques
  const calculateTotals = () => {
    const total_ht = lots.reduce((sum, lot) => sum + lot.total_ht, 0)
    const remise_montant = (total_ht * remise_pourcentage) / 100
    const total_ht_apres_remise = total_ht - remise_montant
    
    const tva_montant = lots.reduce((sum, lot) => {
      const lot_ht = lot.total_ht * (1 - remise_pourcentage / 100)
      return sum + (lot_ht * lot.tva_taux) / 100
    }, 0)
    
    const total_ttc = total_ht_apres_remise + tva_montant
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

  const addLot = () => {
    const newLot: Lot = {
      id: `${lots.length + 1}`,
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
        
        // Artisan (depuis settings)
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

      const response = await fetch(`/api/devis/${devisId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devisData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la mise à jour')
      }

      // Redirection vers la page détail
      router.push(`/devis/${devisId}`)
    } catch (err: any) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement du devis...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !devis) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => router.push('/devis')}
              className="mt-4 text-blue-600 hover:underline"
            >
              ← Retour à la liste
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push(`/devis/${devisId}`)}
              className="text-blue-600 hover:underline mb-2 flex items-center gap-2"
            >
              ← Retour au devis
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              Modifier le devis {devis?.numero}
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Formulaire */}
        <div className="space-y-6">
          {/* Section Client */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              👤 Client
            </h2>
            <AutocompleteClient
              onSelect={setSelectedClient}
              selectedClient={selectedClient}
            />
          </div>

          {/* Section Artisan (lecture seule) */}
          {settings && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🏢 Artisan (informations actuelles)
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Raison sociale :</strong> {settings.raison_sociale || '-'}
                </div>
                <div>
                  <strong>SIRET :</strong> {settings.siret || '-'}
                </div>
                <div>
                  <strong>Adresse :</strong> {settings.adresse || '-'}
                </div>
                <div>
                  <strong>Ville :</strong> {settings.code_postal} {settings.ville}
                </div>
                <div>
                  <strong>Téléphone :</strong> {settings.telephone || '-'}
                </div>
                <div>
                  <strong>Email :</strong> {settings.email || '-'}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💡 Les informations artisan seront mises à jour depuis vos paramètres actuels
              </p>
            </div>
          )}

          {/* Section Lignes de devis */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                📋 Lignes de devis
              </h2>
              <button
                onClick={addLot}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                ➕ Ajouter une ligne
              </button>
            </div>

            <div className="space-y-4">
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              💰 Totaux
            </h2>

            <div className="space-y-4">
              {/* Remise */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-gray-700">Remise (%) :</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={remise_pourcentage}
                  onChange={(e) => setRemisePourcentage(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Acompte */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-gray-700">Acompte (%) :</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={acompte_pourcentage}
                  onChange={(e) => setAcomptePourcentage(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Résumé */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total HT :</span>
                  <span className="font-semibold">{totals.total_ht.toFixed(2)} €</span>
                </div>
                {totals.remise_montant > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Remise ({remise_pourcentage}%) :</span>
                    <span>-{totals.remise_montant.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA :</span>
                  <span className="font-semibold">{totals.tva_montant.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-blue-600">
                  <span>Total TTC :</span>
                  <span>{totals.total_ttc.toFixed(2)} €</span>
                </div>
                {totals.acompte_montant > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Acompte ({acompte_pourcentage}%) :</span>
                    <span>{totals.acompte_montant.toFixed(2)} €</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSubmit('brouillon')}
              disabled={loading}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              {loading ? '⏳ Enregistrement...' : '💾 Enregistrer'}
            </button>
            <button
              onClick={() => handleSubmit('envoye')}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? '⏳ Envoi...' : '✓ Valider et envoyer'}
            </button>
            <button
              onClick={() => router.push(`/devis/${devisId}`)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
