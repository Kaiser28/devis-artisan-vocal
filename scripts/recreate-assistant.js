// Script pour recréer l'assistant OpenAI avec les nouvelles fonctions
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Import des configurations depuis lib/openai/assistant.ts
const { ASSISTANT_INSTRUCTIONS, ASSISTANT_TOOLS } = require('../lib/openai/assistant.ts');

async function recreateAssistant() {
  try {
    console.log('🚀 Création du nouvel assistant OpenAI...\n');
    
    // Supprimer l'ancien assistant si l'ID existe
    if (process.env.OPENAI_ASSISTANT_ID) {
      try {
        console.log(`🗑️  Suppression ancien assistant : ${process.env.OPENAI_ASSISTANT_ID}`);
        await openai.beta.assistants.del(process.env.OPENAI_ASSISTANT_ID);
        console.log('✅ Ancien assistant supprimé\n');
      } catch (error) {
        console.log('⚠️  Ancien assistant déjà supprimé ou introuvable\n');
      }
    }

    // Créer le nouvel assistant
    const assistant = await openai.beta.assistants.create({
      name: 'Devis BTP Assistant v2 - Workflow Autonome',
      instructions: ASSISTANT_INSTRUCTIONS,
      model: 'gpt-4o-mini',
      tools: ASSISTANT_TOOLS,
      temperature: 0.7,
      metadata: {
        version: '2.0',
        features: 'autonomous_workflow,create_client,check_duplicate,create_price,update_devis',
        created_at: new Date().toISOString()
      }
    });

    console.log('✅ Nouvel assistant créé avec succès !\n');
    console.log('📋 Détails :');
    console.log(`   ID: ${assistant.id}`);
    console.log(`   Nom: ${assistant.name}`);
    console.log(`   Modèle: ${assistant.model}`);
    console.log(`   Tools: ${assistant.tools.length} fonctions`);
    console.log(`   Version: ${assistant.metadata?.version}\n`);
    
    console.log('📝 ACTIONS REQUISES :\n');
    console.log('1️⃣  Ajouter dans /home/user/devis-vocal/.env.local :');
    console.log(`   OPENAI_ASSISTANT_ID=${assistant.id}\n`);
    
    console.log('2️⃣  Ajouter dans Vercel → Settings → Environment Variables :');
    console.log(`   OPENAI_ASSISTANT_ID=${assistant.id}\n`);
    
    console.log('3️⃣  Redémarrer le serveur local si actif\n');
    
    console.log('🔧 Tools disponibles :');
    assistant.tools.forEach((tool, idx) => {
      if (tool.type === 'function') {
        console.log(`   ${idx + 1}. ${tool.function.name}`);
      }
    });
    
    return assistant.id;
    
  } catch (error) {
    console.error('❌ Erreur création assistant :', error.message);
    if (error.response) {
      console.error('Détails :', error.response.data);
    }
    process.exit(1);
  }
}

recreateAssistant();
