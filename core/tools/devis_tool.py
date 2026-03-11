"""
Tool Génération Devis PDF - Calculs automatiques + export
"""

from langchain.tools import BaseTool
from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from datetime import datetime
import os


class DevisLine(BaseModel):
    """Ligne de prestation devis"""
    designation: str = Field(description="Désignation prestation (ex: Peinture intérieure)")
    quantite: float = Field(description="Quantité (ex: 30)")
    unite: str = Field(description="Unité (m², h, u, forfait)")
    prix_unitaire_ht: float = Field(description="Prix unitaire HT en euros")
    tva_taux: float = Field(default=20.0, description="Taux TVA en % (défaut: 20)")


class CreateDevisInput(BaseModel):
    """Input pour création devis"""
    client_nom: str = Field(description="Nom du client")
    client_prenom: str = Field(description="Prénom du client")
    client_telephone: Optional[str] = Field(None, description="Téléphone client")
    client_adresse: Optional[str] = Field(None, description="Adresse complète client")
    client_ville: Optional[str] = Field(None, description="Ville client")
    
    prestations: List[DevisLine] = Field(description="Liste des prestations/lignes du devis")
    remise_pourcentage: float = Field(default=0, description="Remise en % (0-100)")
    acompte_pourcentage: float = Field(default=0, description="Acompte demandé en % (0-100)")
    conditions_paiement: str = Field(default="Paiement à réception de facture", description="Conditions de paiement")
    validite_jours: int = Field(default=30, description="Validité du devis en jours")


