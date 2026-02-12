// API pour gérer les threads (conversations) OpenAI + Supabase
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateAssistant, createThread } from '@/lib/openai/assistant'

export const dynamic = 'force-dynamic'

/**
 * GET /api/assistant/thread
 * Récupère le thread actif de l'utilisateur ou en crée un nouveau
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer ou créer l'assistant
    const assistant = await getOrCreateAssistant()

    // Chercher une conversation active (moins de 24h d'inactivité)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: existingConversations, error: fetchError } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('assistant_id', assistant.id)
      .gte('last_message_at', twentyFourHoursAgo)
      .order('last_message_at', { ascending: false })
      .limit(1)

    if (fetchError) {
      console.error('Erreur récupération conversation :', fetchError)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    // Si conversation active trouvée, la retourner
    if (existingConversations && existingConversations.length > 0) {
      const conversation = existingConversations[0]
      console.log('✅ Conversation existante récupérée :', conversation.id)
      
      return NextResponse.json({
        conversation_id: conversation.id,
        thread_id: conversation.thread_id,
        assistant_id: conversation.assistant_id,
        title: conversation.title,
        is_new: false
      })
    }

    // Sinon, créer un nouveau thread OpenAI
    const threadId = await createThread()

    // Créer la conversation en base Supabase
    const { data: newConversation, error: insertError } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        thread_id: threadId,
        assistant_id: assistant.id,
        title: 'Nouvelle conversation',
        last_message_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erreur création conversation :', insertError)
      return NextResponse.json({ error: 'Erreur création conversation' }, { status: 500 })
    }

    console.log('✅ Nouvelle conversation créée :', newConversation.id)

    return NextResponse.json({
      conversation_id: newConversation.id,
      thread_id: newConversation.thread_id,
      assistant_id: newConversation.assistant_id,
      title: newConversation.title,
      is_new: true
    })

  } catch (error) {
    console.error('Erreur API /api/assistant/thread :', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/assistant/thread
 * Crée une nouvelle conversation (force un nouveau thread même si un actif existe)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer ou créer l'assistant
    const assistant = await getOrCreateAssistant()

    // Créer un nouveau thread OpenAI
    const threadId = await createThread()

    // Créer la conversation en base Supabase
    const { data: newConversation, error: insertError } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        thread_id: threadId,
        assistant_id: assistant.id,
        title: 'Nouvelle conversation',
        last_message_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erreur création conversation :', insertError)
      return NextResponse.json({ error: 'Erreur création conversation' }, { status: 500 })
    }

    console.log('✅ Nouvelle conversation forcée créée :', newConversation.id)

    return NextResponse.json({
      conversation_id: newConversation.id,
      thread_id: newConversation.thread_id,
      assistant_id: newConversation.assistant_id,
      title: newConversation.title,
      is_new: true
    })

  } catch (error) {
    console.error('Erreur API POST /api/assistant/thread :', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/assistant/thread?conversation_id=xxx
 * Archive une conversation (soft delete, garde l'historique)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer conversation_id des query params
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')

    if (!conversationId) {
      return NextResponse.json({ error: 'conversation_id manquant' }, { status: 400 })
    }

    // Archiver la conversation (met à jour last_message_at dans le passé pour l'exclure des actives)
    const archiveDate = new Date(0).toISOString() // 01/01/1970
    
    const { error: updateError } = await supabase
      .from('ai_conversations')
      .update({ last_message_at: archiveDate })
      .eq('id', conversationId)
      .eq('user_id', user.id) // Sécurité : seulement ses propres conversations

    if (updateError) {
      console.error('Erreur archivage conversation :', updateError)
      return NextResponse.json({ error: 'Erreur archivage' }, { status: 500 })
    }

    console.log('✅ Conversation archivée :', conversationId)

    return NextResponse.json({ success: true, conversation_id: conversationId })

  } catch (error) {
    console.error('Erreur API DELETE /api/assistant/thread :', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
