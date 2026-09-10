import { jsPDF } from 'jspdf';
import { ShootBooking, Invoice, Quotation, PDFThemeColor, StudioSettings } from '@/types';
import { defaultStudioSettings } from '@/lib/catalogDefaults';

// Format currency cleanly for PDF rendering
const formatINR = (val: number): string => {
  return 'Rs ' + new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(val) + ' /-';
};

interface PDFColorPalette {
  bg: [number, number, number];
  strip: [number, number, number];
  text: [number, number, number];
  muted: [number, number, number];
  accent: [number, number, number];
}

const PDF_PALETTES: Record<string, PDFColorPalette> = {
  sage: {
    bg: [243, 247, 244],
    strip: [228, 237, 231],
    text: [15, 23, 20],
    muted: [90, 105, 98],
    accent: [235, 56, 41],
  },
  monochrome: {
    bg: [248, 248, 248],
    strip: [232, 232, 232],
    text: [13, 13, 13],
    muted: [100, 100, 100],
    accent: [13, 13, 13],
  },
  sand_gold: {
    bg: [252, 250, 245],
    strip: [243, 236, 222],
    text: [28, 24, 18],
    muted: [120, 105, 85],
    accent: [175, 125, 40],
  },
  terracotta: {
    bg: [253, 247, 246],
    strip: [248, 231, 229],
    text: [30, 18, 16],
    muted: [125, 85, 80],
    accent: [215, 55, 40],
  },
};

