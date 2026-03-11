"""
Agent LangChain principal - Orchestrateur multi-artisan
"""

import os
from typing import Dict, List, Optional
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain_core.messages import SystemMessage

# Import des tools
from core.tools.sheets_tool import SheetsTool


class ArtisanAgent:
    """
    Agent IA pour un artisan spécifique
    - Utilise LangChain function calling
    - Connecté au Google Sheets de l'artisan
    - Outils modulaires (clients, devis, stocks, calendrier)
    """
    
    def __init__(self, artisan_id: str, config: Dict):
        """
        Initialise l'agent pour un artisan
        
        Args:
            artisan_id: Identifiant unique artisan (ex: "artisan_dupont_78")
            config: Configuration artisan contenant:
                - sheets_id: ID du Google Sheets
                - phone_number: Numéro WhatsApp artisan
                - raison_sociale: Nom entreprise
                - specialites: Liste spécialités (peinture, plomberie, etc.)
        """
        self.artisan_id = artisan_id
        self.config = config
        
        # Initialiser LLM
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",  # ou "gpt-4o" pour plus de puissance
            temperature=0.7,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Initialiser les tools
        self.tools = self._init_tools()
        
        # Créer le prompt système
        self.prompt = self._create_prompt()
        
        # Créer l'agent
        self.agent = create_openai_functions_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=self.prompt
        )
        
        # Créer l'executor avec mémoire
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        self.executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            memory=self.memory,
            verbose=True,  # Pour debug
            max_iterations=5,
            handle_parsing_errors=True
        )
    
    def _init_tools(self) -> List:
        """Initialise les tools disponibles pour l'agent"""
        tools = []
        
        # Tool Google Sheets (clients, devis, stocks)
        sheets_tool = SheetsTool(sheets_id=self.config["sheets_id"])
        tools.append(sheets_tool)
        
        # TODO: Ajouter d'autres tools
        # - DevisTool (génération PDF)
        # - CalendarTool (rendez-vous)
        # - StockTool (inventaire)
        
        return tools
    
    def _create_prompt(self) -> ChatPromptTemplate:
        """Crée le prompt système personnalisé pour l'artisan"""
        
        system_message = f"""Tu es l'assistant IA de {self.config['raison_sociale']}, artisan spécialisé en {', '.join(self.config.get('specialites', ['BTP']))}.

**TON RÔLE** :
- Aider l'artisan dans sa gestion quotidienne (clients, devis, stocks, rendez-vous)
- Comprendre ses demandes en français naturel
- Utiliser les outils automatiquement pour effectuer les actions
- Répondre de manière concise et professionnelle

**OUTILS DISPONIBLES** :
1. **sheets_tool** : Gestion clients dans Google Sheets
   - search_client(query) : Recherche un client
   - create_client(nom, prenom, telephone, email, ville, ...) : Crée un client
   - get_all_clients() : Liste tous les clients

2. **devis_tool** (à venir) : Génération de devis PDF
3. **calendar_tool** (à venir) : Gestion rendez-vous
4. **stock_tool** (à venir) : Vérification stocks

**WORKFLOW CLIENT OBLIGATOIRE** :
1. Demande création client → search_client(nom) d'abord
2. Si client trouvé → utiliser client existant
3. Si client NON trouvé → create_client() avec données fournies
4. Données manquantes → demander nom + (email OU telephone) minimum

**WORKFLOW DEVIS** :
1. Identifier le client (recherche ou création)
2. Récupérer les prestations demandées
3. Calculer totaux HT, TVA, TTC
4. Générer le PDF devis
5. Enregistrer dans Google Sheets

**STYLE DE COMMUNICATION** :
- Tutoiement professionnel ("Tu")
- Emojis pour clarté (✅ ❌ 🔍 📞 💰)
- Confirmation systématique des actions importantes
- Résumé clair des résultats

**EXEMPLE D'INTERACTION** :
Artisan : "Crée un devis pour Dupont, peinture 30m²"
Assistant :
1. 🔍 Recherche client "Dupont"...
2. ❌ Client non trouvé. Informations manquantes :
   - Téléphone ou email ?
   - Ville ?

Artisan : "06 50 50 50 50, Versailles"
Assistant :
1. ✅ Client créé : Dupont (06 50 50 50 50, Versailles)
2. 📋 Génération devis peinture 30m² :
   - HT : 750 €
   - TVA (20%) : 150 €
   - **TOTAL TTC : 900 €**
3. ✅ Devis DEV-2026-001 créé et enregistré

**IMPORTANT** :
- Toujours vérifier l'existence avant de créer (éviter doublons)
- Demander confirmation avant actions irréversibles (envoi email, facturation)
- Garder traces de toutes les conversations dans la mémoire
"""
        
        return ChatPromptTemplate.from_messages([
            SystemMessage(content=system_message),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
    
    def process_message(self, message: str) -> str:
        """
        Traite un message de l'artisan et retourne la réponse
        
        Args:
            message: Message texte ou transcription vocale
            
        Returns:
            Réponse de l'agent (texte)
        """
        try:
            result = self.executor.invoke({"input": message})
            return result["output"]
        except Exception as e:
            return f"❌ Erreur lors du traitement : {str(e)}"
    
    async def process_message_async(self, message: str) -> str:
        """Version asynchrone pour webhooks"""
        try:
            result = await self.executor.ainvoke({"input": message})
            return result["output"]
        except Exception as e:
            return f"❌ Erreur lors du traitement : {str(e)}"
    
    def reset_memory(self):
        """Réinitialise la mémoire de conversation"""
        self.memory.clear()


# Factory pour créer des agents par artisan
class AgentFactory:
    """Factory pour gérer plusieurs agents artisans"""
    
    _instances: Dict[str, ArtisanAgent] = {}
    
    @classmethod
    def get_agent(cls, artisan_id: str, config: Dict) -> ArtisanAgent:
        """
        Récupère ou crée un agent pour un artisan
        Pattern Singleton par artisan_id
        """
        if artisan_id not in cls._instances:
            cls._instances[artisan_id] = ArtisanAgent(artisan_id, config)
        return cls._instances[artisan_id]
    
    @classmethod
    def remove_agent(cls, artisan_id: str):
        """Supprime un agent (libère mémoire)"""
        if artisan_id in cls._instances:
            del cls._instances[artisan_id]


# Exemple d'utilisation (pour tests locaux)
if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    
    # Configuration test
    test_config = {
        "sheets_id": "VOTRE_SHEETS_ID_ICI",
        "phone_number": "+33650505050",
        "raison_sociale": "Dupont Peinture",
        "specialites": ["Peinture", "Ravalement"]
    }
    
    # Créer agent
    agent = ArtisanAgent(
        artisan_id="artisan_test_001",
        config=test_config
    )
    
    # Test interaction
    print("🤖 Agent initialisé. Tapez 'quit' pour quitter.\n")
    while True:
        user_input = input("Artisan : ")
        if user_input.lower() in ["quit", "exit", "q"]:
            break
        
        response = agent.process_message(user_input)
        print(f"Assistant : {response}\n")
