'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  FileText,
  Calendar,
  CreditCard,
  Scale,
  Sparkles,
  ArrowRight,
  User,
  Clock,
  Layers,
} from 'lucide-react';
import {
  ViewModule,
  Quotation,
  ShootBooking,
  Invoice,
  LedgerEntry,
  Enquiry,
  UserAccount,
} from '@/types';

interface MasterSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotations: Quotation[];
  bookings: ShootBooking[];
  invoices: Invoice[];
  ledger: LedgerEntry[];
  enquiries: Enquiry[];
  currentUser: UserAccount;
  onSelectRecord: (module: ViewModule, recordId: string) => void;
}

interface SearchResultItem {
  id: string;
  type: 'QUOTATION' | 'ORDER' | 'INVOICE' | 'LEDGER' | 'ENQUIRY';
  module: ViewModule;
  title: string;
  subtitle: string;
  tag: string;
  date?: string;
  amount?: number;
}

export const MasterSearchModal: React.FC<MasterSearchModalProps> = ({
  isOpen,
  onClose,
  quotations,
  bookings,
  invoices,
  ledger,
  enquiries,
  currentUser,
  onSelectRecord,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search across all models
  let results: SearchResultItem[] = [];

  if (q.length > 0) {
    // 1. Quotations
    quotations.forEach((item) => {
      if (
        item.clientName.toLowerCase().includes(q) ||
        item.quotationNumber.toLowerCase().includes(q) ||
        item.packageTitle.toLowerCase().includes(q) ||
        item.clientCity.toLowerCase().includes(q)
      ) {
        results.push({
          id: item.id,
          type: 'QUOTATION',
          module: 'quotations',
          title: `${item.quotationNumber}: ${item.clientName}`,
          subtitle: `${item.packageTitle} // ${item.clientCity}`,
          tag: item.status,
          date: item.date,
          amount: currentUser.canViewFinances ? item.totalPrice : undefined,
        });
      }
    });

    // 2. Bookings (Orders)
    bookings.forEach((item) => {
      if (
        item.shootCode.toLowerCase().includes(q) ||
        item.client.name.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.location.city.toLowerCase().includes(q)
      ) {
        results.push({
          id: item.id,
          type: 'ORDER',
          module: 'calendar',
          title: `${item.shootCode}: ${item.client.name}`,
          subtitle: `${item.title} // ${item.location.city}`,
          tag: item.status,
          date: item.date,
          amount: currentUser.canViewFinances ? item.financialSummary.totalFee : undefined,
        });
      }
    });

    // 3. Invoices
    if (currentUser.canViewFinances) {
      invoices.forEach((item) => {
        if (
          item.invoiceNumber.toLowerCase().includes(q) ||
          item.clientName.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q)
        ) {
          results.push({
            id: item.id,
            type: 'INVOICE',
            module: 'billing',
            title: `${item.invoiceNumber}: ${item.clientName}`,
            subtitle: `${item.brand} // Due: ${item.dueDate}`,
            tag: item.status,
            date: item.issueDate,
            amount: item.totalAmount,
          });
        }
      });
    }

    // 4. Ledger
    if (currentUser.canViewFinances) {
      ledger.forEach((item) => {
        if (
          item.transactionRef.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.counterparty.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        ) {
          results.push({
            id: item.id,
            type: 'LEDGER',
            module: 'ledger',
            title: `${item.transactionRef}: ${item.counterparty}`,
            subtitle: `${item.description} (${item.category})`,
            tag: item.type,
            date: item.date,
            amount: item.amount,
          });
        }
      });
    }

    // 5. Enquiries
    enquiries.forEach((item) => {
      if (
        item.enquiryNumber.toLowerCase().includes(q) ||
        item.clientName.toLowerCase().includes(q) ||
        item.eventType.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q)
      ) {
        results.push({
          id: item.id,
          type: 'ENQUIRY',
          module: 'quotations',
          title: `${item.enquiryNumber}: ${item.clientName}`,
          subtitle: `${item.eventType} // ${item.city}`,
          tag: item.status,
          date: item.eventDate,
          amount: currentUser.canViewFinances ? item.estimatedBudget : undefined,
        });
      }
    });
  }

  const getTypeBadgeColor = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'QUOTATION':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'ORDER':
        return 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30';
      case 'INVOICE':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'LEDGER':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'ENQUIRY':
        return 'bg-vermillion/15 text-vermillion border-vermillion/30';
      default:
        return 'bg-carbon/10 dark:bg-white/10 text-carbon dark:text-white border-carbon/20';
    }
  };

  const handleSelect = (result: SearchResultItem) => {
    onSelectRecord(result.module, result.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-bone-card dark:bg-[#121212] border-2 border-carbon dark:border-white shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-bone-border dark:border-white/10 flex items-center gap-3">
          <Search size={18} className="text-vermillion shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type any keyword (e.g. Rosario, Pooja, Q NO. 07, INV-2026, Hasselblad, advance)..."
            className="w-full bg-transparent text-sm md:text-base font-mono outline-none text-carbon dark:text-white placeholder:text-bone-muted dark:placeholder:text-white/40"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-bone-muted dark:text-white/40 hover:text-carbon dark:hover:text-white"
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest border border-bone-border dark:border-white/20 text-bone-muted dark:text-white/50 hover:text-carbon dark:hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto flex-1 p-3 space-y-1.5 font-mono text-xs">
          {q.length === 0 ? (
            <div className="py-12 px-6 text-center text-bone-muted dark:text-white/40 space-y-2">
              <Sparkles size={24} className="mx-auto text-vermillion/70 opacity-80" />
              <p className="text-xs uppercase tracking-widest font-bold text-carbon dark:text-white">
                Studio Master Search Engine
              </p>
              <p className="text-[11px] max-w-md mx-auto">
                Instant search across Quotations, Orders, Tax Invoices, General Ledger, and Client Enquiries.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 px-6 text-center text-bone-muted dark:text-white/40 space-y-1">
              <p className="text-xs uppercase tracking-wider text-carbon dark:text-white">
                No matching studio records found
              </p>
              <p className="text-[10px]">
                No files or entries match keyword <code className="text-vermillion font-bold">&quot;{query}&quot;</code>.
              </p>
            </div>
          ) : (
            <>
              <div className="px-2 py-1 flex items-center justify-between text-[10px] uppercase text-bone-muted dark:text-white/40 border-b border-bone-border/60 dark:border-white/5">
                <span>Matching Records ({results.length})</span>
                <span>Click to inspect</span>
              </div>

              {results.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className="p-3 bg-bone-surface dark:bg-white/[0.03] border border-bone-border dark:border-white/5 hover:border-carbon dark:hover:border-white hover:bg-carbon/5 dark:hover:bg-white/[0.08] cursor-pointer transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 border shrink-0 ${getTypeBadgeColor(
                        item.type
                      )}`}
                    >
                      {item.type}
                    </span>

                    <div className="overflow-hidden min-w-0">
                      <p className="font-bold text-xs truncate text-carbon dark:text-white group-hover:text-vermillion transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-bone-muted dark:text-white/50 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      {item.amount !== undefined && (
                        <div className="font-bold text-xs text-carbon dark:text-white">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </div>
                      )}
                      {item.date && (
                        <div className="text-[9px] text-bone-muted dark:text-white/40">
                          {item.date}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={13} className="text-bone-muted dark:text-white/40 group-hover:text-carbon dark:group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-bone-surface/60 dark:bg-black/40 border-t border-bone-border dark:border-white/10 px-4 flex items-center justify-between text-[10px] font-mono text-bone-muted dark:text-white/40">
          <span>Search scope: All studio data</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
