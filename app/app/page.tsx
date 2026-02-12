import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default async function AppPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <LogoutButton />
          </div>

          <div className="bg-indigo-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-indigo-900 mb-4">✅ Authentification SSR fonctionnelle</h2>
            <div className="space-y-2 text-indigo-800">
              <p><strong>Email :</strong> {user.email}</p>
              <p><strong>User ID :</strong> {user.id}</p>
              <p><strong>Créé le :</strong> {new Date(user.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Tests réussis</h3>
            <ul className="list-disc list-inside space-y-1 text-green-800">
              <li>Session persistée via cookies HTTP-only</li>
              <li>Protection de route (proxy.ts)</li>
              <li>Refresh de page sans perte de session</li>
              <li>Server-side rendering (SSR)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