// Helper: Convert hex to RGB tuple
const hexToRgb = (hex: string): [number, number, number] => {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [15, 23, 20];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

// Helper: Blend two RGB colors
const blendRgb = (
  c1: [number, number, number],
  c2: [number, number, number],
  ratio: number
): [number, number, number] => {
  return [
    Math.round(c1[0] * (1 - ratio) + c2[0] * ratio),
    Math.round(c1[1] * (1 - ratio) + c2[1] * ratio),
    Math.round(c1[2] * (1 - ratio) + c2[2] * ratio),
  ];
};

// Resolves theme palette from presets or custom customer palettes defined in settings
export const resolvePDFPalette = (settings: StudioSettings): PDFColorPalette => {
  const themeId = settings.pdfThemeColor || 'sage';

  // Check preset first
  if (PDF_PALETTES[themeId]) {
    return PDF_PALETTES[themeId];
  }

  // Check custom palettes
  if (settings.customPalettes && settings.customPalettes.length > 0) {
    const found = settings.customPalettes.find((p) => p.id === themeId);
    if (found) {
      const primaryRgb = hexToRgb(found.primaryColor);
      const bgRgb = hexToRgb(found.backgroundColor || '#f8f9fa');
      const textRgb = hexToRgb(found.textColor || '#111827');
      const stripRgb = blendRgb(bgRgb, primaryRgb, 0.12);
      const mutedRgb = blendRgb(textRgb, [150, 150, 150], 0.45);

      return {
        bg: bgRgb,
        strip: stripRgb,
        text: textRgb,
        muted: mutedRgb,
        accent: primaryRgb,
      };
    }
  }

  return PDF_PALETTES.sage;
};

/**
 * Generates an exact 2-page luxury Quotation PDF with custom theme colour and studio settings
 */
export const generateQuotationPDF = (
  quote: Quotation,
  settings: StudioSettings = defaultStudioSettings
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const palette = resolvePDFPalette(settings);

  // Background tint
  const drawBackground = () => {
    doc.setFillColor(palette.bg[0], palette.bg[1], palette.bg[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  // Draw Brand Header (LUMINA Only - No VOWS)
  const drawHeader = (yPos: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
    doc.text(settings.studioName, margin, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(palette.muted[0], palette.muted[1], palette.muted[2]);
    doc.text(settings.tagline, margin, yPos + 3.5);

    // Quotation Number top right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
    doc.text(quote.quotationNumber, pageWidth - margin, yPos, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: PACKAGE, REQUIREMENTS, DELIVERABLES
  // ==========================================
  drawBackground();
  drawHeader(24);

  let y = 48;

  // 1. Big "PACKAGE" title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text(quote.packageTitle.toUpperCase(), margin, y);

  y += 12;

  // 2. Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Date:  ${quote.date}`, margin, y);

  y += 14;

  // 3. Quoted To Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text('Quoted to:', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(quote.clientName, margin, y + 6);
  doc.text(quote.clientCity, margin, y + 12);

  y += 24;

  // 4. Requirements & Price Table
  doc.setFillColor(palette.strip[0], palette.strip[1], palette.strip[2]);
  doc.roundedRect(margin, y, contentWidth, 9, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text('Requirement', margin + 6, y + 6.2);
  doc.text('Price', pageWidth - margin - 8, y + 6.2, { align: 'right' });

  y += 11;

  const activeReqs = quote.requirements.filter((r) => r.included);
  activeReqs.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
    doc.text(item.name, margin + 6, y + 4.5);

    const priceText = item.price && item.price !== '-' ? `${item.price}` : '-';
    doc.text(priceText, pageWidth - margin - 8, y + 4.5, { align: 'right' });

    y += 9;
  });

  y += 2;

  // Total Strip
  doc.setFillColor(palette.strip[0], palette.strip[1], palette.strip[2]);
  doc.roundedRect(margin, y, contentWidth, 9, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text('Total', margin + 6, y + 6.3);
  doc.text(formatINR(quote.totalPrice), pageWidth - margin - 8, y + 6.3, { align: 'right' });

  y += 22;

  // 5. Deliverables Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text('Deliverables', pageWidth / 2, y, { align: 'center' });

  y += 8;

  // Deliverables Table Header
  doc.setFillColor(palette.strip[0], palette.strip[1], palette.strip[2]);
  doc.roundedRect(margin, y, contentWidth, 9, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text('Items', margin + 6, y + 6.2);
  doc.text('Details', margin + 95, y + 6.2);

  y += 11;

  const activeDeliverables = quote.deliverables.filter((d) => d.included);
  activeDeliverables.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
    doc.text(item.item, margin + 6, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(palette.muted[0], palette.muted[1], palette.muted[2]);
    const detailsLines = doc.splitTextToSize(item.details, contentWidth - 100);
    doc.text(detailsLines[0] || '', margin + 95, y + 4.5);

    y += 9;
  });

  // ==========================================
  // PAGE 2: CREW MEMBERS & TERMS & CONDITIONS
  // ==========================================
  doc.addPage();
  drawBackground();
  drawHeader(24);

  y = 44;

  // 6. Crew Members Table
  doc.setFillColor(palette.strip[0], palette.strip[1], palette.strip[2]);
  doc.roundedRect(margin, y, contentWidth, 9, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text('Crew Members', margin + 6, y + 6.2);
  doc.text('Number', pageWidth - margin - 8, y + 6.2, { align: 'right' });

  y += 11;

  quote.crewAllocation.forEach((crew) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
    doc.text(crew.role, margin + 6, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.text(`${crew.number}`, pageWidth - margin - 8, y + 4.5, { align: 'right' });

    y += 9;
  });

  y += 16;

  // 7. Terms & Conditions Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text('Terms & Conditions', pageWidth / 2, y, { align: 'center' });
  const textWidth = doc.getTextWidth('Terms & Conditions');
  doc.setDrawColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.setLineWidth(0.4);
  doc.line(pageWidth / 2 - textWidth / 2, y + 1.5, pageWidth / 2 + textWidth / 2, y + 1.5);

  y += 12;

  // 8. Terms List (from quote or dynamic settings)
  const terms = quote.termsAndConditions || settings.termsAndConditions;
  doc.setFontSize(8.5);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);

  terms.forEach((term, idx) => {
    const fullText = `${idx + 1}. ${term}`;
    const wrapped = doc.splitTextToSize(fullText, contentWidth - 4);
    doc.setFont('helvetica', 'normal');
    doc.text(wrapped, margin + 2, y);
    y += wrapped.length * 4.6 + 1.6;
  });

  // 9. Bottom Footer Bar: Contact Name & Phone
  const footerY = pageHeight - 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text((quote.contactPerson || settings.contactPerson).toUpperCase(), margin, footerY);
  doc.text(quote.contactPhone || settings.contactPhone, pageWidth - margin, footerY, { align: 'right' });

  // Save the 2-page PDF
  doc.save(`${quote.quotationNumber.replace(/\s+/g, '_')}_${quote.clientName.replace(/\s+/g, '_')}.pdf`);
};

/**
 * Generates an official Tax Invoice PDF with dynamic theme colour and banking remittance
 */
export const generateInvoicePDF = (
  invoice: Invoice,
  settings: StudioSettings = defaultStudioSettings
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const palette = resolvePDFPalette(settings);

  // Background tint
  doc.setFillColor(palette.bg[0], palette.bg[1], palette.bg[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text(settings.studioName, margin, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(palette.muted[0], palette.muted[1], palette.muted[2]);
  doc.text(settings.tagline, margin, 27.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text(invoice.invoiceNumber, pageWidth - margin, 24, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  if (settings.hasGst && settings.gstin) {
    doc.text(`GSTIN: ${settings.gstin}`, pageWidth - margin, 28, { align: 'right' });
  } else {
    doc.text(`Small Enterprise // Non-GST`, pageWidth - margin, 28, { align: 'right' });
  }

  let y = 46;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text(settings.hasGst && settings.gstin ? 'TAX INVOICE' : 'STUDIO INVOICE', margin, y);

  y += 10;
  doc.setFontSize(9.5);
  doc.text(`Date of Issue:  ${invoice.issueDate}    |    Due Date:  ${invoice.dueDate}`, margin, y);

  y += 14;

  // Quoted To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Billed to:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(invoice.clientName, margin, y + 6);
  doc.text(invoice.brand, margin, y + 11);

  // Status tag
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(palette.accent[0], palette.accent[1], palette.accent[2]);
  doc.text(`STATUS: ${invoice.status}`, pageWidth - margin, y + 6, { align: 'right' });

  y += 24;

  // Items Table Header
  doc.setFillColor(palette.strip[0], palette.strip[1], palette.strip[2]);
  doc.roundedRect(margin, y, contentWidth, 9, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text('Deliverables & Coverage', margin + 6, y + 6.2);
  doc.text('Qty', margin + 110, y + 6.2);
  doc.text('Amount (INR)', pageWidth - margin - 8, y + 6.2, { align: 'right' });

  y += 11;

  invoice.items.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
    const lines = doc.splitTextToSize(item.description, 100);
    doc.text(lines[0], margin + 6, y + 4.5);
    doc.text(`${item.quantity}`, margin + 112, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(formatINR(item.total), pageWidth - margin - 8, y + 4.5, { align: 'right' });

    y += 9;
  });

  y += 4;

  // Totals
  doc.setFillColor(palette.strip[0], palette.strip[1], palette.strip[2]);
  doc.roundedRect(margin, y, contentWidth, 9, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text('Total Invoiced', margin + 6, y + 6.3);
  doc.text(formatINR(invoice.totalAmount), pageWidth - margin - 8, y + 6.3, { align: 'right' });

  y += 14;

  if (invoice.balanceDue > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(palette.accent[0], palette.accent[1], palette.accent[2]);
    doc.text(`Balance Payable:  ${formatINR(invoice.balanceDue)}`, pageWidth - margin, y, { align: 'right' });
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(35, 120, 50);
    doc.text('PAYMENT CLEARED IN FULL', pageWidth - margin, y, { align: 'right' });
  }

  y += 18;

  // Remittance Box using Dynamic Settings
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, 26, 1, 1, 'F');
  doc.setDrawColor(215, 225, 218);
  doc.roundedRect(margin, y, contentWidth, 26, 1, 1, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text('BANKING REMITTANCE (NEFT / RTGS / IMPS / UPI)', margin + 6, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(palette.muted[0], palette.muted[1], palette.muted[2]);
  doc.text(`Account Name: ${settings.bankingDetails.accountName}`, margin + 6, y + 12);
  doc.text(`Bank: ${settings.bankingDetails.bankName}, ${settings.bankingDetails.branch}`, margin + 6, y + 17);
  doc.text(`A/C No: ${settings.bankingDetails.accountNumber}  |  IFSC: ${settings.bankingDetails.ifscCode}${settings.bankingDetails.upiId ? `  |  UPI: ${settings.bankingDetails.upiId}` : ''}`, margin + 6, y + 22);

  // Footer
  const footerY = pageHeight - 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text(`${settings.contactPerson.toUpperCase()} // STUDIO PRINCIPAL`, margin, footerY);
  doc.text(settings.contactPhone, pageWidth - margin, footerY, { align: 'right' });

  doc.save(`${invoice.invoiceNumber}.pdf`);
};

/**
 * Call Sheet PDF export
 */
export const generateCallSheetPDF = (
  shoot: ShootBooking,
  settings: StudioSettings = defaultStudioSettings
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const palette = PDF_PALETTES[settings.pdfThemeColor || 'sage'] || PDF_PALETTES.sage;

  doc.setFillColor(palette.bg[0], palette.bg[1], palette.bg[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top Bar
  doc.setFillColor(13, 13, 13);
  doc.rect(margin, 20, contentWidth, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('LUMINA ATELIER // PRODUCTION CALL SHEET', margin + 4, 27.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`CODE: ${shoot.shootCode}`, pageWidth - margin - 4, 27.5, { align: 'right' });

  let y = 42;

  // Title
  doc.setTextColor(13, 13, 13);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  const titleLines = doc.splitTextToSize(shoot.title.toUpperCase(), contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6.5 + 2;

  // Type
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(palette.accent[0], palette.accent[1], palette.accent[2]);
  doc.text(`[ ${shoot.type.toUpperCase()} ]`, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Client: ${shoot.client.name} — ${shoot.client.company}`, margin + 65, y);

  y += 10;

  // Logistics Box
  doc.setFillColor(palette.strip[0], palette.strip[1], palette.strip[2]);
  doc.roundedRect(margin, y, contentWidth, 22, 1, 1, 'F');

  doc.setTextColor(70, 80, 75);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCTION DATE & CALL TIME', margin + 4, y + 6);
  doc.setTextColor(13, 13, 13);
  doc.setFontSize(9);
  doc.text(`${shoot.date} @ ${shoot.callTime}`, margin + 4, y + 12);
  doc.setFontSize(8);
  doc.setTextColor(palette.accent[0], palette.accent[1], palette.accent[2]);
  doc.text(`Wrap Target: ${shoot.endTime}`, margin + 4, y + 17.5);

  doc.setTextColor(70, 80, 75);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SET LOCATION & ACCESS', margin + contentWidth / 2, y + 6);
  doc.setTextColor(13, 13, 13);
  doc.setFontSize(9);
  doc.text(shoot.location.name, margin + contentWidth / 2, y + 12);
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text(`${shoot.location.city} (${shoot.location.coordinates})`, margin + contentWidth / 2, y + 17.5);

  y += 30;

  // Timeline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 20);
  doc.text('PRODUCTION SCHEDULE TIMELINE', margin, y);

  y += 3;
  doc.setFillColor(palette.strip[0], palette.strip[1], palette.strip[2]);
  doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'F');
  doc.setFontSize(7.5);
  doc.text('TIME', margin + 3, y + 4.2);
  doc.text('ACTIVITY / SPECIFICATION', margin + 25, y + 4.2);
  doc.text('LEAD', margin + 125, y + 4.2);

  y += 7;

  shoot.scheduleTimeline.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(palette.accent[0], palette.accent[1], palette.accent[2]);
    doc.text(item.time, margin + 3, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(13, 13, 13);
    const act = doc.splitTextToSize(item.activity, 95);
    doc.text(act[0], margin + 25, y + 4);

    doc.setTextColor(90, 90, 90);
    doc.text(item.lead, margin + 125, y + 4);

    y += 6.5;
  });

  y += 6;

  // Crew Members
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 20);
  doc.text(`CONFIRMED CREW DISPATCH (${shoot.productionTeam.length})`, margin, y);

  y += 3;
  const colWidth = contentWidth / 2;
  shoot.productionTeam.forEach((member, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const itemX = margin + col * colWidth;
    const itemY = y + row * 8;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(itemX, itemY, colWidth - 2, 7, 1, 1, 'F');
    doc.setDrawColor(220, 220, 218);
    doc.roundedRect(itemX, itemY, colWidth - 2, 7, 1, 1, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(13, 13, 13);
    doc.text(`${member.initials} - ${member.name}`, itemX + 3, itemY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(member.role, itemX + 45, itemY + 4.8);
  });

  // Footer
  const footerY = pageHeight - 12;
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('LUMINA ATELIER MANGALORE // COASTAL KARNATAKA // STRICT STUDIO CONFIDENTIAL', margin, footerY);
  doc.text('VERIFIED DIGITAL DISPATCH', pageWidth - margin, footerY, { align: 'right' });

  doc.save(`CallSheet-${shoot.shootCode}.pdf`);
};
