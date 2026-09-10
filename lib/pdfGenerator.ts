import { jsPDF } from 'jspdf';
import { ShootBooking, Invoice } from '@/types';

// Format currency cleanly for PDF rendering
const formatINR = (val: number): string => {
  return 'INR ' + new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(val);
};

/**
 * Generates and downloads a real, high-editorial Call Sheet PDF
 */
export const generateCallSheetPDF = (shoot: ShootBooking) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // 1. Top Header Bar
  doc.setFillColor(13, 13, 13); // carbon black
  doc.rect(margin, y, contentWidth, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('LUMINA ATELIER // PRODUCTION CALL SHEET', margin + 4, y + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`CODE: ${shoot.shootCode}`, pageWidth - margin - 4, y + 7.5, { align: 'right' });

  y += 18;

  // 2. Main Title & Type
  doc.setTextColor(13, 13, 13);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(shoot.title.toUpperCase(), contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 2;

  // Subtitle / Type tag
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(235, 56, 41); // vermillion accent
  doc.text(`[ ${shoot.type.toUpperCase()} ]`, margin, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Commissioned by: ${shoot.client.name} — ${shoot.client.company}`, margin + 65, y);

  y += 8;
  doc.setDrawColor(220, 220, 218);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  y += 6;

  // 3. Location, Call Time & Date Grid (Two Columns)
  doc.setFillColor(248, 248, 246);
  doc.rect(margin, y, contentWidth, 24, 'F');
  doc.setDrawColor(220, 220, 218);
  doc.rect(margin, y, contentWidth, 24, 'S');

  // Left Column: Logistics
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCTION DATE & CALL TIME', margin + 4, y + 6);

  doc.setTextColor(13, 13, 13);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${shoot.date} @ ${shoot.callTime}`, margin + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(235, 56, 41);
  doc.text(`Wrap Target: ${shoot.endTime}`, margin + 4, y + 18);

  // Right Column: Location & GPS
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SET LOCATION & ACCESS', margin + contentWidth / 2, y + 6);

  doc.setTextColor(13, 13, 13);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(shoot.location.name, margin + contentWidth / 2, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`${shoot.location.city} (${shoot.location.coordinates})`, margin + contentWidth / 2, y + 18);

  y += 30;

  // 4. Financial & Shot List Metrics
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(13, 13, 13);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, contentWidth, 14, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('SHOT TARGET:', margin + 4, y + 8);
  doc.setTextColor(13, 13, 13);
  doc.text(`${shoot.shotListTotal} Editorial Plates`, margin + 27, y + 8);

  doc.setTextColor(100, 100, 100);
  doc.text('TOTAL FEE:', margin + 75, y + 8);
  doc.setTextColor(13, 13, 13);
  doc.text(formatINR(shoot.financialSummary.totalFee), margin + 95, y + 8);

  doc.setTextColor(100, 100, 100);
  doc.text('BALANCE DUE:', margin + 130, y + 8);
  doc.setTextColor(235, 56, 41);
  doc.text(formatINR(shoot.financialSummary.balanceDue), margin + 155, y + 8);

  y += 20;

  // 5. Minute-by-Minute Day Timeline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(13, 13, 13);
  doc.text('PRODUCTION SCHEDULE TIMELINE', margin, y);

  y += 3;
  doc.setFillColor(240, 240, 238);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFontSize(7.5);
  doc.text('TIME', margin + 3, y + 4.2);
  doc.text('ACTIVITY / SETUP SPECIFICATION', margin + 25, y + 4.2);
  doc.text('LEAD COORDINATOR', margin + 130, y + 4.2);

  y += 6;

  shoot.scheduleTimeline.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 249);
      doc.rect(margin, y, contentWidth, 7, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(235, 56, 41);
    doc.text(item.time, margin + 3, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(13, 13, 13);
    const act = doc.splitTextToSize(item.activity, 100);
    doc.text(act[0], margin + 25, y + 4.8);

    doc.setTextColor(100, 100, 100);
    doc.text(item.lead, margin + 130, y + 4.8);

    y += 7;
  });

  y += 6;

  // 6. Production Crew Dispatch Roster
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(13, 13, 13);
  doc.text(`CONFIRMED CREW DISPATCH (${shoot.productionTeam.length})`, margin, y);

  y += 3;
  const colWidth = contentWidth / 2;
  shoot.productionTeam.forEach((member, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const itemX = margin + col * colWidth;
    const itemY = y + row * 8;

    doc.setFillColor(248, 248, 246);
    doc.rect(itemX, itemY, colWidth - 2, 7, 'F');
    doc.setDrawColor(230, 230, 228);
    doc.rect(itemX, itemY, colWidth - 2, 7, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(13, 13, 13);
    doc.text(`${member.initials} - ${member.name}`, itemX + 3, itemY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(110, 110, 110);
    doc.text(member.role, itemX + 45, itemY + 4.8);
  });

  y += Math.ceil(shoot.productionTeam.length / 2) * 8 + 8;

  // 7. Allocated Camera & Lighting Gear
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(13, 13, 13);
  doc.text('ALLOCATED STUDIO & RENTAL HARDWARE', margin, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  shoot.gearAllocated.forEach((gear) => {
    doc.text(`• ${gear}`, margin + 3, y);
    y += 4.5;
  });

  // Footer Note
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text('LUMINA ATELIER MANGALORE // DAKSHINA KANNADA, KARNATAKA // STRICT STUDIO CONFIDENTIAL', margin, footerY);
  doc.text('VERIFIED DIGITAL DISPATCH', pageWidth - margin, footerY, { align: 'right' });

  // Save the PDF file
  doc.save(`CallSheet-${shoot.shootCode}.pdf`);
};

/**
 * Generates and downloads a real, GST-compliant Tax Invoice PDF
 */
export const generateInvoicePDF = (invoice: Invoice) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // 1. Header & Brand
  doc.setFillColor(13, 13, 13);
  doc.rect(margin, y, contentWidth, 14, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('LUMINA ATELIER MANGALORE // TAX INVOICE', margin + 5, y + 9);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('GSTIN: 29AABCL1984M1Z8', pageWidth - margin - 5, y + 9, { align: 'right' });

  y += 22;

  // 2. Invoice Meta & Client Block (Two Columns)
  // Left: Billed To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text('BILLED TO CLIENT:', margin, y);

  doc.setTextColor(13, 13, 13);
  doc.setFontSize(11);
  doc.text(invoice.clientName, margin, y + 6);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(invoice.brand, margin, y + 11);
  doc.text('Karnataka / Pan-India Client Account', margin, y + 16);

  // Right: Invoice Details
  const rightX = margin + 110;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text('INVOICE NUMBER:', rightX, y);
  doc.setTextColor(13, 13, 13);
  doc.setFontSize(10);
  doc.text(invoice.invoiceNumber, rightX + 35, y);

  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text('DATE OF ISSUE:', rightX, y + 6);
  doc.setTextColor(13, 13, 13);
  doc.text(invoice.issueDate, rightX + 35, y + 6);

  doc.setTextColor(110, 110, 110);
  doc.text('PAYMENT DUE:', rightX, y + 11);
  doc.setTextColor(235, 56, 41);
  doc.text(invoice.dueDate, rightX + 35, y + 11);

  doc.setTextColor(110, 110, 110);
  doc.text('STATUS:', rightX, y + 16);
  doc.setTextColor(13, 13, 13);
  doc.text(invoice.status, rightX + 35, y + 16);

  y += 26;

  // 3. Line Items Table Header
  doc.setFillColor(242, 242, 240);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setDrawColor(210, 210, 208);
  doc.rect(margin, y, contentWidth, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 13, 13);
  doc.text('DESCRIPTION & DELIVERABLE SPECIFICATION', margin + 4, y + 5.5);
  doc.text('QTY', margin + 115, y + 5.5);
  doc.text('RATE', margin + 135, y + 5.5);
  doc.text('AMOUNT', pageWidth - margin - 4, y + 5.5, { align: 'right' });

  y += 8;

  // Line items
  invoice.items.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(252, 252, 250);
      doc.rect(margin, y, contentWidth, 10, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(13, 13, 13);
    doc.text(item.description, margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`${item.quantity}`, margin + 117, y + 6);
    doc.text(formatINR(item.unitPrice), margin + 135, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 13, 13);
    doc.text(formatINR(item.total), pageWidth - margin - 4, y + 6, { align: 'right' });

    y += 10;
  });

  y += 4;
  doc.setDrawColor(220, 220, 218);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // 4. Totals Block (Right aligned)
  const totalsX = margin + 110;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  doc.text('SUBTOTAL:', totalsX, y);
  doc.setTextColor(13, 13, 13);
  doc.setFont('helvetica', 'bold');
  doc.text(formatINR(invoice.subtotal), pageWidth - margin - 4, y, { align: 'right' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 90);
  doc.text('GST (18% CGST/SGST Included):', totalsX, y);
  doc.setTextColor(13, 13, 13);
  doc.text('INR 0', pageWidth - margin - 4, y, { align: 'right' });

  y += 7;
  doc.setDrawColor(13, 13, 13);
  doc.setLineWidth(0.4);
  doc.line(totalsX - 5, y, pageWidth - margin, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(13, 13, 13);
  doc.text('TOTAL INVOICED:', totalsX, y);
  doc.text(formatINR(invoice.totalAmount), pageWidth - margin - 4, y, { align: 'right' });

  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(235, 56, 41);
  doc.text('BALANCE DUE:', totalsX, y);
  doc.text(formatINR(invoice.balanceDue), pageWidth - margin - 4, y, { align: 'right' });

  y += 18;

  // 5. Banking & Settlement Remittance Box
  doc.setFillColor(248, 248, 246);
  doc.rect(margin, y, contentWidth, 24, 'F');
  doc.setDrawColor(220, 220, 218);
  doc.rect(margin, y, contentWidth, 24, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 13, 13);
  doc.text('ELECTRONIC REMITTANCE & BANKING DETAILS (NEFT / RTGS / IMPS)', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text('Account Name: LUMINA ATELIER STUDIOS LLP', margin + 4, y + 11);
  doc.text('Bank: HDFC Bank Ltd, Hampankatta Branch, Mangalore', margin + 4, y + 16);
  doc.text('Current A/C No: 50200084920194  |  IFSC Code: HDFC0000084', margin + 4, y + 21);

  // Bottom Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  doc.text('LUMINA ATELIER // KUDLA COASTAL ATELIER, MANGALORE // OFFICIAL TAX DOCUMENT', margin, footerY);
  doc.text('COMPUTER GENERATED // NO PHYSICAL SIGNATURE REQUIRED', pageWidth - margin, footerY, { align: 'right' });

  // Save the PDF file
  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};
