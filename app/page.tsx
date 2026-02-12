export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-12 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Devis Artisan Vocal
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Solution SaaS de génération de devis par reconnaissance vocale pour artisans
        </p>
        
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Se connecter
          </a>
          <a
            href="/signup"
            className="bg-white hover:bg-gray-50 text-indigo-600 font-semibold py-3 px-8 rounded-lg border-2 border-indigo-600 transition-colors"
          >
            Créer un compte
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50 rounded-xl p-6">
            <div className="text-3xl mb-3">🎙️</div>
            <h3 className="font-semibold text-gray-800 mb-2">Vocal</h3>
            <p className="text-sm text-gray-600">Dictez vos devis en temps réel</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-6">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="font-semibold text-gray-800 mb-2">Automatique</h3>
            <p className="text-sm text-gray-600">Génération instantanée</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-6">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-gray-800 mb-2">Abonnement</h3>
            <p className="text-sm text-gray-600">29,99€/mois • 7 jours gratuits</p>
          </div>
        </div>
      </div>
    </div>
  )
}
