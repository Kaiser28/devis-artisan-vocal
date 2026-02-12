// API pour initialiser une conversation (version simplifiée sans Assistants)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Créer une nouvelle conversation
    const { data: conversation, error: insertError } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        thread_id: `simple-${Date.now()}`, // ID simple sans OpenAI
        assistant_id: 'gpt-4o-mini',
        title: 'Nouvelle conversation',
        last_message_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erreur création conversation :', insertError)
      return NextResponse.json({ error: 'Erreur création conversation' }, { status: 500 })
    }

    console.log('✅ Conversation créée :', conversation.id)

    return NextResponse.json({
      conversation_id: conversation.id,
      thread_id: conversation.thread_id
    })

  } catch (error) {
    console.error('Erreur /api/chat/init :', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
