import jsPDF from 'jspdf'

interface DevisData {
  numero: string
  date_creation: string
  client_nom: string
  client_prenom: string
  client_email?: string
  client_telephone?: string
  client_adresse?: string
  client_code_postal?: string
  client_ville?: string
  artisan_raison_sociale?: string
  artisan_siret?: string
  artisan_adresse?: string
  artisan_code_postal?: string
  artisan_ville?: string
  artisan_telephone?: string
  artisan_email?: string
  assurance_compagnie?: string
  assurance_numero_police?: string
  lots: Array<{
    designation: string
    quantite: number
    unite: string
    prix_unitaire_ht: number
    tva_taux: number
    total_ht: number
  }>
  total_ht: number
  tva_montant: number
  total_ttc: number
  remise_pourcentage?: number
  remise_montant?: number
  acompte_pourcentage?: number
  acompte_montant?: number
  conditions_paiement?: string
}

interface Settings {
  logo_url?: string
  mentions_legales?: string
  validite_devis_jours?: number
}

export async function generateDevisPDF(devis: DevisData, settings?: Settings) {
  const doc = new jsPDF()
  
  let yPos = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20

  // === EN-TÊTE ===
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  
  // Artisan (gauche)
  if (devis.artisan_raison_sociale) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(devis.artisan_raison_sociale, margin, yPos)
    yPos += 6
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    if (devis.artisan_siret) {
      doc.text(`SIRET: ${devis.artisan_siret}`, margin, yPos)
      yPos += 5
    }
    if (devis.artisan_adresse) {
      doc.text(devis.artisan_adresse, margin, yPos)
      yPos += 5
    }
    if (devis.artisan_code_postal && devis.artisan_ville) {
      doc.text(`${devis.artisan_code_postal} ${devis.artisan_ville}`, margin, yPos)
      yPos += 5
    }
    if (devis.artisan_telephone) {
      doc.text(`Tél: ${devis.artisan_telephone}`, margin, yPos)
      yPos += 5
    }
    if (devis.artisan_email) {
      doc.text(`Email: ${devis.artisan_email}`, margin, yPos)
      yPos += 5
    }
  }

  // Numéro et date (droite)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`DEVIS ${devis.numero}`, pageWidth - margin, 20, { align: 'right' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const dateStr = new Date(devis.date_creation).toLocaleDateString('fr-FR')
  doc.text(`Date: ${dateStr}`, pageWidth - margin, 28, { align: 'right' })

  yPos = Math.max(yPos, 40) + 10

  // === CLIENT ===
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENT', margin, yPos)
  yPos += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`${devis.client_nom} ${devis.client_prenom}`, margin, yPos)
  yPos += 5

  if (devis.client_adresse) {
    doc.text(devis.client_adresse, margin, yPos)
    yPos += 5
  }
  if (devis.client_code_postal && devis.client_ville) {
    doc.text(`${devis.client_code_postal} ${devis.client_ville}`, margin, yPos)
    yPos += 5
  }
  if (devis.client_telephone) {
    doc.text(`Tél: ${devis.client_telephone}`, margin, yPos)
    yPos += 5
  }
  if (devis.client_email) {
    doc.text(`Email: ${devis.client_email}`, margin, yPos)
    yPos += 5
  }

  yPos += 10

  // === ASSURANCE (si présente) ===
  if (devis.assurance_compagnie) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('ASSURANCE DÉCENNALE', margin, yPos)
    yPos += 7

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${devis.assurance_compagnie}`, margin, yPos)
    yPos += 5
    if (devis.assurance_numero_police) {
      doc.text(`Police n°: ${devis.assurance_numero_police}`, margin, yPos)
      yPos += 5
    }
    yPos += 5
  }

  // === TABLEAU DES LIGNES ===
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('DÉTAIL DU DEVIS', margin, yPos)
  yPos += 7

  // En-têtes tableau
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F')
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Désignation', margin + 2, yPos)
  doc.text('Qté', pageWidth - 100, yPos, { align: 'right' })
  doc.text('Unité', pageWidth - 80, yPos, { align: 'right' })
  doc.text('PU HT', pageWidth - 60, yPos, { align: 'right' })
  doc.text('TVA', pageWidth - 40, yPos, { align: 'right' })
  doc.text('Total HT', pageWidth - margin - 2, yPos, { align: 'right' })
  yPos += 8

  // Lignes
  doc.setFont('helvetica', 'normal')
  devis.lots.forEach((lot) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.text(lot.designation, margin + 2, yPos)
    doc.text(lot.quantite.toString(), pageWidth - 100, yPos, { align: 'right' })
    doc.text(lot.unite, pageWidth - 80, yPos, { align: 'right' })
    doc.text(`${lot.prix_unitaire_ht.toFixed(2)}€`, pageWidth - 60, yPos, { align: 'right' })
    doc.text(`${lot.tva_taux}%`, pageWidth - 40, yPos, { align: 'right' })
    doc.text(`${lot.total_ht.toFixed(2)}€`, pageWidth - margin - 2, yPos, { align: 'right' })
    yPos += 6
  })

  yPos += 5

  // === TOTAUX ===
  doc.setDrawColor(200, 200, 200)
  doc.line(pageWidth - 80, yPos, pageWidth - margin, yPos)
  yPos += 7

  doc.setFont('helvetica', 'normal')
  doc.text('Total HT', pageWidth - 80, yPos)
  doc.text(`${devis.total_ht.toFixed(2)}€`, pageWidth - margin - 2, yPos, { align: 'right' })
  yPos += 6

  if (devis.remise_montant && devis.remise_montant > 0) {
    doc.text(`Remise (${devis.remise_pourcentage}%)`, pageWidth - 80, yPos)
    doc.text(`-${devis.remise_montant.toFixed(2)}€`, pageWidth - margin - 2, yPos, { align: 'right' })
    yPos += 6
  }

  doc.text('TVA', pageWidth - 80, yPos)
  doc.text(`${devis.tva_montant.toFixed(2)}€`, pageWidth - margin - 2, yPos, { align: 'right' })
  yPos += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL TTC', pageWidth - 80, yPos)
  doc.text(`${devis.total_ttc.toFixed(2)}€`, pageWidth - margin - 2, yPos, { align: 'right' })
  yPos += 8

  if (devis.acompte_montant && devis.acompte_montant > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Acompte demandé (${devis.acompte_pourcentage}%)`, pageWidth - 80, yPos)
    doc.text(`${devis.acompte_montant.toFixed(2)}€`, pageWidth - margin - 2, yPos, { align: 'right' })
    yPos += 6
  }

  yPos += 10

  // === CONDITIONS DE PAIEMENT ===
  if (devis.conditions_paiement) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('CONDITIONS DE PAIEMENT', margin, yPos)
    yPos += 5
    
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(devis.conditions_paiement, pageWidth - 2 * margin)
    doc.text(lines, margin, yPos)
    yPos += lines.length * 4 + 5
  }

  // === VALIDITÉ ===
  const validiteDays = settings?.validite_devis_jours || 30
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text(`Devis valable ${validiteDays} jours à compter de la date d'émission.`, margin, yPos)
  yPos += 5

  // === MENTIONS LÉGALES ===
  if (settings?.mentions_legales) {
    yPos += 5
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const legalLines = doc.splitTextToSize(settings.mentions_legales, pageWidth - 2 * margin)
    doc.text(legalLines, margin, yPos)
  }

  return doc
}
