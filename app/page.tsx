export default function LandingPage() {
  return (
    <html lang="fr">
      <head>
        <title>Récupérez 15h par semaine grâce à l'IA | Sferia</title>
        <meta name="description" content="Artisan BTP à 500k€+ de CA ? Arrêtez de perdre 15h/semaine sur les devis. L'IA prend le relais. 7 jours gratuits." />
      </head>
      <body className="bg-white text-gray-900">

{/* Hero Section - Ultra direct */}
<section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white overflow-hidden">
  <div className="absolute inset-0 bg-black opacity-10"></div>
  
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
    {/* Badge urgence */}
    <div className="flex justify-center mb-8">
      <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
        ⚠️ Fenêtre d'opportunité : 6-12 mois avant saturation du marché
      </div>
    </div>

    {/* Headline choc */}
    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-center leading-tight mb-6">
      Vous perdez <span className="text-yellow-400">15 heures par semaine</span><br/>
      sur les devis et l'administratif
    </h1>

    {/* Sous-titre problème */}
    <p className="text-xl sm:text-2xl text-center text-indigo-100 mb-4 max-w-4xl mx-auto">
      500k€ de CA mais coincé 60h/semaine à répondre aux emails à 22h ?<br/>
      <span className="font-bold text-yellow-300">L'IA prend le relais. Vous redevenez chef d'entreprise.</span>
    </p>

    {/* Social proof immédiat */}
    <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm text-indigo-200">
      <div className="flex items-center gap-2">
        <span>⏱️</span>
        <span><strong className="text-white">15h</strong> récupérées/sem</span>
      </div>
      <div className="flex items-center gap-2">
        <span>🚀</span>
        <span>Devis en <strong className="text-white">2 minutes</strong></span>
      </div>
      <div className="flex items-center gap-2">
        <span>📈</span>
        <span><strong className="text-white">+40%</strong> de conversions</span>
      </div>
    </div>

    {/* CTA principal */}
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
      <a href="/signup" className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg px-10 py-5 rounded-lg shadow-2xl transition-all transform hover:scale-105">
        🎁 Démarrer mon essai gratuit (7 jours)
      </a>
      <a href="/login" className="w-full sm:w-auto bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold text-lg px-10 py-5 rounded-lg backdrop-blur-sm transition-all">
        ▶️ Se connecter
      </a>
    </div>

    {/* Garantie */}
    <p className="text-center text-sm text-indigo-200">
      🔒 Sans engagement • Annulation à tout moment • 29,99€/mois après 7 jours
    </p>
  </div>

  {/* Wave divider */}
  <div className="absolute bottom-0 left-0 right-0">
    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" fill="white"/>
    </svg>
  </div>
</section>

{/* Problème amplifié - Identification immédiate */}
<section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
        Ça vous parle ?
      </h2>
    </div>

    <div className="grid md:grid-cols-3 gap-8 mb-16">
      {/* Pain point 1 */}
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
        <div className="flex items-start gap-4">
          <span className="text-3xl">⏰</span>
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">19h-22h : Devis sur le coin de table</h3>
            <p className="text-gray-700">Chantier jusqu'à 18h, admin jusqu'à minuit. Votre femme vous voit à peine.</p>
          </div>
        </div>
      </div>

      {/* Pain point 2 */}
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
        <div className="flex items-start gap-4">
          <span className="text-3xl">📵</span>
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Client rappelle 3 fois → part chez concurrent</h3>
            <p className="text-gray-700">Vous êtes sur un toit, impossible de répondre. Le concurrent répond en 2h, lui.</p>
          </div>
        </div>
      </div>

      {/* Pain point 3 */}
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🚫</span>
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Zéro vacances depuis 2 ans</h3>
            <p className="text-gray-700">Personne pour gérer les devis entrants. Partir = perdre des clients.</p>
          </div>
        </div>
      </div>
    </div>

    {/* Stat choc */}
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-12 text-center shadow-2xl">
      <p className="text-6xl font-black mb-4">30-40%</p>
      <p className="text-2xl font-semibold mb-2">de prospects perdus par délai de réponse</p>
      <p className="text-red-100">Vous refusez des chantiers alors que vous avez le savoir-faire. Juste pas le TEMPS.</p>
    </div>
  </div>
</section>

{/* ROI Calculator - Chiffrage précis */}
<section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl shadow-2xl p-12 text-white">
      <h2 className="text-4xl font-black text-center mb-8">
        🧮 Calculez ce que vous PERDEZ chaque mois
      </h2>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="text-5xl font-black text-yellow-400 mb-2">15h</div>
          <div className="text-indigo-200">par semaine sur admin</div>
          <div className="text-sm text-indigo-300 mt-2">= 60h/mois gaspillées</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-black text-yellow-400 mb-2">×80€</div>
          <div className="text-indigo-200">votre taux horaire chantier</div>
          <div className="text-sm text-indigo-300 mt-2">(CA 500k€ = ~80€/h)</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-black text-red-400 mb-2">4 800€</div>
          <div className="text-indigo-200">perdus CHAQUE MOIS</div>
          <div className="text-sm text-indigo-300 mt-2">= 57 600€/an en fumée</div>
        </div>
      </div>

      <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-8 mb-8">
        <h3 className="text-2xl font-bold mb-4 text-center">Avec Sferia à 29,99€/mois :</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-lg mb-2"><strong>Investissement :</strong></p>
            <p className="text-3xl font-black text-yellow-400">29,99€/mois</p>
          </div>
          <div>
            <p className="text-lg mb-2"><strong>Temps récupéré :</strong></p>
            <p className="text-3xl font-black text-green-400">60h/mois</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white border-opacity-20">
          <p className="text-center text-2xl font-bold">
            ROI : <span className="text-yellow-400">16 000%</span> 🚀
          </p>
          <p className="text-center text-indigo-200 mt-2">
            29,99€ investis = 4 800€ de valeur récupérée. C'est mathématique.
          </p>
        </div>
      </div>

      <div className="text-center">
        <a href="/signup" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-xl px-12 py-6 rounded-xl shadow-2xl transition-all transform hover:scale-105">
          Je récupère mes 15h/semaine maintenant →
        </a>
        <p className="text-sm text-indigo-200 mt-4">7 jours gratuits • 29,99€/mois ensuite</p>
      </div>
    </div>
  </div>
</section>

{/* CTA Final */}
<section className="py-20 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-4xl sm:text-6xl font-black mb-8">
      Vous avez deux choix
    </h2>

    <div className="grid md:grid-cols-2 gap-8 mb-12">
      {/* Choix 1 - Ne rien faire */}
      <div className="bg-red-500 bg-opacity-20 backdrop-blur rounded-2xl p-8 border-2 border-red-400">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-2xl font-bold mb-4">Continuer comme avant</h3>
        <ul className="text-left space-y-2 text-red-100">
          <li>→ 15h/semaine gaspillées sur l'admin</li>
          <li>→ Clients perdus par délai de réponse</li>
          <li>→ Concurrents IA vous dépassent en 6 mois</li>
          <li>→ Épuisement, 0 vacances, stress constant</li>
          <li>→ Dans 1 an : vous survivez avec les miettes</li>
        </ul>
      </div>

      {/* Choix 2 - Agir */}
      <div className="bg-green-500 bg-opacity-20 backdrop-blur rounded-2xl p-8 border-2 border-green-400">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold mb-4">Essayer Sferia 7 jours gratuits</h3>
        <ul className="text-left space-y-2 text-green-100">
          <li>→ 15h/semaine récupérées dès la 1ère semaine</li>
          <li>→ Réponse client en 15 min → +40% conversions</li>
          <li>→ 6 mois d'avance sur vos concurrents</li>
          <li>→ Redevenez chef, pas esclave de l'admin</li>
          <li>→ Dans 1 an : vous dominez votre marché local</li>
        </ul>
      </div>
    </div>

    <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-8 mb-8">
      <p className="text-2xl font-bold mb-4">
        Risque de tester 7 jours gratuitement : <span className="text-yellow-400">0€</span>
      </p>
      <p className="text-xl text-indigo-200">
        Risque de ne rien faire : <span className="text-red-400 font-bold">57 600€/an perdus</span> + dépassé par la concurrence
      </p>
    </div>

    <a href="/signup" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-2xl px-16 py-8 rounded-2xl shadow-2xl transition-all transform hover:scale-105 mb-6">
      🚀 Je démarre mon essai gratuit maintenant
    </a>

    <p className="text-sm text-indigo-200">
      7 jours gratuits • 29,99€/mois ensuite • Annulation en 2 clics
    </p>
  </div>
</section>

{/* Footer simple */}
<footer className="bg-gray-900 text-gray-400 py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid md:grid-cols-4 gap-8 mb-8">
      <div>
        <h3 className="text-white font-bold text-lg mb-4">Sferia</h3>
        <p className="text-sm">L'IA qui redonne 15h/semaine aux artisans BTP.</p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Produit</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="/login" className="hover:text-white">Connexion</a></li>
          <li><a href="/signup" className="hover:text-white">Inscription</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Support</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="/aide" className="hover:text-white">Centre d'aide</a></li>
          <li><a href="/contact" className="hover:text-white">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Légal</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="/cgv" className="hover:text-white">CGV</a></li>
          <li><a href="/confidentialite" className="hover:text-white">Confidentialité</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-800 pt-8 text-center text-sm">
      <p>&copy; 2026 Sferia - Voisins-le-Bretonneux, France</p>
    </div>
  </div>
</footer>

{/* Sticky CTA mobile */}
<div className="fixed bottom-0 left-0 right-0 bg-yellow-400 p-4 shadow-2xl md:hidden z-50">
  <a href="/signup" className="block text-center text-gray-900 font-bold text-lg">
    Essai gratuit 7 jours →
  </a>
</div>

      </body>
    </html>
  )
}
