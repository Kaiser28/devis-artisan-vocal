'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LogoUploadProps {
  currentLogoUrl: string | null
  onLogoChange: (url: string | null) => void
}

export default function LogoUpload({ currentLogoUrl, onLogoChange }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/settings/logo', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload')
      }

      onLogoChange(data.logo_url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer le logo ?')) return

    setUploading(true)
    setError(null)

    try {
      const res = await fetch('/api/settings/logo', {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      onLogoChange(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Logo de l'entreprise
      </label>

      {/* Aperçu */}
      {currentLogoUrl && (
        <div className="relative w-48 h-48 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <Image
            src={currentLogoUrl}
            alt="Logo entreprise"
            fill
            className="object-contain p-4"
          />
        </div>
      )}

      {/* Upload */}
      <div className="flex gap-3">
        <label className={`
          px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer
          hover:bg-indigo-700 transition-colors
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          {uploading ? 'Upload en cours...' : currentLogoUrl ? 'Remplacer le logo' : 'Ajouter un logo'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/svg+xml,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {currentLogoUrl && (
          <button
            onClick={handleDelete}
            disabled={uploading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Supprimer
          </button>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <p className="text-sm text-red-600">❌ {error}</p>
      )}

      {/* Aide */}
      <p className="text-xs text-gray-500">
        Formats acceptés : JPG, PNG, SVG, WebP • Taille max : 2 MB • Dimensions recommandées : 500×500 px
      </p>
    </div>
  )
}
