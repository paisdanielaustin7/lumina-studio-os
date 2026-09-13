'use client';

import React, { useState, useEffect } from 'react';
import { Invoice, StudioSettings, UserAccount } from '@/types';
import { FileText, Download, CheckCircle, Clock, AlertCircle, Lock, Landmark } from 'lucide-react';
import { generateInvoicePDF, resolvePDFPalette } from '@/lib/pdfGenerator';
import { defaultStudioSettings } from '@/lib/catalogDefaults';

interface InvoicesViewProps {
  invoices: Invoice[];
  settings?: StudioSettings;
  currentUser?: UserAccount;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ invoices, settings, currentUser }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>(invoices[0]);

  const canViewFinances = currentUser ? currentUser.canViewFinances : true;

  // Keep selectedInvoice in sync if invoices list updates
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      if (!selectedInvoice || !invoices.some((i) => i.id === selectedInvoice.id)) {
        setSelectedInvoice(invoices[0]);
      } else {
        const refreshed = invoices.find((i) => i.id === selectedInvoice.id);
        if (refreshed) setSelectedInvoice(refreshed);
      }
    }
  }, [invoices, selectedInvoice]);

  const effectiveSettings = settings || defaultStudioSettings;
  const previewPalette = resolvePDFPalette(effectiveSettings);
  const previewBg = `rgb(${previewPalette.bg.join(',')})`;
  const previewText = `rgb(${previewPalette.text.join(',')})`;
  const previewStrip = `rgb(${previewPalette.strip.join(',')})`;
  const previewMuted = `rgb(${previewPalette.muted.join(',')})`;
  const previewAccent = `rgb(${previewPalette.accent.join(',')})`;

  const formatCurrency = (val: number) => {
    if (!canViewFinances) return '₹ ••••••';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-bone-border dark:border-obsidian-border">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-bone-muted dark:text-obsidian-muted mb-1">
            <span>Commercial Finance</span>
            <span>//</span>
            <span className="text-vermillion font-bold">Client Retainers & Settlement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-black tracking-tight text-carbon dark:text-white uppercase">
            Billing & Invoices
          </h1>
        </div>

        <button
          onClick={() => alert('New invoice draft initialised.')}
          className="px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-mono uppercase tracking-widest bg-carbon text-bone dark:bg-white dark:text-carbon hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center gap-1.5 sm:gap-2"
        >
          <FileText size={14} />
          <span>Draft New Invoice</span>
        </button>
      </div>

      {/* Grid: Invoice List (Left) + Detailed Invoice Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Invoices List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted block">
            Archived & Active Invoices ({invoices.length})
          </span>
          <div className="space-y-2">
            {invoices.map((inv) => {
              const isSelected = selectedInvoice.id === inv.id;
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-4 border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-2 border-carbon dark:border-white bg-bone-card dark:bg-obsidian-card shadow-brutalist-light dark:shadow-brutalist-dark'
                      : 'border-bone-border dark:border-obsidian-border bg-bone-card/60 dark:bg-obsidian-card/40 hover:border-carbon dark:hover:border-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-carbon dark:text-white">{inv.invoiceNumber}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 uppercase tracking-widest font-bold border ${
                        inv.status === 'PAID'
                          ? 'border-green-600/30 text-green-700 dark:text-green-400 bg-green-500/10'
                          : 'border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-carbon dark:text-white">
                    {inv.brand}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs font-mono">
                    <span className="text-bone-muted dark:text-obsidian-muted">
                      Due: {inv.dueDate}
                    </span>
                    <span className="font-bold text-carbon dark:text-white">
                      {formatCurrency(inv.totalAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Invoice Details Deck (Strictly Light Mode Paper / PDF Theme) */}
        {selectedInvoice ? (
          <div
            className="lg:col-span-7 border-2 border-carbon dark:border-white p-4 sm:p-6 lg:p-8 shadow-xl space-y-5 sm:space-y-6 max-h-none lg:max-h-[calc(100vh-140px)] overflow-visible lg:overflow-y-auto"
            style={{ backgroundColor: previewBg, color: previewText }}
          >
            {/* Header: Pure LUMINA Branding */}
            <div
              className="flex items-start justify-between pb-3 border-b"
              style={{ borderColor: previewStrip }}
            >
              <div>
                <span className="font-serif font-black text-lg sm:text-xl tracking-widest uppercase block">
                  {effectiveSettings.studioName}
                </span>
                <span className="text-[8.5px] font-mono text-[#6e7d76] uppercase tracking-wider block">
                  {effectiveSettings.tagline}
                </span>
                <span className="text-[8.5px] font-mono text-[#6e7d76] uppercase tracking-wider block mt-0.5">
                  {effectiveSettings.hasGst && effectiveSettings.gstin
                    ? `TAX INVOICE // GSTIN: ${effectiveSettings.gstin}`
                    : 'STUDIO INVOICE // Non-GST Enterprise'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold block">{selectedInvoice.invoiceNumber}</span>
                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 font-bold inline-block mt-1 ${
                    selectedInvoice.status === 'PAID'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
            </div>

            {/* Title & Dates */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase tracking-tight">
                {effectiveSettings.hasGst && effectiveSettings.gstin ? 'Tax Invoice' : 'Studio Invoice'}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
                <span className="text-[#3b4741]">
                  <strong>Issue Date:</strong> {selectedInvoice.issueDate}
                </span>
                <span className="text-[#6e7d76]">•</span>
                <span className="text-vermillion font-bold">
                  <strong>Due Date:</strong> {selectedInvoice.dueDate}
                </span>
              </div>
            </div>

            {/* Quoted / Billed to Client */}
            <div className="font-mono text-[11px] space-y-0.5">
              <span className="font-bold uppercase text-[9.5px] text-[#6e7d76] block mb-0.5">
                Billed to Client:
              </span>
              <p className="font-bold text-xs text-[#0f1714]">{selectedInvoice.clientName}</p>
              <p className="text-[#3b4741]">{selectedInvoice.brand}</p>
            </div>

            {/* Line Items Table */}
            <div className="border border-[#d8e2dc] rounded-sm overflow-hidden bg-white/70">
              <div
                className="px-3.5 py-1.5 flex justify-between font-mono text-[11px] font-bold text-[#19231e]"
                style={{ backgroundColor: previewStrip }}
              >
                <span>Item & Deliverable</span>
                <span>Total</span>
              </div>
              <div className="divide-y divide-[#e4ede7] text-[11px] font-mono bg-white/80">
                {selectedInvoice.items.map((item) => (
                  <div key={item.id} className="p-3 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-[#0f1714] block">{item.description}</span>
                      <span className="text-[10px] text-[#5a6962]">
                        Qty {item.quantity} × {formatCurrency(item.unitPrice)}
                      </span>
                    </div>
                    <span className="font-bold text-[#0f1714]">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Calculation */}
            <div className="pt-2 border-t border-[#d8e2dc] space-y-1.5 text-xs font-mono text-right">
              <div className="flex justify-between">
                <span className="text-[#5a6962] uppercase">Subtotal</span>
                <span className="font-bold text-[#0f1714]">{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a6962] uppercase">
                  {effectiveSettings.hasGst ? 'Integrated GST (18% CGST/SGST Included)' : 'GST Registration'}
                </span>
                <span className="text-[#0f1714]">
                  {effectiveSettings.hasGst ? '₹0.00' : 'Not Applicable (Small Business)'}
                </span>
              </div>
              <div
                className="flex justify-between text-sm sm:text-base font-black px-3 py-2 border border-[#d8e2dc] rounded-sm"
                style={{ backgroundColor: previewStrip, color: previewText }}
              >
                <span className="uppercase font-serif">Total Invoiced</span>
                <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold pt-1">
                <span className="uppercase text-[#5a6962]">Remaining Balance Due</span>
                <span className={selectedInvoice.balanceDue > 0 ? 'text-vermillion font-bold' : 'text-green-700 font-bold'}>
                  {selectedInvoice.balanceDue > 0 ? formatCurrency(selectedInvoice.balanceDue) : 'PAYMENT CLEARED IN FULL'}
                </span>
              </div>
            </div>

            {/* Banking Remittance Card (Printed on Page 2 / Invoice Settlement) */}
            {effectiveSettings.bankingDetails && (
              <div className="p-3 bg-white/90 border border-[#d8e2dc] rounded-sm text-[10px] font-mono space-y-1 text-[#3b4741]">
                <div className="flex items-center gap-1.5 font-bold uppercase text-[#0f1714]">
                  <Landmark size={12} className="text-vermillion" />
                  <span>Banking Remittance (NEFT / RTGS / IMPS / UPI)</span>
                </div>
                <p>
                  <strong>Beneficiary:</strong> {effectiveSettings.bankingDetails.accountName}
                </p>
                <p>
                  <strong>Bank:</strong> {effectiveSettings.bankingDetails.bankName}, {effectiveSettings.bankingDetails.branch}
                </p>
                <p>
                  <strong>A/C:</strong> {effectiveSettings.bankingDetails.accountNumber} &nbsp;|&nbsp;{' '}
                  <strong>IFSC:</strong> {effectiveSettings.bankingDetails.ifscCode}
                  {effectiveSettings.bankingDetails.upiId && (
                    <>
                      &nbsp;|&nbsp; <strong>UPI:</strong> {effectiveSettings.bankingDetails.upiId}
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Signoff Footer */}
            <div className="pt-2 border-t border-[#d8e2dc] flex items-center justify-between text-[11px] font-mono font-bold text-[#0f1714]">
              <span>{effectiveSettings.contactPerson.toUpperCase()} // STUDIO PRINCIPAL</span>
              <span>{effectiveSettings.contactPhone}</span>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-[#d8e2dc] flex gap-3">
              <button
                onClick={() => generateInvoicePDF(selectedInvoice, effectiveSettings)}
                className="flex-1 py-2.5 text-xs font-mono uppercase tracking-widest bg-[#0f1714] text-white hover:bg-vermillion transition-all flex items-center justify-center gap-2 font-bold shadow-md"
              >
                <Download size={14} />
                <span>Download Tax Invoice PDF</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 p-12 border-2 border-dashed border-bone-border text-center text-bone-muted font-mono text-xs">
            No invoice selected. Select an invoice on the left to preview.
          </div>
        )}
      </div>
    </div>
  );
};
