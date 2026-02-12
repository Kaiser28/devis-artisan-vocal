import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/base-prix/import - Import CSV
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { csvData } = body

    if (!csvData || !Array.isArray(csvData)) {
      return NextResponse.json(
        { error: 'Format CSV invalide' },
        { status: 400 }
      )
    }

    // Validation et préparation des données
    const validRows = csvData
      .filter((row: any) => row.designation && row.unite && row.prix_unitaire_ht)
      .map((row: any) => ({
        user_id: user.id,
        designation: row.designation.trim(),
        categorie: row.categorie?.trim() || null,
        unite: row.unite.trim(),
        prix_unitaire_ht: parseFloat(row.prix_unitaire_ht),
        tva_taux: row.tva_taux ? parseFloat(row.tva_taux) : 20,
        notes: row.notes?.trim() || null,
        fournisseur: row.fournisseur?.trim() || null,
        source: 'csv',
        usage_count: 0
      }))

    if (validRows.length === 0) {
      return NextResponse.json(
        { error: 'Aucune ligne valide trouvée dans le CSV' },
        { status: 400 }
      )
    }

    // Insertion en batch
    const { data, error } = await supabase
      .from('base_prix')
      .insert(validRows)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      imported: data.length,
      total: csvData.length,
      data
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
