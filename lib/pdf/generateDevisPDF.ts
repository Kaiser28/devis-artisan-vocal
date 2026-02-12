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
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const colMiddle = pageWidth / 2

  // Couleurs
  const primaryColor: [number, number, number] = [41, 128, 185] // Bleu professionnel
  const grayColor: [number, number, number] = [100, 100, 100]
  const lightGray: [number, number, number] = [240, 240, 240]

  // === BANDEAU HAUT ===
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 50, 'F')

  // Logo (si disponible)
  if (settings?.logo_url) {
    try {
      // Note: en production, il faudrait charger l'image via fetch + canvas
      // Pour l'instant on met juste un placeholder
      doc.setFillColor(255, 255, 255)
      doc.rect(margin, 10, 30, 30, 'F')
    } catch (err) {
      console.error('Erreur chargement logo:', err)
    }
  }

  // Titre DEVIS en blanc
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('DEVIS', pageWidth - margin, 25, { align: 'right' })
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(devis.numero, pageWidth - margin, 35, { align: 'right' })
  const dateStr = new Date(devis.date_creation).toLocaleDateString('fr-FR')
  doc.text(`Date: ${dateStr}`, pageWidth - margin, 42, { align: 'right' })

  yPos = 65

  // === SECTION ARTISAN (Gauche) & CLIENT (Droite) ===
  doc.setTextColor(...grayColor)
  
  // ARTISAN - Colonne gauche
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('ARTISAN', margin, yPos)
  yPos += 7
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  if (devis.artisan_raison_sociale) {
    doc.text(devis.artisan_raison_sociale, margin, yPos)
    yPos += 5
  }
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...grayColor)
  
  if (devis.artisan_siret) {
    doc.text(`SIRET: ${devis.artisan_siret}`, margin, yPos)
    yPos += 4
  }
  if (devis.artisan_adresse) {
    doc.text(devis.artisan_adresse, margin, yPos)
    yPos += 4
  }
  if (devis.artisan_code_postal && devis.artisan_ville) {
    doc.text(`${devis.artisan_code_postal} ${devis.artisan_ville}`, margin, yPos)
    yPos += 4
  }
  if (devis.artisan_telephone) {
    doc.text(`Tél: ${devis.artisan_telephone}`, margin, yPos)
    yPos += 4
  }
  if (devis.artisan_email) {
    doc.text(`Email: ${devis.artisan_email}`, margin, yPos)
  }

  // CLIENT - Colonne droite
  let yClient = 65
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('CLIENT', colMiddle + 10, yClient)
  yClient += 7
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(`${devis.client_prenom} ${devis.client_nom}`, colMiddle + 10, yClient)
  yClient += 5
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...grayColor)
  
  if (devis.client_adresse) {
    doc.text(devis.client_adresse, colMiddle + 10, yClient)
    yClient += 4
  }
  if (devis.client_code_postal && devis.client_ville) {
    doc.text(`${devis.client_code_postal} ${devis.client_ville}`, colMiddle + 10, yClient)
    yClient += 4
  }
  if (devis.client_telephone) {
    doc.text(`Tél: ${devis.client_telephone}`, colMiddle + 10, yClient)
    yClient += 4
  }
  if (devis.client_email) {
    doc.text(`Email: ${devis.client_email}`, colMiddle + 10, yClient)
  }

  yPos = Math.max(yPos, yClient) + 15

  // === ASSURANCE DÉCENNALE (si présente) ===
  if (devis.assurance_compagnie && devis.assurance_numero_police) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('Assurance Décennale', margin, yPos)
    yPos += 5
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    doc.text(`${devis.assurance_compagnie} - Police n°: ${devis.assurance_numero_police}`, margin, yPos)
    yPos += 10
  }

  // === LIGNE DE SÉPARATION ===
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // === TABLEAU DES LIGNES ===
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.setFillColor(...primaryColor)
  
  const tableStartY = yPos
  const colWidths = {
    designation: 70,
    qte: 15,
    unite: 20,
    puht: 25,
    tva: 15,
    totalht: 30
  }
  
  // En-tête tableau
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  yPos += 6
  
  let xPos = margin + 2
  doc.text('Désignation', xPos, yPos)
  xPos += colWidths.designation
  doc.text('Qté', xPos, yPos)
  xPos += colWidths.qte
  doc.text('Unité', xPos, yPos)
  xPos += colWidths.unite
  doc.text('PU HT', xPos, yPos)
  xPos += colWidths.puht
  doc.text('TVA', xPos, yPos)
  xPos += colWidths.tva
  doc.text('Total HT', xPos, yPos)
  
  yPos += 5

  // Lignes du tableau
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  
  devis.lots.forEach((lot, index) => {
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = 20
    }
    
    // Fond alterné
    if (index % 2 === 0) {
      doc.setFillColor(...lightGray)
      doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 8, 'F')
    }
    
    xPos = margin + 2
    
    // Désignation (avec wrapping si trop long)
    const maxWidth = colWidths.designation - 4
    const lines = doc.splitTextToSize(lot.designation, maxWidth)
    doc.text(lines, xPos, yPos)
    
    xPos += colWidths.designation
    doc.text(lot.quantite.toString(), xPos, yPos)
    
    xPos += colWidths.qte
    doc.text(lot.unite, xPos, yPos)
    
    xPos += colWidths.unite
    doc.text(`${lot.prix_unitaire_ht.toFixed(2)} €`, xPos, yPos)
    
    xPos += colWidths.puht
    doc.text(`${lot.tva_taux}%`, xPos, yPos)
    
    xPos += colWidths.tva
    doc.text(`${lot.total_ht.toFixed(2)} €`, xPos, yPos)
    
    yPos += lines.length > 1 ? 8 * lines.length : 8
  })

  yPos += 5

  // === TOTAUX ===
  const totalsX = pageWidth - margin - 70
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...grayColor)
  
  // Total HT
  doc.text('Total HT:', totalsX, yPos)
  doc.text(`${devis.total_ht.toFixed(2)} €`, totalsX + 50, yPos, { align: 'right' })
  yPos += 6

  // Remise (si applicable)
  if (devis.remise_montant && devis.remise_montant > 0) {
    doc.text(`Remise (${devis.remise_pourcentage}%):`, totalsX, yPos)
    doc.text(`-${devis.remise_montant.toFixed(2)} €`, totalsX + 50, yPos, { align: 'right' })
    yPos += 6
  }

  // TVA
  doc.text('TVA:', totalsX, yPos)
  doc.text(`${devis.tva_montant.toFixed(2)} €`, totalsX + 50, yPos, { align: 'right' })
  yPos += 6

  // Total TTC
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...primaryColor)
  doc.text('Total TTC:', totalsX, yPos)
  doc.text(`${devis.total_ttc.toFixed(2)} €`, totalsX + 50, yPos, { align: 'right' })
  yPos += 8

  // Acompte (si applicable)
  if (devis.acompte_montant && devis.acompte_montant > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...grayColor)
    doc.text(`Acompte (${devis.acompte_pourcentage}%):`, totalsX, yPos)
    doc.text(`${devis.acompte_montant.toFixed(2)} €`, totalsX + 50, yPos, { align: 'right' })
    yPos += 6
    
    doc.setFont('helvetica', 'bold')
    doc.text('Reste à payer:', totalsX, yPos)
    doc.text(`${(devis.total_ttc - devis.acompte_montant).toFixed(2)} €`, totalsX + 50, yPos, { align: 'right' })
  }

  yPos += 15

  // === CONDITIONS DE PAIEMENT ===
  if (devis.conditions_paiement) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...primaryColor)
    doc.text('Conditions de paiement', margin, yPos)
    yPos += 5
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...grayColor)
    const conditionsLines = doc.splitTextToSize(devis.conditions_paiement, pageWidth - 2 * margin)
    doc.text(conditionsLines, margin, yPos)
    yPos += conditionsLines.length * 4 + 5
  }

  // === VALIDITÉ ===
  const validiteDays = settings?.validite_devis_jours || 30
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(...grayColor)
  doc.text(`Devis valable ${validiteDays} jours à compter de la date d'émission.`, margin, yPos)
  yPos += 5

  // === MENTIONS LÉGALES (bas de page) ===
  if (settings?.mentions_legales) {
    const footerY = pageHeight - 25
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...grayColor)
    const mentionsLines = doc.splitTextToSize(settings.mentions_legales, pageWidth - 2 * margin)
    doc.text(mentionsLines, margin, footerY)
  }

  // === LIGNE BAS DE PAGE ===
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.3)
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

  // === Téléchargement ===
  doc.save(`Devis_${devis.numero}.pdf`)
}
