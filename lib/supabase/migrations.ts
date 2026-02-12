// Utilitaire pour appliquer les migrations Supabase
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export async function applyMigration(migrationFile: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local')
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const migrationPath = path.join(process.cwd(), 'migrations', migrationFile)
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  console.log(`📦 Application de la migration : ${migrationFile}`)

  // Exécuter le SQL via l'API Supabase
  // Note: Supabase n'a pas d'API SQL directe, on utilise donc un script Node
  // Alternative : exécuter manuellement dans le dashboard Supabase
  
  console.log('⚠️  Migration SQL prête. Appliquez-la manuellement dans le dashboard Supabase :')
  console.log('https://supabase.com/dashboard/project/YOUR_PROJECT/sql')
  console.log('\nOU utilisez psql :')
  console.log(`psql "${process.env.DATABASE_URL}" < migrations/${migrationFile}`)
  
  return sql
}
