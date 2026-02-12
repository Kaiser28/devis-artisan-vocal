// Script pour créer l'assistant OpenAI une fois
import OpenAI from 'openai'
import { ASSISTANT_INSTRUCTIONS, ASSISTANT_TOOLS } from '../lib/openai/assistant'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function createAssistant() {
  try {
    console.log('🤖 Création de l\'assistant OpenAI...')
    
    const assistant = await openai.beta.assistants.create({
      name: 'Devis BTP Assistant',
      instructions: ASSISTANT_INSTRUCTIONS,
      model: 'gpt-4o-mini',
      tools: ASSISTANT_TOOLS,
      temperature: 0.7,
      metadata: {
        version: '1.0',
        created_at: new Date().toISOString()
      }
    })

    console.log('\n✅ Assistant créé avec succès !')
    console.log('\n📋 ID de l\'assistant :')
    console.log(assistant.id)
    console.log('\n💡 Ajoutez cette variable d\'environnement dans Vercel :')
    console.log(`OPENAI_ASSISTANT_ID=${assistant.id}`)
    console.log('\n🔗 https://vercel.com/test-s-projects-49d52526/devis-artisan-vocal-f2sf/settings/environment-variables')

  } catch (error) {
    console.error('❌ Erreur création assistant :', error)
    process.exit(1)
  }
}

createAssistant()