class DevisTool(BaseTool):
    """Tool pour générer des devis PDF avec calculs automatiques"""
    
    name = "devis_tool"
    description = """Génère un devis PDF complet avec calculs automatiques.
    Fonctions :
    - Calcul automatique totaux HT, TVA, TTC
    - Gestion remise et acompte
    - Export PDF professionnel
    - Numérotation automatique
    """
    
    artisan_info: Dict
    output_dir: str = "output/devis"
    
    def __init__(self, artisan_info: Dict):
        """
        Args:
            artisan_info: Dict contenant:
                - raison_sociale
                - siret
                - adresse
                - code_postal
                - ville
                - telephone
                - email
                - assurance_decennale (optionnel)
        """
        super().__init__()
        self.artisan_info = artisan_info
        
        # Créer dossier output si inexistant
        os.makedirs(self.output_dir, exist_ok=True)
    
    def _run(self, **kwargs) -> str:
        """Génère un devis"""
        try:
            # Parser les inputs
            devis_data = CreateDevisInput(**kwargs)
            
            # Générer numéro devis
            numero_devis = self._generate_numero()
            
            # Calculer totaux
            totaux = self._calculate_totals(
                devis_data.prestations,
                devis_data.remise_pourcentage,
                devis_data.acompte_pourcentage
            )
            
            # Générer PDF
            pdf_path = self._generate_pdf(
                numero_devis=numero_devis,
                devis_data=devis_data,
                totaux=totaux
            )
            
            # Formater réponse
            return self._format_response(numero_devis, totaux, pdf_path)
        
        except Exception as e:
            return f"❌ Erreur génération devis : {str(e)}"
    
    async def _arun(self, **kwargs) -> str:
        """Version asynchrone"""
        return self._run(**kwargs)
    
    def _generate_numero(self) -> str:
        """Génère un numéro de devis unique"""
        # Format : DEV-YYYY-NNNN
        annee = datetime.now().year
        
        # Compter devis existants dans le dossier
        existing_files = [f for f in os.listdir(self.output_dir) if f.startswith(f"DEV-{annee}")]
        next_num = len(existing_files) + 1
        
        return f"DEV-{annee}-{next_num:04d}"
    
    def _calculate_totals(self, prestations: List[DevisLine], remise_pct: float, acompte_pct: float) -> Dict:
        """Calcule tous les totaux du devis"""
        
        # Total HT brut
        total_ht_brut = sum(
            p.quantite * p.prix_unitaire_ht for p in prestations
        )
        
        # Remise
        montant_remise = total_ht_brut * (remise_pct / 100)
        total_ht_net = total_ht_brut - montant_remise
        
        # TVA (simplifiée : on prend le taux de la première ligne)
        # En vrai, il faut calculer par taux de TVA
        tva_taux = prestations[0].tva_taux if prestations else 20.0
        montant_tva = total_ht_net * (tva_taux / 100)
        
        # Total TTC
        total_ttc = total_ht_net + montant_tva
        
        # Acompte
        montant_acompte = total_ttc * (acompte_pct / 100)
        reste_a_payer = total_ttc - montant_acompte
        
        return {
            "total_ht_brut": round(total_ht_brut, 2),
            "remise_pct": remise_pct,
            "montant_remise": round(montant_remise, 2),
            "total_ht_net": round(total_ht_net, 2),
            "tva_taux": tva_taux,
            "montant_tva": round(montant_tva, 2),
            "total_ttc": round(total_ttc, 2),
            "acompte_pct": acompte_pct,
            "montant_acompte": round(montant_acompte, 2),
            "reste_a_payer": round(reste_a_payer, 2)
        }
    
    def _generate_pdf(self, numero_devis: str, devis_data: CreateDevisInput, totaux: Dict) -> str:
        """Génère le fichier PDF"""
        
        filename = f"{numero_devis}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        # Créer document
        doc = SimpleDocTemplate(
            filepath,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Style titre
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=30
        )
        
        # En-tête : DEVIS
        elements.append(Paragraph(f"DEVIS {numero_devis}", title_style))
        elements.append(Spacer(1, 0.5*cm))
        
        # Informations artisan (gauche) et client (droite)
        info_data = [
            ["ARTISAN", "CLIENT"],
            [
                Paragraph(f"""<b>{self.artisan_info['raison_sociale']}</b><br/>
                SIRET: {self.artisan_info.get('siret', 'N/A')}<br/>
                {self.artisan_info.get('adresse', '')}<br/>
                {self.artisan_info.get('code_postal', '')} {self.artisan_info.get('ville', '')}<br/>
                Tél: {self.artisan_info.get('telephone', '')}<br/>
                Email: {self.artisan_info.get('email', '')}""", styles['Normal']),
                
                Paragraph(f"""<b>{devis_data.client_prenom} {devis_data.client_nom}</b><br/>
                {devis_data.client_telephone or ''}<br/>
                {devis_data.client_adresse or ''}<br/>
                {devis_data.client_ville or ''}""", styles['Normal'])
            ]
        ]
        
        info_table = Table(info_data, colWidths=[9*cm, 9*cm])
        info_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ]))
        
        elements.append(info_table)
        elements.append(Spacer(1, 1*cm))
        
        # Date et validité
        date_str = datetime.now().strftime("%d/%m/%Y")
        elements.append(Paragraph(f"Date : {date_str}", styles['Normal']))
        elements.append(Paragraph(f"Validité : {devis_data.validite_jours} jours", styles['Normal']))
        elements.append(Spacer(1, 0.5*cm))
        
        # Tableau prestations
        prestation_data = [
            ["Désignation", "Qté", "Unité", "P.U. HT", "Total HT"]
        ]
        
        for p in devis_data.prestations:
            total_ligne = p.quantite * p.prix_unitaire_ht
            prestation_data.append([
                p.designation,
                str(p.quantite),
                p.unite,
                f"{p.prix_unitaire_ht:.2f} €",
                f"{total_ligne:.2f} €"
            ])
        
        prestation_table = Table(prestation_data, colWidths=[8*cm, 2*cm, 2*cm, 3*cm, 3*cm])
        prestation_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        elements.append(prestation_table)
        elements.append(Spacer(1, 0.5*cm))
        
        # Tableau totaux
        totaux_data = [
            ["Total HT brut", f"{totaux['total_ht_brut']:.2f} €"],
        ]
        
        if totaux['remise_pct'] > 0:
            totaux_data.append([f"Remise ({totaux['remise_pct']:.0f}%)", f"- {totaux['montant_remise']:.2f} €"])
            totaux_data.append(["Total HT net", f"{totaux['total_ht_net']:.2f} €"])
        
        totaux_data.append([f"TVA ({totaux['tva_taux']:.0f}%)", f"{totaux['montant_tva']:.2f} €"])
        totaux_data.append(["TOTAL TTC", f"{totaux['total_ttc']:.2f} €"])
        
        if totaux['acompte_pct'] > 0:
            totaux_data.append([f"Acompte demandé ({totaux['acompte_pct']:.0f}%)", f"{totaux['montant_acompte']:.2f} €"])
            totaux_data.append(["Reste à payer", f"{totaux['reste_a_payer']:.2f} €"])
        
        totaux_table = Table(totaux_data, colWidths=[12*cm, 6*cm])
        totaux_table.setStyle(TableStyle([
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, -2), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -2), (-1, -1), 12),
            ('LINEABOVE', (0, -2), (-1, -2), 2, colors.HexColor('#2563eb')),
            ('BACKGROUND', (0, -2), (-1, -1), colors.HexColor('#eff6ff')),
        ]))
        
        elements.append(totaux_table)
        elements.append(Spacer(1, 1*cm))
        
        # Conditions de paiement
        elements.append(Paragraph("<b>Conditions de paiement</b>", styles['Heading3']))
        elements.append(Paragraph(devis_data.conditions_paiement, styles['Normal']))
        
        # Assurance décennale si présente
        if self.artisan_info.get('assurance_decennale'):
            elements.append(Spacer(1, 0.5*cm))
            elements.append(Paragraph(
                f"<i>Assurance décennale : {self.artisan_info['assurance_decennale']}</i>",
                styles['Normal']
            ))
        
        # Générer PDF
        doc.build(elements)
        
        return filepath
    
    def _format_response(self, numero: str, totaux: Dict, pdf_path: str) -> str:
        """Formate la réponse pour l'agent"""
        
        response = f"""✅ **Devis {numero} généré avec succès !**

📋 **Résumé** :
- Total HT : {totaux['total_ht_net']:.2f} €
- TVA ({totaux['tva_taux']:.0f}%) : {totaux['montant_tva']:.2f} €
- **TOTAL TTC : {totaux['total_ttc']:.2f} €**
"""
        
        if totaux['remise_pct'] > 0:
            response += f"- Remise appliquée : {totaux['remise_pct']:.0f}% (-{totaux['montant_remise']:.2f} €)\n"
        
        if totaux['acompte_pct'] > 0:
            response += f"- Acompte demandé : {totaux['montant_acompte']:.2f} € ({totaux['acompte_pct']:.0f}%)\n"
            response += f"- Reste à payer : {totaux['reste_a_payer']:.2f} €\n"
        
        response += f"\n💾 **PDF sauvegardé** : `{pdf_path}`"
        
        return response


# Helper function pour LangChain
def create_devis(client_nom: str, prestations: List[Dict], **kwargs) -> str:
    """
    Wrapper simplifié pour LangChain function calling
    
    Args:
        client_nom: Nom du client
        prestations: Liste de dict avec keys: designation, quantite, unite, prix_unitaire_ht
        **kwargs: Autres paramètres (prenom, telephone, remise, etc.)
    """
    # Cette fonction sera wrappée par DevisTool
    pass
