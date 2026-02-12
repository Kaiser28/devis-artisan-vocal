import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
  }

  // Validation
  const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return NextResponse.json({ 
      error: 'Type de fichier invalide. Formats acceptés : JPG, PNG, SVG, WebP' 
    }, { status: 400 })
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ 
      error: 'Fichier trop volumineux. Taille max : 2 MB' 
    }, { status: 400 })
  }

  // Upload vers Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/logo.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true // Écrase l'ancien logo
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Récupérer URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(fileName)

  // Sauvegarder dans user_settings
  const { error: updateError } = await supabase
    .from('user_settings')
    .upsert({
      user_id: user.id,
      logo_url: publicUrl
    }, {
      onConflict: 'user_id'
    })

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ logo_url: publicUrl })
}

export async function DELETE() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Supprimer tous les fichiers du dossier user
  const { data: files } = await supabase.storage
    .from('logos')
    .list(user.id)

  if (files && files.length > 0) {
    const filesToRemove = files.map(file => `${user.id}/${file.name}`)
    
    const { error: deleteError } = await supabase.storage
      .from('logos')
      .remove(filesToRemove)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
  }

  // Supprimer l'URL dans user_settings
  const { error: updateError } = await supabase
    .from('user_settings')
    .update({ logo_url: null })
    .eq('user_id', user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
