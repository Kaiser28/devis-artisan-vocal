'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    initConversation()
    initSpeechRecognition()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function initSpeechRecognition() {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API non disponible')
      return
    }

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.lang = 'fr-FR'
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Erreur reconnaissance vocale :', event.error)
      setIsRecording(false)
      setError('Erreur lors de la reconnaissance vocale')
    }

    recognitionRef.current.onend = () => {
      setIsRecording(false)
    }
  }

  async function initConversation() {
    try {
      // Créer une conversation simple (sans thread OpenAI)
      const res = await fetch('/api/chat/init', { method: 'POST' })
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Erreur initialisation')
      }

      const data = await res.json()
      setConversationId(data.conversation_id)

      // Message de bienvenue
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `👋 Bonjour ! Je suis votre assistant IA pour la création de devis BTP.

**Que puis-je faire pour vous ?**

📋 **Créer un devis** : "Devis pour Dupont, 50 m² peinture, 20 m² carrelage"
🔍 **Rechercher un client** : "Cherche les clients à Versailles"
💶 **Consulter les prix** : "Prix de la peinture"
📊 **Voir un devis** : "Affiche le devis DEV-2026-002"
💰 **Ajouter un prix** : "Ajoute la peinture acrylique à 12€/m²"

**Exemples de commandes** :
• "Cherche Dominique"
• "Crée un devis pour Jean-Laurore avec 100 m² de peinture"
• "Quel est le prix du carrelage ?"`,
        timestamp: new Date()
      }])

    } catch (err) {
      console.error('Erreur init :', err)
      setError('Erreur d\'initialisation. Veuillez rafraîchir la page.')
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/chat/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: conversationId
        })
      })

      if (!res.ok) {
        throw new Error('Erreur envoi message')
      }

      const data = await res.json()

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (err) {
      console.error('Erreur envoi :', err)
      setError('Erreur lors de l\'envoi. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  async function newConversation() {
    setMessages([])
    setConversationId(null)
    setError('')
    await initConversation()
  }

  function toggleRecording() {
    if (!recognitionRef.current) {
      setError('Reconnaissance vocale non disponible sur ce navigateur')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      setIsRecording(true)
      setError('')
      recognitionRef.current.start()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/app')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            🤖 Assistant IA Devis
          </h1>
        </div>
        <button
          onClick={newConversation}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          ➕ Nouvelle conversation
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg px-6 py-4 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className={`text-xs mt-2 ${
                msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
              }`}>
                {msg.timestamp.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-3xl bg-white border border-gray-200 rounded-lg px-6 py-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                <span>L'assistant réfléchit...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-6 py-4">
              ⚠️ {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={toggleRecording}
              className={`px-4 py-3 rounded-lg transition ${
                isRecording 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={loading}
              title={isRecording ? 'Arrêter l\'enregistrement' : 'Dictée vocale'}
            >
              {isRecording ? '⏹️ Stop' : '🎙️'}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tapez ou dictez votre message... (ex: 'Devis pour Dupont, 50 m² peinture')"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              disabled={loading}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-3">
          🎙️ Cliquez sur le micro pour dicter • 💡 Exemples : "Devis Dupont 50 m² peinture" • "Cherche clients à Versailles" • "Prix carrelage"
        </p>
      </div>
    </div>
  )
}
