'use client';

import React, { useState } from 'react';
import { Invoice, StudioSettings, UserAccount } from '@/types';
import { FileText, Download, CheckCircle, Clock, AlertCircle, Lock } from 'lucide-react';
import { generateInvoicePDF } from '@/lib/pdfGenerator';

interface InvoicesViewProps {
  invoices: Invoice[];
  settings?: StudioSettings;
  currentUser?: UserAccount;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ invoices, settings, currentUser }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>(invoices[0]);

  const canViewFinances = currentUser ? currentUser.canViewFinances : true;

  const formatCurrency = (val: number) => {
    if (!canViewFinances) return '₹ ••••••';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-bone-border dark:border-obsidian-border">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-bone-muted dark:text-obsidian-muted mb-1">
            <span>Commercial Finance</span>
            <span>//</span>
            <span className="text-vermillion font-bold">Client Retainers & Settlement</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-carbon dark:text-white uppercase">
            Billing & Invoices
          </h1>
        </div>

        <button
          onClick={() => alert('New invoice draft initialised.')}
          className="px-4 py-2.5 text-xs font-mono uppercase tracking-widest bg-carbon text-bone dark:bg-white dark:text-carbon hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center gap-2"
        >
          <FileText size={14} />
          <span>Draft New Invoice</span>
        </button>
      </div>

      {/* Grid: Invoice List (Left) + Detailed Invoice Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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

        {/* Selected Invoice Details Deck */}
        <div className="lg:col-span-7 bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-6 lg:p-8 space-y-6">
          <div className="flex items-start justify-between border-b border-bone-border dark:border-obsidian-border pb-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-vermillion font-bold block mb-1">
                LUMINA ATELIER MANGALORE // TAX INVOICE // GSTIN: 29AABCL1984M1Z8
              </span>
              <h2 className="text-2xl font-serif font-black text-carbon dark:text-white">
                {selectedInvoice.invoiceNumber}
              </h2>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-bone-muted dark:text-obsidian-muted block text-[10px] uppercase">
                Invoice Status
              </span>
              <span className="font-bold text-vermillion uppercase">
                {selectedInvoice.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] uppercase text-bone-muted dark:text-obsidian-muted block">
                Billed To Client:
              </span>
              <p className="font-bold text-carbon dark:text-white">{selectedInvoice.clientName}</p>
              <p className="text-bone-muted dark:text-obsidian-muted">{selectedInvoice.brand}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-bone-muted dark:text-obsidian-muted block">
                Dates:
              </span>
              <p className="text-carbon dark:text-white">Issued: {selectedInvoice.issueDate}</p>
              <p className="text-vermillion font-bold">Due: {selectedInvoice.dueDate}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-bone-border dark:border-obsidian-border divide-y divide-bone-border dark:divide-obsidian-border text-xs font-mono">
            <div className="p-3 bg-bone-surface dark:bg-obsidian-surface text-[10px] uppercase tracking-wider text-bone-muted flex justify-between font-bold">
              <span>Item & Deliverable</span>
              <span>Total</span>
            </div>
            {selectedInvoice.items.map((item) => (
              <div key={item.id} className="p-3 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-carbon dark:text-white block">{item.description}</span>
                  <span className="text-[10px] text-bone-muted dark:text-obsidian-muted">
                    Qty {item.quantity} × {formatCurrency(item.unitPrice)}
                  </span>
                </div>
                <span className="font-bold text-carbon dark:text-white">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>

          {/* Total Calculation */}
          <div className="pt-2 border-t border-bone-border dark:border-obsidian-border space-y-1 text-xs font-mono text-right">
            <div className="flex justify-between">
              <span className="text-bone-muted dark:text-obsidian-muted uppercase">Subtotal</span>
              <span className="font-bold text-carbon dark:text-white">{formatCurrency(selectedInvoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bone-muted dark:text-obsidian-muted uppercase">Integrated GST (18% CGST/SGST Included)</span>
              <span className="text-carbon dark:text-white">₹0.00</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-bone-border dark:border-obsidian-border">
              <span className="uppercase text-carbon dark:text-white">Total Amount</span>
              <span className="text-carbon dark:text-white">{formatCurrency(selectedInvoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-vermillion pt-1">
              <span className="uppercase">Remaining Balance Due</span>
              <span>{formatCurrency(selectedInvoice.balanceDue)}</span>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => generateInvoicePDF(selectedInvoice, settings)}
              className="flex-1 py-2.5 text-xs font-mono uppercase tracking-widest bg-carbon text-bone dark:bg-white dark:text-carbon hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Download size={14} />
              <span>Download Tax Invoice PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
