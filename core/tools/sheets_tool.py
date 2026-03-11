"""
Tool Google Sheets - CRUD clients et devis
"""

from langchain.tools import BaseTool
from typing import Optional, Type
from pydantic import BaseModel, Field
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os


class SearchClientInput(BaseModel):
    """Input pour recherche client"""
    query: str = Field(description="Nom, prénom, téléphone ou email du client à rechercher")


class CreateClientInput(BaseModel):
    """Input pour création client"""
    nom: str = Field(description="Nom de famille du client")
    prenom: str = Field(description="Prénom du client")
    telephone: Optional[str] = Field(None, description="Téléphone (format: 06 XX XX XX XX)")
    email: Optional[str] = Field(None, description="Email du client")
    ville: Optional[str] = Field(None, description="Ville du client")
    adresse: Optional[str] = Field(None, description="Adresse complète")
    code_postal: Optional[str] = Field(None, description="Code postal")


class SheetsTool(BaseTool):
    """Tool pour interagir avec Google Sheets"""
    
    name = "sheets_tool"
    description = """Outil pour gérer les clients dans Google Sheets.
    Fonctions disponibles :
    - search_client : Recherche un client par nom/prénom/téléphone
    - create_client : Crée un nouveau client
    - get_all_clients : Liste tous les clients
    """
    
    sheets_id: str
    client: Optional[gspread.Client] = None
    
    def __init__(self, sheets_id: str):
        super().__init__()
        self.sheets_id = sheets_id
        self._init_sheets()
    
    def _init_sheets(self):
        """Initialise la connexion Google Sheets"""
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        
        # Credentials depuis fichier JSON
        creds_path = os.getenv("GOOGLE_CREDENTIALS_PATH", "config/google_credentials.json")
        creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
        
        self.client = gspread.authorize(creds)
    
    def _run(self, action: str, **kwargs) -> str:
        """Exécute une action sur Google Sheets"""
        try:
            if action == "search_client":
                return self._search_client(kwargs.get("query", ""))
            elif action == "create_client":
                return self._create_client(**kwargs)
            elif action == "get_all_clients":
                return self._get_all_clients()
            else:
                return f"❌ Action inconnue : {action}"
        except Exception as e:
            return f"❌ Erreur Google Sheets : {str(e)}"
    
    async def _arun(self, action: str, **kwargs) -> str:
        """Version asynchrone"""
        return self._run(action, **kwargs)
    
    def _search_client(self, query: str) -> str:
        """Recherche un client dans l'onglet Clients"""
        try:
            sheet = self.client.open_by_key(self.sheets_id)
            worksheet = sheet.worksheet("Clients")
            
            # Récupérer toutes les données
            data = worksheet.get_all_records()
            
            # Recherche floue
            query_lower = query.lower()
            results = []
            
            for row in data:
                if (query_lower in str(row.get('nom', '')).lower() or
                    query_lower in str(row.get('prenom', '')).lower() or
                    query_lower in str(row.get('telephone', '')).lower() or
                    query_lower in str(row.get('email', '')).lower()):
                    results.append(row)
            
            if not results:
                return f"❌ Aucun client trouvé pour '{query}'"
            
            # Formater résultats
            output = f"✅ {len(results)} client(s) trouvé(s) :\n\n"
            for r in results:
                output += f"👤 {r.get('prenom', '')} {r.get('nom', '')}\n"
                output += f"   📞 {r.get('telephone', 'Non renseigné')}\n"
                output += f"   📍 {r.get('ville', 'Non renseigné')}\n"
                output += f"   ID: {r.get('id', 'N/A')}\n\n"
            
            return output
        
        except Exception as e:
            return f"❌ Erreur recherche client : {str(e)}"
    
    def _create_client(self, **kwargs) -> str:
        """Crée un nouveau client"""
        try:
            sheet = self.client.open_by_key(self.sheets_id)
            worksheet = sheet.worksheet("Clients")
            
            # Générer ID client
            existing_data = worksheet.get_all_records()
            new_id = f"CLT-{len(existing_data) + 1:04d}"
            
            # Préparer ligne
            new_row = [
                new_id,
                kwargs.get('nom', ''),
                kwargs.get('prenom', ''),
                kwargs.get('email', ''),
                kwargs.get('telephone', ''),
                kwargs.get('adresse', ''),
                kwargs.get('code_postal', ''),
                kwargs.get('ville', ''),
            ]
            
            # Ajouter à la fin
            worksheet.append_row(new_row)
            
            return f"""✅ Client créé avec succès !

👤 {kwargs.get('prenom', '')} {kwargs.get('nom', '')}
🆔 ID: {new_id}
📞 {kwargs.get('telephone', 'Non renseigné')}
📍 {kwargs.get('ville', 'Non renseigné')}"""
        
        except Exception as e:
            return f"❌ Erreur création client : {str(e)}"
    
    def _get_all_clients(self) -> str:
        """Liste tous les clients"""
        try:
            sheet = self.client.open_by_key(self.sheets_id)
            worksheet = sheet.worksheet("Clients")
            data = worksheet.get_all_records()
            
            if not data:
                return "📋 Aucun client enregistré"
            
            output = f"📋 {len(data)} client(s) enregistré(s) :\n\n"
            for r in data[:10]:  # Max 10 pour éviter spam
                output += f"• {r.get('prenom', '')} {r.get('nom', '')} ({r.get('ville', 'N/A')})\n"
            
            if len(data) > 10:
                output += f"\n... et {len(data) - 10} autre(s)"
            
            return output
        
        except Exception as e:
            return f"❌ Erreur liste clients : {str(e)}"


# Helper functions pour LangChain Function Calling
def search_client(query: str) -> str:
    """Recherche un client dans Google Sheets"""
    # Cette fonction sera wrappée par LangChain
    pass


def create_client(nom: str, prenom: str, telephone: str = None, 
                 email: str = None, ville: str = None) -> str:
    """Crée un nouveau client dans Google Sheets"""
    pass
