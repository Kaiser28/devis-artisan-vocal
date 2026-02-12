import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function testKey() {
  try {
    console.log('🔑 Test de la clé OpenAI...')
    
    // Test 1: Liste des modèles
    const models = await openai.models.list()
    console.log('✅ Accès aux modèles OK')
    
    // Test 2: Completion simple
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Dis bonjour' }],
      max_tokens: 10
    })
    console.log('✅ Chat completions OK')
    
    // Test 3: Liste assistants
    const assistants = await openai.beta.assistants.list({ limit: 1 })
    console.log('✅ Assistants API OK')
    console.log(`   Assistants existants : ${assistants.data.length}`)
    
    console.log('\n🎉 Clé API valide et fonctionnelle !')
    
  } catch (error: any) {
    console.error('❌ Erreur :', error.message)
    console.error('Status:', error.status)
  }
}

testKey()
