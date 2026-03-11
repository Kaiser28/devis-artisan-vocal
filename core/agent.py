"""
Configuration de l'agent LangChain principal
Orchestration IA pour gestion artisans BTP
"""

from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain.schema import SystemMessage
from typing import List
import os

# Import des tools
from core.tools.sheets_tool import SheetsTool
from core.tools.devis_tool import DevisTool


class ArtisanAgent:
    """Agent IA principal pour un artisan"""
    
    def __init__(self, artisan_id: str, config: dict):
        """
        Initialise l'agent pour un artisan spécifique
        
        Args:
            artisan_id: Identifiant unique de l'artisan
            config: Configuration spécifique (Google Sheets ID, etc.)
        """
        self.artisan_id = artisan_id
        self.config = config
        
        # Initialiser le LLM
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",  # ou gpt-4 selon budget
            temperature=0.3,  # Peu créatif, précis
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Initialiser les tools
        self.tools = self._init_tools()
        
        # Initialiser la mémoire
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Créer le prompt système
        self.prompt = self._create_prompt()
        
        # Créer l'agent
        self.agent = create_openai_functions_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=self.prompt
        )
        
        # Créer l'executor
        self.executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            memory=self.memory,
            verbose=True,  # Debug
            max_iterations=10,
            handle_parsing_errors=True
        )
    
    def _init_tools(self) -> List:
        """Initialise les tools disponibles pour l'agent"""
        sheets_id = self.config.get("google_sheets_id")
        
        return [
            SheetsTool(sheets_id=sheets_id),
            DevisTool(sheets_id=sheets_id, artisan_id=self.artisan_id),
            # Ajouter d'autres tools ici
        ]
    
    def _create_prompt(self) -> ChatPromptTemplate:
        """Crée le prompt système de l'agent"""
        
        system_message = f"""Tu es un assistant IA spécialisé pour {self.config.get('nom_entreprise', 'un artisan')}.

**TES RESPONSABILITÉS :**
1. Gérer les clients (recherche, création, modification)
2. Créer et modifier des devis
3. Vérifier les stocks
4. Gérer l'agenda

**TES OUTILS :**
- search_client : Recherche un client dans Google Sheets
- create_client : Crée un nouveau client
- create_devis : Génère un devis avec calcul automatique HT/TVA/TTC
- get_stock : Vérifie la disponibilité d'un produit
- add_rdv : Ajoute un rendez-vous à l'agenda

**RÈGLES IMPORTANTES :**
1. Toujours confirmer avant de créer/modifier des données
2. Utiliser les outils systématiquement (ne jamais inventer d'infos)
3. Calculer correctement les montants HT/TVA/TTC
4. Être concis et professionnel
5. Si une info manque, la demander

**EXEMPLE D'INTERACTION :**
User : "Crée un devis pour Dupont, peinture 30m²"
Toi : 
1. search_client("Dupont") → Trouve client ou demande infos
2. Récupère prix peinture depuis Google Sheets
3. Calcule : 30m² × 25€ = 750€ HT, TVA 20% = 150€, TTC = 900€
4. create_devis() avec ces données
5. Confirme : "✅ Devis DEV-2026-005 créé pour Dupont. Total TTC : 900€"

**TON STYLE :**
- Professionnel mais accessible
- Utilise emojis : ✅ succès, ⚠️ alerte, 🔍 recherche
- Toujours confirmer les actions importantes
"""
        
        return ChatPromptTemplate.from_messages([
            SystemMessage(content=system_message),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])
    
    async def process_message(self, message: str) -> str:
        """
        Traite un message de l'artisan
        
        Args:
            message: Message texte ou vocal de l'artisan
            
        Returns:
            Réponse de l'agent
        """
        try:
            response = await self.executor.ainvoke({"input": message})
            return response["output"]
        except Exception as e:
            return f"❌ Erreur : {str(e)}. Pouvez-vous reformuler ?"
    
    def reset_memory(self):
        """Réinitialise la mémoire de conversation"""
        self.memory.clear()


# Exemple d'utilisation
if __name__ == "__main__":
    import asyncio
    
    # Configuration artisan exemple
    config = {
        "nom_entreprise": "SFERIA TRAVAUX",
        "google_sheets_id": "1ABC...XYZ",
        "siret": "123 456 789 00012"
    }
    
    # Créer agent
    agent = ArtisanAgent(artisan_id="artisan_1", config=config)
    
    # Test
    async def test():
        response = await agent.process_message(
            "Crée un devis pour Dupont, peinture 30m²"
        )
        print(response)
    
    asyncio.run(test())
