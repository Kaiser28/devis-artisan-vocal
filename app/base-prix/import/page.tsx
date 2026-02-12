'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportBasePrixPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setError(null)
    } else {
      setFile(null)
      setError('Veuillez sélectionner un fichier CSV')
    }
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim())
    const rows = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      rows.push(row)
    }

    return rows
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const text = await file.text()
      const csvData = parseCSV(text)

      if (csvData.length === 0) {
        throw new Error('Le fichier CSV est vide ou mal formaté')
      }

      const response = await fetch('/api/base-prix/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de l\'import')
      }

      const result = await response.json()
      setSuccess(`${result.imported} prix importés sur ${result.total} lignes`)
      
      setTimeout(() => {
        router.push('/base-prix')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = `designation,categorie,unite,prix_unitaire_ht,tva_taux,notes,fournisseur
Peinture acrylique blanc mat,Peinture,m²,12.50,20,Monocouche,Leroy Merlin
Carrelage grès cérame 60x60,Carrelage,m²,35.00,20,Pose collée,Point P
Main d'œuvre électricien,Électricité,heure,45.00,20,Tarif standard,
Isolation laine de verre 200mm,Isolation,m²,18.50,10,R=5,Isover`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-base-prix.csv'
    a.click()
    URL.revokeObjectURL(url)
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
          <h1 className="text-3xl font-bold text-gray-800">Importer des prix (CSV)</h1>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Format CSV attendu</h3>
          <p className="text-blue-800 mb-3">
            Votre fichier CSV doit contenir les colonnes suivantes (séparées par des virgules) :
          </p>
          <ul className="text-blue-800 space-y-1 mb-4">
            <li><strong>designation</strong> (obligatoire) - Ex: Peinture acrylique blanc mat</li>
            <li><strong>categorie</strong> (optionnel) - Ex: Peinture</li>
            <li><strong>unite</strong> (obligatoire) - Ex: m², pièce, heure...</li>
            <li><strong>prix_unitaire_ht</strong> (obligatoire) - Ex: 12.50</li>
            <li><strong>tva_taux</strong> (optionnel) - Ex: 20 (défaut: 20)</li>
            <li><strong>notes</strong> (optionnel) - Informations complémentaires</li>
            <li><strong>fournisseur</strong> (optionnel) - Ex: Leroy Merlin</li>
          </ul>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            📥 Télécharger un exemple CSV
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* File input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fichier CSV
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Fichier sélectionné : <strong>{file.name}</strong>
                </p>
              )}
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
                disabled={loading || !file}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Import en cours...' : '📥 Importer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
