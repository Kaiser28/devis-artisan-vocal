export default function LandingPage() {
  return (
    <html lang="fr">
      <head>
        <title>Récupérez 15h par semaine grâce à l'IA | CLIC DEVIS</title>
        <meta name="description" content="Artisan BTP à 500k€+ de CA ? Arrêtez de perdre 15h/semaine sur les devis. L'IA prend le relais. CLIC DEVIS - 7 jours gratuits." />
      </head>
      <body className="bg-white text-gray-900">

{/* Hero Section - Version sobre */}
<section className="relative bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white overflow-hidden">
  <div className="absolute inset-0 bg-black opacity-5"></div>
  
  <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
    {/* Logo CLIC DEVIS - SVG inline pour visibilité garantie */}
    <div className="flex justify-center mb-8">
      <div className="flex items-center gap-3">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Document icon */}
          <rect x="8" y="4" width="24" height="32" rx="2" fill="white" opacity="0.9"/>
          <path d="M12 12h16M12 18h16M12 24h12" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
          {/* Cursor pointer */}
          <path d="M22 22l6 6-2 2-4-4-2 4-2-6 6-2z" fill="#3b82f6"/>
        </svg>
        <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">CLIC DEVIS</span>
      </div>
    </div>
    
    {/* Headline sobre */}
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center leading-tight mb-6">
      Récupérez 15 heures par semaine
    </h1>

    {/* Sous-titre problème */}
    <p className="text-xl sm:text-2xl text-center text-slate-200 mb-12 max-w-3xl mx-auto">
      Artisan BTP ? Arrêtez de perdre du temps sur les devis et l'administratif.<br className="hidden sm:block"/>
      L'IA fait le travail pendant que vous êtes sur le chantier.
    </p>

    {/* CTA principal sobre */}
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
      <a href="/signup" className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 font-semibold text-lg px-10 py-4 rounded-lg shadow-lg transition-colors">
        Essayer 7 jours gratuitement
      </a>
      <a href="/login" className="w-full sm:w-auto border-2 border-white hover:bg-white hover:bg-opacity-10 text-white font-medium text-lg px-10 py-4 rounded-lg transition-all">
        Se connecter
      </a>
    </div>

    {/* Garantie */}
    <p className="text-center text-sm text-slate-300">
      Sans engagement • 29,99€/mois après l'essai • Annulation à tout moment
    </p>

    {/* Stats sobres */}
    <div className="grid grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">15h</div>
        <div className="text-sm text-slate-300">gagnées par semaine</div>
      </div>
      <div className="text-center border-l border-r border-slate-600">
        <div className="text-3xl font-bold mb-2">2 min</div>
        <div className="text-sm text-slate-300">pour créer un devis</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">+40%</div>
        <div className="text-sm text-slate-300">de conversions</div>
      </div>
    </div>
  </div>
</section>

{/* Problème - Version sobre */}
<section className="py-20 bg-white">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Votre quotidien d'artisan
      </h2>
      <p className="text-lg text-gray-600">Ces situations vous parlent ?</p>
    </div>

    <div className="grid md:grid-cols-3 gap-8 mb-16">
      <div className="bg-gray-50 border-l-4 border-slate-700 p-6 rounded-r-lg">
        <h3 className="font-semibold text-lg text-gray-900 mb-3">Fin de journée interminable</h3>
        <p className="text-gray-700">Chantier jusqu'à 18h, puis devis et administratif jusqu'à 22h. Le week-end, vous rattrapez le retard.</p>
      </div>

      <div className="bg-gray-50 border-l-4 border-slate-700 p-6 rounded-r-lg">
        <h3 className="font-semibold text-lg text-gray-900 mb-3">Clients qui partent</h3>
        <p className="text-gray-700">Impossible de répondre rapidement depuis le chantier. Le concurrent qui répond en 2h remporte le marché.</p>
      </div>

      <div className="bg-gray-50 border-l-4 border-slate-700 p-6 rounded-r-lg">
        <h3 className="font-semibold text-lg text-gray-900 mb-3">Pas de vacances possibles</h3>
        <p className="text-gray-700">Personne pour gérer les devis entrants. Partir signifie perdre des opportunités.</p>
      </div>
    </div>

    <div className="bg-slate-100 rounded-xl p-8 text-center">
      <p className="text-4xl font-bold text-slate-900 mb-3">30-40%</p>
      <p className="text-xl font-semibold text-slate-800 mb-2">de prospects perdus par délai de réponse</p>
      <p className="text-slate-600">Vous avez le savoir-faire. Juste pas le temps de répondre assez vite.</p>
    </div>
  </div>
</section>

{/* ROI - Version sobre */}
<section className="py-20 bg-slate-50">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Le calcul est simple
      </h2>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="text-4xl font-bold text-slate-900 mb-2">60h/mois</div>
          <div className="text-slate-600">perdues sur l'admin</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-slate-900 mb-2">× 80€/h</div>
          <div className="text-slate-600">votre taux horaire</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-red-600 mb-2">= 4 800€</div>
          <div className="text-slate-600">en fumée chaque mois</div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-8 mb-8">
        <h3 className="text-xl font-semibold mb-6 text-center text-gray-900">Avec CLIC DEVIS</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-2">Investissement</p>
            <p className="text-3xl font-bold text-slate-900">29,99€/mois</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-2">Temps récupéré</p>
            <p className="text-3xl font-bold text-green-600">60h/mois</p>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-200">
          <p className="text-center text-lg">
            <span className="font-semibold">ROI : </span>
            <span className="text-2xl font-bold text-slate-900">160× votre investissement</span>
          </p>
        </div>
      </div>

      <div className="text-center">
        <a href="/signup" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-semibold text-lg px-12 py-4 rounded-lg shadow-lg transition-colors">
          Démarrer l'essai gratuit
        </a>
        <p className="text-sm text-slate-600 mt-4">7 jours gratuits • 29,99€/mois ensuite</p>
      </div>
    </div>
  </div>
</section>

{/* CTA Final sobre */}
<section className="py-20 bg-slate-900 text-white">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-3xl sm:text-4xl font-bold mb-8">
      Testez sans risque pendant 7 jours
    </h2>

    <div className="grid md:grid-cols-2 gap-8 mb-12">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-600">
        <h3 className="text-xl font-semibold mb-4 text-white">Sans CLIC DEVIS</h3>
        <ul className="text-left space-y-2 text-slate-300 text-sm">
          <li>• 15h/semaine sur l'administratif</li>
          <li>• Clients perdus par lenteur</li>
          <li>• Retard sur la concurrence</li>
          <li>• Stress permanent</li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 border border-blue-500 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-white">Avec CLIC DEVIS</h3>
        <ul className="text-left space-y-2 text-white text-sm">
          <li>• 15h/semaine récupérées</li>
          <li>• Réponse rapide = plus de clients</li>
          <li>• Avance technologique</li>
          <li>• Sérénité retrouvée</li>
        </ul>
      </div>
    </div>

    <a href="/signup" className="inline-block bg-white hover:bg-slate-50 text-slate-900 font-semibold text-xl px-14 py-5 rounded-lg shadow-lg transition-colors mb-6">
      Commencer l'essai gratuit
    </a>

    <p className="text-sm text-slate-400">
      7 jours gratuits • 29,99€/mois • Annulation en 2 clics
    </p>
  </div>
</section>

{/* Footer sobre */}
<footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid md:grid-cols-4 gap-8 mb-8">
      <div>
        <h3 className="text-white font-semibold text-lg mb-4">CLIC DEVIS</h3>
        <p className="text-sm">Automatisation IA pour artisans BTP</p>
      </div>
      <div>
        <h4 className="text-white font-medium mb-4">Produit</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="/login" className="hover:text-white transition-colors">Connexion</a></li>
          <li><a href="/signup" className="hover:text-white transition-colors">Inscription</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-medium mb-4">Support</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="/aide" className="hover:text-white transition-colors">Aide</a></li>
          <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-medium mb-4">Légal</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="/cgv" className="hover:text-white transition-colors">CGV</a></li>
          <li><a href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-slate-800 pt-8 text-center text-sm">
      <p>&copy; 2026 CLIC DEVIS - Voisins-le-Bretonneux</p>
    </div>
  </div>
</footer>

{/* Sticky CTA mobile sobre */}
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg md:hidden z-50">
  <a href="/signup" className="block text-center bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors">
    Essai gratuit 7 jours
  </a>
</div>

      </body>
    </html>
  )
}
