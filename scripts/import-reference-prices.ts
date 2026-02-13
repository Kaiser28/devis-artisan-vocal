// Script d'import des prix de référence BTP 2026 dans Supabase
// Usage : npx tsx scripts/import-reference-prices.ts

import { createClient } from '@/lib/supabase/server'
import { getReferences } from '@/lib/openai/price-validator'

async function importReferencePrices() {
  console.log('📦 Import des prix de référence BTP 2026...\n')

  const supabase = await createClient()
  
  // Récupérer l'ID de l'artisan (admin)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('❌ Erreur authentification : connectez-vous d\'abord')
    process.exit(1)
  }

  const references = getReferences()
  let imported = 0
  let skipped = 0

  for (const ref of references) {
    // Vérifier si le prix existe déjà
    const { data: existing } = await supabase
      .from('base_prix')
      .select('id')
      .eq('user_id', user.id)
      .eq('designation', ref.designation)
      .single()

    if (existing) {
      console.log(`⏭️  Déjà existant : ${ref.designation}`)
      skipped++
      continue
    }

    // Insérer le prix
    const { error } = await supabase
      .from('base_prix')
      .insert({
        user_id: user.id,
        designation: ref.designation,
        prix_unitaire_ht: (ref.min_ht + ref.max_ht) / 2, // Prix moyen
        unite: ref.unite,
        categorie: ref.categorie,
        tva_taux: ref.tva_taux,
        usage_count: 0
      })

    if (error) {
      console.error(`❌ Erreur pour ${ref.designation} :`, error.message)
    } else {
      console.log(`✅ Importé : ${ref.designation} - ${(ref.min_ht + ref.max_ht) / 2}€/${ref.unite} (TVA ${ref.tva_taux}%)`)
      imported++
    }
  }

  console.log(`\n📊 Résumé :`)
  console.log(`  ✅ ${imported} prix importés`)
  console.log(`  ⏭️  ${skipped} prix déjà existants`)
  console.log(`  📦 Total références : ${references.length}`)
}

// Exécution
importReferencePrices()
  .then(() => {
    console.log('\n✅ Import terminé !')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Erreur fatale :', err)
    process.exit(1)
  })
