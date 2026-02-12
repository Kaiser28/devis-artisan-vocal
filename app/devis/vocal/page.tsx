'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface ParsedClient {
  nom: string
  prenom: string
  telephone: string | null
  adresse: string | null
  code_postal: string | null
  ville: string | null
  client_existant: boolean
  client_id: string | null
}

interface ParsedLot {
  designation: string
  quantite: number
  unite: string
  prix_unitaire_ht: number | null
  prix_suggere: number | null
  source: 'manuel' | 'catalogue'
  tva_taux: number
  alerte: string | null
}

interface ParsedDevis {
  client: ParsedClient
  lots: ParsedLot[]
  remise_pourcentage: number | null
  acompte_pourcentage: number | null
  notes: string | null
  alertes: string[]
}

export default function DevisVocalPage() {
  const router = useRouter()
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedDevis | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<any>(null)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    // Vérifier si Web Speech API est supportée
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setIsSupported(false)
        setError('⚠️ Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome, Edge ou Safari.')
        return
      }

      // Initialiser la reconnaissance vocale
      const recognition = new SpeechRecognition()
      recognition.lang = 'fr-FR'
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart + ' '
          } else {
            interimTranscript += transcriptPart
          }
        }

        setTranscript(prev => {
          const newTranscript = prev + finalTranscript
          return newTranscript
        })
      }

      recognition.onerror = (event: any) => {
        console.error('Erreur reconnaissance vocale:', event.error)
        if (event.error === 'no-speech') {
          setError('Aucune parole détectée. Parlez plus fort ou vérifiez votre micro.')
        } else if (event.error === 'not-allowed') {
          setError('Permission micro refusée. Autorisez l\'accès dans les paramètres du navigateur.')
        } else {
          setError(`Erreur: ${event.error}`)
        }
        setIsRecording(false)
      }

      recognition.onend = () => {
        if (isRecording) {
          // Redémarrer automatiquement si on est encore en mode enregistrement
          recognition.start()
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isRecording])

  const startRecording = () => {
    if (!recognitionRef.current) return
    
    setError(null)
    setTranscript('')
    setParsedData(null)
    setIsRecording(true)
    
    try {
      recognitionRef.current.start()
    } catch (err) {
      console.error('Erreur démarrage:', err)
      setError('Impossible de démarrer la reconnaissance vocale')
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (!recognitionRef.current) return
    
    setIsRecording(false)
    recognitionRef.current.stop()
  }

  const handleParse = async () => {
    if (!transcript || transcript.trim().length === 0) {
      setError('Le transcript est vide. Parlez d\'abord.')
      return
    }

    setIsParsing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/parse-devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcript.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du parsing')
      }

      const { data } = await response.json()
      setParsedData(data)
    } catch (err: any) {
      setError(err.message)
      console.error(err)
    } finally {
      setIsParsing(false)
    }
  }

  const handleValidate = () => {
    if (!parsedData) return

    // Stocker dans sessionStorage pour pré-remplir le formulaire
    sessionStorage.setItem('vocal_devis_data', JSON.stringify(parsedData))
    
    // Rediriger vers /devis/nouveau
    router.push('/devis/nouveau?from=vocal')
  }

  const calculateEstimate = () => {
    if (!parsedData) return { totalHT: 0, totalTTC: 0, remise: 0, tva: 0 }
    
    const totalHT = parsedData.lots.reduce((sum, lot) => {
      const prix = lot.prix_unitaire_ht || lot.prix_suggere || 0
      return sum + (lot.quantite * prix)
    }, 0)

    const remise = parsedData.remise_pourcentage ? (totalHT * parsedData.remise_pourcentage) / 100 : 0
    const totalHTApresRemise = totalHT - remise

    const tva = parsedData.lots.reduce((sum, lot) => {
      const prix = lot.prix_unitaire_ht || lot.prix_suggere || 0
      const lotHT = lot.quantite * prix * (1 - (parsedData.remise_pourcentage || 0) / 100)
      return sum + (lotHT * lot.tva_taux) / 100
    }, 0)

    const totalTTC = totalHTApresRemise + tva

    return { totalHT, totalTTC, remise, tva }
  }

  const estimate = calculateEstimate()

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => router.push('/devis/nouveau')}
              className="mt-4 text-blue-600 hover:underline"
            >
              → Créer un devis manuel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push('/devis')}
              className="text-blue-600 hover:underline mb-2 flex items-center gap-2"
            >
              ← Retour aux devis
            </button>
            <h1 className="text-4xl font-bold text-gray-800">
              🎤 Devis vocal
            </h1>
            <p className="text-gray-600 mt-2">
              Dictez votre devis et laissez l'IA l'analyser
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche : Enregistrement */}
          <div className="space-y-6">
            {/* Contrôles d'enregistrement */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Étape 1 : Dictez votre devis
              </h2>

              <div className="flex flex-col items-center gap-6">
                {/* Bouton micro */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-32 h-32 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } shadow-xl`}
                >
                  <span className="text-6xl">
                    {isRecording ? '⏹️' : '🎙️'}
                  </span>
                </button>

                <div className="text-center">
                  {isRecording ? (
                    <div>
                      <p className="text-lg font-semibold text-red-600">
                        🔴 Enregistrement en cours...
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Parlez normalement. Cliquez pour arrêter.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-semibold text-gray-700">
                        Cliquez pour commencer
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Exemple : "Devis pour M. Dupont, 50m² de peinture..."
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📝 Transcript en temps réel
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                {transcript ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{transcript}</p>
                ) : (
                  <p className="text-gray-400 italic">
                    Le texte de votre dictée apparaîtra ici...
                  </p>
                )}
              </div>

              {transcript && !isRecording && (
                <button
                  onClick={handleParse}
                  disabled={isParsing}
                  className="mt-4 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isParsing ? '🔄 Analyse IA en cours...' : '✨ Analyser avec l\'IA'}
                </button>
              )}
            </div>
          </div>

          {/* Colonne droite : Résultat */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {parsedData && (
              <>
                {/* Alertes globales */}
                {parsedData.alertes && parsedData.alertes.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-800 mb-2">⚠️ Alertes</h3>
                    <ul className="list-disc list-inside text-orange-700 text-sm space-y-1">
                      {parsedData.alertes.map((alerte, i) => (
                        <li key={i}>{alerte}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Client détecté */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {parsedData.client.client_existant ? '✅ Client existant détecté' : '🆕 Nouveau client'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nom :</strong> {parsedData.client.prenom} {parsedData.client.nom}</p>
                    {parsedData.client.telephone && (
                      <p><strong>Téléphone :</strong> {parsedData.client.telephone}</p>
                    )}
                    {parsedData.client.adresse && (
                      <p><strong>Adresse :</strong> {parsedData.client.adresse}</p>
                    )}
                    {parsedData.client.ville && (
                      <p><strong>Ville :</strong> {parsedData.client.code_postal} {parsedData.client.ville}</p>
                    )}
                  </div>
                </div>

                {/* Lignes détectées */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    📋 Lignes détectées ({parsedData.lots.length})
                  </h3>
                  <div className="space-y-4">
                    {parsedData.lots.map((lot, i) => (
                      <div key={i} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
                        <p className="font-semibold text-gray-800">{i + 1}. {lot.designation}</p>
                        <p className="text-sm text-gray-600">
                          {lot.quantite} {lot.unite} × {(lot.prix_unitaire_ht || lot.prix_suggere || 0).toFixed(2)}€ HT = {' '}
                          <strong>{((lot.quantite * (lot.prix_unitaire_ht || lot.prix_suggere || 0)).toFixed(2))}€ HT</strong>
                        </p>
                        <p className="text-xs text-gray-500">
                          TVA {lot.tva_taux}% • {lot.source === 'catalogue' ? '💡 Prix depuis catalogue' : '✍️ Prix manuel'}
                        </p>
                        {lot.alerte && (
                          <p className="text-xs text-orange-600 mt-1">⚠️ {lot.alerte}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totaux */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                  <h3 className="text-xl font-semibold mb-4">💰 Estimation</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total HT :</span>
                      <span className="font-semibold">{estimate.totalHT.toFixed(2)} €</span>
                    </div>
                    {parsedData.remise_pourcentage && parsedData.remise_pourcentage > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Remise ({parsedData.remise_pourcentage}%) :</span>
                        <span>-{estimate.remise.toFixed(2)} €</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>TVA :</span>
                      <span>{estimate.tva.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold border-t border-white/30 pt-2">
                      <span>Total TTC :</span>
                      <span>{estimate.totalTTC.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setParsedData(null)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    ↻ Recommencer
                  </button>
                  <button
                    onClick={handleValidate}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    ✓ Valider et créer le devis
                  </button>
                </div>
              </>
            )}

            {!parsedData && !error && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  En attente d'analyse
                </h3>
                <p className="text-gray-600">
                  Dictez votre devis puis cliquez sur "Analyser avec l'IA"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
