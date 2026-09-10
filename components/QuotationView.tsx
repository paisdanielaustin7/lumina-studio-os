'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Download,
  CheckCircle,
  ArrowRight,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  DollarSign,
  CreditCard,
  Trash2,
  Edit3,
  HardDrive,
  Camera,
  Check,
  ShieldAlert,
  ArrowUpRight,
  Search,
  Lock,
} from 'lucide-react';
import {
  Quotation,
  Enquiry,
  ShootBooking,
  Invoice,
  LedgerEntry,
  QuotationItem,
  DeliverableItem,
  CrewRequirement,
  DeliveryStage,
  StudioSettings,
  UserAccount,
} from '@/types';
import { defaultCatalog, CatalogTemplate } from '@/lib/catalogDefaults';
import { generateQuotationPDF } from '@/lib/pdfGenerator';

interface QuotationViewProps {
  quotations: Quotation[];
  enquiries: Enquiry[];
  bookings: ShootBooking[];
  invoices: Invoice[];
  settings: StudioSettings;
  currentUser: UserAccount;
  onAddQuotation: (quote: Quotation) => void;
  onUpdateQuotation: (quote: Quotation) => void;
  onAddEnquiry: (enquiry: Enquiry) => void;
  onConvertQuotationToBooking: (quote: Quotation) => void;
  onRecordPayment: (payment: {
    reference: string;
    amount: number;
    paymentMethod: string;
    relatedShootCode?: string;
    clientName: string;
    notes?: string;
  }) => void;
  onUpdateBookingDelivery: (
    bookingId: string,
    updates: {
      deliveryStage?: DeliveryStage;
      hardDriveReceived?: boolean;
      clientSelectionDone?: boolean;
    }
  ) => void;
}

export const QuotationView: React.FC<QuotationViewProps> = ({
  quotations,
  enquiries,
  bookings,
  invoices,
  settings,
  currentUser,
  onAddQuotation,
  onUpdateQuotation,
  onAddEnquiry,
  onConvertQuotationToBooking,
  onRecordPayment,
  onUpdateBookingDelivery,
}) => {
  const [activeTab, setActiveTab] = useState<'quotations' | 'enquiries' | 'orders' | 'catalog'>(
    'quotations'
  );
  const [selectedQuote, setSelectedQuote] = useState<Quotation>(quotations[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Catalog State (editable by Admin)
  const [catalog, setCatalog] = useState<CatalogTemplate>(defaultCatalog);
  const [newReqName, setNewReqName] = useState('');
  const [newDelivItem, setNewDelivItem] = useState('');
  const [newDelivDetail, setNewDelivDetail] = useState('');

  // New Enquiry Modal State
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enqClientName, setEnqClientName] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqEmail, setEnqEmail] = useState('');
  const [enqCity, setEnqCity] = useState('Mangalore');
  const [enqDate, setEnqDate] = useState('2026-11-20');
  const [enqType, setEnqType] = useState('Catholic Nuptials & Reception');
  const [enqBudget, setEnqBudget] = useState('38000');
  const [enqNotes, setEnqNotes] = useState('');

  // Create / Edit Quotation Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [editQuoteId, setEditQuoteId] = useState<string | null>(null);

  const [qNumber, setQNumber] = useState(`Q NO. 0${quotations.length + 7}`);
  const [qDate, setQDate] = useState('6 August , 2026');
  const [qClientName, setQClientName] = useState('');
  const [qClientCity, setQClientCity] = useState('Mangalore');
  const [qClientPhone, setQClientPhone] = useState('');
  const [qClientEmail, setQClientEmail] = useState('');
  const [qPackageTitle, setQPackageTitle] = useState('PACKAGE');
  const [qTotalPrice, setQTotalPrice] = useState('38000');
  const [qAdvancePct, setQAdvancePct] = useState(50);
  const [qRequirements, setQRequirements] = useState<QuotationItem[]>(catalog.standardRequirements);
  const [qDeliverables, setQDeliverables] = useState<DeliverableItem[]>(catalog.standardDeliverables);
  const [qCrew, setQCrew] = useState<CrewRequirement[]>(catalog.standardCrew);

  // Manual Payment Entry Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('19000');
  const [paymentMethod, setPaymentMethod] = useState('UPI / GPay');
  const [paymentNotes, setPaymentNotes] = useState('50% Advance booking confirmation');
  const [paymentTargetQuote, setPaymentTargetQuote] = useState<Quotation | null>(null);

  const formatINR = (val: number) => {
    if (!currentUser.canViewFinances) return 'Rs *** /-';
    return 'Rs ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val) + ' /-';
  };

  const handleCreateEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enqClientName) return;

    const newEnq: Enquiry = {
      id: `enq-${Date.now()}`,
      enquiryNumber: `ENQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName: enqClientName,
      phone: enqPhone || '+91 98450 12849',
      email: enqEmail || `${enqClientName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      city: enqCity,
      eventDate: enqDate,
      eventType: enqType,
      estimatedBudget: Math.min(44000, parseFloat(enqBudget) || 38000),
      status: 'NEW',
      notes: enqNotes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddEnquiry(newEnq);
    setShowEnquiryModal(false);
    resetEnquiryForm();
  };

  const resetEnquiryForm = () => {
    setEnqClientName('');
    setEnqPhone('');
    setEnqEmail('');
    setEnqCity('Mangalore');
    setEnqBudget('38000');
    setEnqNotes('');
  };

  // Launch pre-filled quote from enquiry
  const handleLaunchQuoteFromEnquiry = (enquiry: Enquiry) => {
    setIsEditingQuote(false);
    setEditQuoteId(null);
    setQNumber(`Q NO. 0${quotations.length + 8}`);
    setQClientName(enquiry.clientName);
    setQClientCity(enquiry.city);
    setQClientPhone(enquiry.phone);
    setQClientEmail(enquiry.email);
    setQTotalPrice(Math.min(44000, enquiry.estimatedBudget).toString());
    setQPackageTitle(enquiry.eventType.toUpperCase().includes('WEDDING') ? 'WEDDING PACKAGE' : 'PACKAGE');
    setQRequirements(catalog.standardRequirements);
    setQDeliverables(catalog.standardDeliverables);
    setQCrew(catalog.standardCrew);
    setShowQuoteModal(true);
  };

  // Launch editor for existing quote (Requirement 2)
  const handleOpenEditQuote = (quote: Quotation) => {
    setIsEditingQuote(true);
    setEditQuoteId(quote.id);
    setQNumber(quote.quotationNumber);
    setQDate(quote.date);
    setQClientName(quote.clientName);
    setQClientCity(quote.clientCity);
    setQClientPhone(quote.clientPhone || '');
    setQClientEmail(quote.clientEmail || '');
    setQPackageTitle(quote.packageTitle);
    setQTotalPrice(Math.min(44000, quote.totalPrice).toString());
    setQAdvancePct(quote.advancePercentage || 50);
    setQRequirements(quote.requirements);
    setQDeliverables(quote.deliverables);
    setQCrew(quote.crewAllocation);
    setShowQuoteModal(true);
  };

  // Save quotation (either new or updated existing)
  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qClientName) return;

    // Strict constraint: Cap price below 45000
    const parsedPrice = Math.min(44000, Math.max(1000, parseFloat(qTotalPrice) || 38000));

    if (isEditingQuote && editQuoteId) {
      const existing = quotations.find((q) => q.id === editQuoteId);
      const updatedQuote: Quotation = {
        ...existing!,
        quotationNumber: qNumber,
        date: qDate,
        clientName: qClientName,
        clientCity: qClientCity,
        clientPhone: qClientPhone,
        clientEmail: qClientEmail,
        packageTitle: qPackageTitle,
        requirements: qRequirements,
        deliverables: qDeliverables,
        crewAllocation: qCrew,
        totalPrice: parsedPrice,
        advancePercentage: qAdvancePct,
      };

      onUpdateQuotation(updatedQuote);
      setSelectedQuote(updatedQuote);
    } else {
      const createdQuote: Quotation = {
        id: `q-${Date.now()}`,
        quotationNumber: qNumber,
        date: qDate,
        clientName: qClientName,
        clientCity: qClientCity,
        clientPhone: qClientPhone,
        clientEmail: qClientEmail,
        packageTitle: qPackageTitle,
        requirements: qRequirements,
        deliverables: qDeliverables,
        crewAllocation: qCrew,
        termsAndConditions: settings.termsAndConditions || catalog.standardTerms,
        totalPrice: parsedPrice,
        advancePercentage: qAdvancePct,
        status: 'SENT',
        contactPerson: settings.contactPerson,
        contactPhone: settings.contactPhone,
      };

      onAddQuotation(createdQuote);
      setSelectedQuote(createdQuote);
    }

    setShowQuoteModal(false);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTargetQuote || !paymentAmount) return;

    const amt = parseFloat(paymentAmount);
    onRecordPayment({
      reference: `REC-${Date.now().toString().slice(-4)}`,
      amount: amt,
      paymentMethod,
      relatedShootCode: paymentTargetQuote.quotationNumber,
      clientName: paymentTargetQuote.clientName,
      notes: paymentNotes,
    });

    // Update quote status if 50% or more received
    if (amt >= (paymentTargetQuote.totalPrice * paymentTargetQuote.advancePercentage) / 100) {
      onUpdateQuotation({
        ...paymentTargetQuote,
        status: 'ACCEPTED',
      });
    }

    setShowPaymentModal(false);
  };

  const filteredQuotes = quotations.filter((q) => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      q.clientName.toLowerCase().includes(s) ||
      q.quotationNumber.toLowerCase().includes(s) ||
      q.clientCity.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-4 lg:p-7 max-w-7xl mx-auto space-y-6">
      {/* Top Header - Compact editorial layout */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-bone-border dark:border-obsidian-border">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-bone-muted dark:text-obsidian-muted mb-0.5">
            <span>Commercial Operations</span>
            <span>//</span>
            <span className="text-vermillion font-bold">LUMINA Quotation Engine</span>
            <span>//</span>
            <span>Mangalore Coastal Atelier</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-carbon dark:text-white uppercase">
            Quotations & Order Lifecycle
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowEnquiryModal(true)}
            className="px-3 py-1.5 border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white transition-all flex items-center gap-1.5 uppercase"
          >
            <Plus size={12} />
            <span>New Enquiry</span>
          </button>
          <button
            disabled={!currentUser.canEditQuotesAndOrders}
            onClick={() => {
              setIsEditingQuote(false);
              setEditQuoteId(null);
              setQNumber(`Q NO. 0${quotations.length + 8}`);
              setQClientName('');
              setQClientCity('Mangalore');
              setQClientPhone('');
              setQTotalPrice('38000');
              setQRequirements(catalog.standardRequirements);
              setQDeliverables(catalog.standardDeliverables);
              setQCrew(catalog.standardCrew);
              setShowQuoteModal(true);
            }}
            className={`px-3.5 py-1.5 uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all ${
              currentUser.canEditQuotesAndOrders
                ? 'bg-carbon text-bone dark:bg-white dark:text-carbon hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white'
                : 'opacity-50 cursor-not-allowed bg-bone-surface text-bone-muted'
            }`}
          >
            {currentUser.canEditQuotesAndOrders ? <FileText size={12} /> : <Lock size={12} />}
            <span>Generate Quote</span>
          </button>
        </div>
      </div>

      {/* Primary Module Tabs */}
      <div className="flex items-center border-b border-bone-border dark:border-obsidian-border text-[11px] font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab('quotations')}
          className={`pb-2.5 px-3.5 uppercase tracking-wider font-bold transition-all relative whitespace-nowrap ${
            activeTab === 'quotations'
              ? 'text-carbon dark:text-white border-b-2 border-vermillion'
              : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
          }`}
        >
          Quotations ({quotations.length})
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`pb-2.5 px-3.5 uppercase tracking-wider font-bold transition-all relative whitespace-nowrap ${
            activeTab === 'enquiries'
              ? 'text-carbon dark:text-white border-b-2 border-vermillion'
              : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
          }`}
        >
          Enquiries ({enquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 px-3.5 uppercase tracking-wider font-bold transition-all relative whitespace-nowrap ${
            activeTab === 'orders'
              ? 'text-carbon dark:text-white border-b-2 border-vermillion'
              : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
          }`}
        >
          Orders & Deliveries ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-2.5 px-3.5 uppercase tracking-wider font-bold transition-all relative whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'text-carbon dark:text-white border-b-2 border-vermillion'
              : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
          }`}
        >
          Catalog Presets
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE QUOTATIONS & EDITABLE INSPECTOR                              */}
      {/* ========================================================================= */}
      {activeTab === 'quotations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Compact Quotation List with Independent Scroll (5 cols) */}
          <div className="lg:col-span-5 space-y-3 lg:sticky lg:top-2 max-h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between text-[11px] font-mono shrink-0 pb-1">
              <span className="uppercase tracking-widest text-bone-muted dark:text-obsidian-muted">
                Issued Packages ({filteredQuotes.length})
              </span>
              <div className="flex items-center gap-1.5 border border-bone-border dark:border-obsidian-border px-2 py-0.5">
                <Search size={11} className="text-bone-muted" />
                <input
                  type="text"
                  placeholder="Filter name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none w-24 text-carbon dark:text-white text-[11px]"
                />
              </div>
            </div>

            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
              {filteredQuotes.map((q) => {
                const isSelected = selectedQuote.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuote(q)}
                    className={`p-3.5 border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-carbon dark:border-white bg-bone-card dark:bg-obsidian-card shadow-sm'
                        : 'border-bone-border dark:border-obsidian-border bg-bone-card/60 dark:bg-obsidian-card/40 hover:border-carbon dark:hover:border-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="font-bold text-vermillion">{q.quotationNumber}</span>
                      <span
                        className={`text-[8.5px] px-1.5 py-0.2 uppercase tracking-widest font-bold border ${
                          q.status === 'ACCEPTED' || q.status === 'CONVERTED'
                            ? 'border-green-600/30 text-green-700 dark:text-green-400 bg-green-500/10'
                            : 'border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-carbon dark:text-white">
                      {q.clientName}
                    </h3>
                    <p className="text-[10px] font-mono text-bone-muted dark:text-obsidian-muted">
                      {q.clientCity} // {q.date}
                    </p>

                    <div className="mt-2 pt-2 border-t border-bone-border dark:border-obsidian-border flex items-center justify-between text-[11px] font-mono">
                      <span className="text-bone-muted dark:text-obsidian-muted">Total</span>
                      <span className="font-bold text-carbon dark:text-white">{formatINR(q.totalPrice)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Visual Preview Deck with Independent Scroll (Strictly LUMINA Branding) */}
          <div className="lg:col-span-7 bg-[#f3f7f4] text-[#0f1714] border-2 border-carbon dark:border-white p-5 lg:p-7 shadow-xl space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
            {/* Header: Pure LUMINA Branding */}
            <div className="flex items-start justify-between border-b border-[#d8e2dc] pb-3">
              <div>
                <span className="font-serif font-black text-xl tracking-widest uppercase block">
                  {settings.studioName}
                </span>
                <span className="text-[8.5px] font-mono text-[#6e7d76] uppercase tracking-wider block">
                  {settings.tagline}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold block">{selectedQuote.quotationNumber}</span>
                <span className="text-[9px] font-mono text-[#6e7d76]">Official Quotation</span>
              </div>
            </div>

            {/* Title & Date */}
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl font-black uppercase tracking-tight">
                {selectedQuote.packageTitle}
              </h2>
              <p className="text-[11px] font-mono font-bold mt-0.5">Date: {selectedQuote.date}</p>
            </div>

            {/* Quoted to */}
            <div className="font-mono text-[11px] space-y-0.5">
              <span className="font-bold uppercase text-[9.5px] text-[#6e7d76] block mb-0.5">
                Quoted to:
              </span>
              <p className="font-bold text-xs text-[#0f1714]">{selectedQuote.clientName}</p>
              <p className="text-[#3b4741]">{selectedQuote.clientCity}</p>
            </div>

            {/* Requirements Table */}
            <div className="border border-[#d8e2dc] rounded-sm overflow-hidden bg-white/70">
              <div className="bg-[#e4ede7] px-3.5 py-1.5 flex justify-between font-mono text-[11px] font-bold text-[#19231e]">
                <span>Requirement</span>
                <span>Price</span>
              </div>
              <div className="divide-y divide-[#e4ede7] text-[11px] font-mono">
                {selectedQuote.requirements
                  .filter((r) => r.included)
                  .map((req) => (
                    <div key={req.id} className="px-3.5 py-1.5 flex justify-between">
                      <span>{req.name}</span>
                      <span className="text-right">{req.price || '-'}</span>
                    </div>
                  ))}
              </div>
              <div className="bg-[#e4ede7] px-3.5 py-2 flex justify-between font-mono text-[11px] font-black text-[#0f1714] border-t border-[#d8e2dc]">
                <span>Total</span>
                <span>{formatINR(selectedQuote.totalPrice)}</span>
              </div>
            </div>

            {/* Deliverables Table */}
            <div>
              <h4 className="text-center font-serif font-bold text-xs uppercase tracking-wider mb-1.5">
                Deliverables
              </h4>
              <div className="border border-[#d8e2dc] rounded-sm overflow-hidden bg-white/70">
                <div className="bg-[#e4ede7] px-3.5 py-1.5 flex justify-between font-mono text-[11px] font-bold text-[#19231e]">
                  <span>Items</span>
                  <span>Details</span>
                </div>
                <div className="divide-y divide-[#e4ede7] text-[11px] font-mono">
                  {selectedQuote.deliverables
                    .filter((d) => d.included)
                    .map((del) => (
                      <div key={del.id} className="px-3.5 py-1.5 flex flex-col sm:flex-row sm:justify-between gap-0.5">
                        <span className="font-bold">{del.item}</span>
                        <span className="text-[#5a6962] text-[10px] italic">{del.details}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Crew Members */}
            <div>
              <div className="bg-[#e4ede7] px-3.5 py-1.5 flex justify-between font-mono text-[11px] font-bold text-[#19231e] border border-[#d8e2dc]">
                <span>Crew Members</span>
                <span>Number</span>
              </div>
              <div className="border-x border-b border-[#d8e2dc] divide-y divide-[#e4ede7] text-[11px] font-mono bg-white/70">
                {selectedQuote.crewAllocation.map((crew) => (
                  <div key={crew.id} className="px-3.5 py-1.5 flex justify-between">
                    <span>{crew.role}</span>
                    <span className="font-bold">{crew.number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms Summary */}
            <div className="p-2.5 bg-white/80 border border-[#d8e2dc] text-[9.5px] font-mono text-[#5a6962] space-y-0.5">
              <span className="font-bold uppercase text-[#0f1714] block">
                Terms & Conditions Summary ({selectedQuote.termsAndConditions.length} Points Verified)
              </span>
              <p>• 50% advance confirms booking. Balance due on/before event date.</p>
              <p>• Hard drive required for RAW data collection (6-month retention liability).</p>
            </div>

            {/* Signoff Footer */}
            <div className="pt-2 border-t border-[#d8e2dc] flex items-center justify-between text-[11px] font-mono font-bold">
              <span>{selectedQuote.contactPerson || settings.contactPerson}</span>
              <span>{selectedQuote.contactPhone || settings.contactPhone}</span>
            </div>

            {/* Action Bar with Edit, PDF Export, Conversion & Payment Sync */}
            <div className="pt-3 border-t border-[#d8e2dc] space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. Edit Quote Button */}
                <button
                  disabled={!currentUser.canEditQuotesAndOrders}
                  onClick={() => handleOpenEditQuote(selectedQuote)}
                  className={`py-2 px-2.5 text-[10px] font-mono uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 border border-[#0f1714] transition-all ${
                    currentUser.canEditQuotesAndOrders ? 'hover:bg-[#0f1714] hover:text-white' : 'opacity-40 cursor-not-allowed'
                  }`}
                  title={!currentUser.canEditQuotesAndOrders ? 'Restricted by Admin' : 'Edit quote items & prices'}
                >
                  <Edit3 size={11} />
                  <span>Edit Quote</span>
                </button>

                {/* 2. Download PDF Button */}
                <button
                  onClick={() => generateQuotationPDF(selectedQuote, settings)}
                  className="py-2 px-2.5 bg-[#0f1714] text-white hover:bg-vermillion transition-all text-[10px] font-mono uppercase font-bold tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Download size={11} />
                  <span>2-Page PDF</span>
                </button>

                {/* 3. Convert to Order Button */}
                <button
                  onClick={() => onConvertQuotationToBooking(selectedQuote)}
                  disabled={selectedQuote.status === 'CONVERTED' || !currentUser.canEditQuotesAndOrders}
                  className={`py-2 px-2.5 text-[10px] font-mono uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                    selectedQuote.status === 'CONVERTED'
                      ? 'bg-green-700/20 text-green-900 border border-green-700/40 cursor-not-allowed'
                      : 'border border-[#0f1714] hover:bg-[#0f1714] hover:text-white'
                  }`}
                >
                  <CheckCircle size={11} />
                  <span>{selectedQuote.status === 'CONVERTED' ? 'Order Active' : 'Convert Order'}</span>
                </button>

                {/* 4. Record Payment Button */}
                <button
                  disabled={!currentUser.canViewFinances}
                  onClick={() => {
                    setPaymentTargetQuote(selectedQuote);
                    setPaymentAmount(
                      Math.round(
                        (selectedQuote.totalPrice * selectedQuote.advancePercentage) / 100
                      ).toString()
                    );
                    setShowPaymentModal(true);
                  }}
                  className={`py-2 px-2.5 bg-vermillion text-white hover:bg-vermillion-glow transition-all text-[10px] font-mono uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 ${
                    !currentUser.canViewFinances ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <CreditCard size={11} />
                  <span>Add Payment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ENQUIRIES CRM PIPELINE                                             */}
      {/* ========================================================================= */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="uppercase tracking-widest text-bone-muted dark:text-obsidian-muted">
              Incoming Coastal Enquiries ({enquiries.length})
            </span>
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="px-3 py-1 bg-carbon text-bone dark:bg-white dark:text-carbon text-[11px] font-mono uppercase tracking-wider flex items-center gap-1"
            >
              <Plus size={11} />
              <span>Log Lead</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {enquiries.map((enq) => (
              <div
                key={enq.id}
                className="p-4 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-3 hover:border-carbon dark:hover:border-white transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="font-bold text-carbon dark:text-white">{enq.enquiryNumber}</span>
                    <span
                      className={`text-[8.5px] px-1.5 py-0.2 uppercase tracking-widest font-bold border ${
                        enq.status === 'CONVERTED'
                          ? 'border-green-600/30 text-green-700 dark:text-green-400 bg-green-500/10'
                          : enq.status === 'QUOTED'
                          ? 'border-blue-600/30 text-blue-700 dark:text-blue-400 bg-blue-500/10'
                          : 'border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-carbon dark:text-white">
                    {enq.clientName}
                  </h3>
                  <p className="text-[11px] font-mono text-bone-muted dark:text-obsidian-muted">
                    {enq.eventType}
                  </p>

                  <div className="mt-3 space-y-1 text-[11px] font-mono text-carbon/80 dark:text-bone/80">
                    <div className="flex items-center gap-2">
                      <Calendar size={11} className="text-vermillion" />
                      <span>{enq.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={11} className="text-vermillion" />
                      <span>{enq.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={11} className="text-bone-muted" />
                      <span>{enq.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-bone-border dark:border-obsidian-border flex items-center justify-between text-[11px] font-mono">
                  <div>
                    <span className="text-[9px] uppercase text-bone-muted dark:text-obsidian-muted block">
                      Target Budget
                    </span>
                    <span className="font-bold text-carbon dark:text-white">
                      {formatINR(enq.estimatedBudget)}
                    </span>
                  </div>

                  <button
                    disabled={!currentUser.canEditQuotesAndOrders}
                    onClick={() => handleLaunchQuoteFromEnquiry(enq)}
                    className="px-2.5 py-1 bg-carbon text-bone dark:bg-white dark:text-carbon text-[10px] font-mono uppercase tracking-wider hover:bg-vermillion transition-all flex items-center gap-1"
                  >
                    <span>Create Quote</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ORDERS & DELIVERY PIPELINE                                         */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted block">
            Active Production Orders & Post-Delivery Stages ({bookings.length})
          </span>

          <div className="space-y-3">
            {bookings.map((booking) => {
              const currentStage: DeliveryStage = booking.deliveryStage || 'EDITING_IN_PROGRESS';
              return (
                <div
                  key={booking.id}
                  className="p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border shadow-sm space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-bone-border dark:border-obsidian-border pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-vermillion">
                          ORDER: {booking.shootCode}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-carbon/5 dark:bg-white/10 uppercase">
                          {booking.type}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-carbon dark:text-white mt-0.5">
                        {booking.title}
                      </h3>
                      <p className="text-[11px] font-mono text-bone-muted dark:text-obsidian-muted">
                        Client: {booking.client.name} ({booking.location.city})
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-[9px] uppercase text-bone-muted dark:text-obsidian-muted block">
                        Order Financials
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-bold">
                        Paid: {formatINR(booking.financialSummary.retainerPaid)}
                      </span>
                      <span className="text-xs text-vermillion font-bold block">
                        Due: {formatINR(booking.financialSummary.balanceDue)}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Pipeline Stepper */}
                  <div>
                    <span className="text-[9.5px] font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted block mb-2">
                      Delivery Milestones
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 text-[9.5px] font-mono text-center">
                      {[
                        { id: 'RAW_INGESTED', label: '1. RAW Ingest' },
                        { id: 'SELECTION_PENDING', label: '2. Selection' },
                        { id: 'EDITING_IN_PROGRESS', label: '3. Retouch' },
                        { id: 'ALBUM_DESIGN', label: '4. Album Print' },
                        { id: 'DELIVERED', label: '5. Dispatched' },
                        { id: 'COMPLETED', label: '6. Archival Done' },
                      ].map((stage) => {
                        const isCurrent = currentStage === stage.id;
                        return (
                          <button
                            key={stage.id}
                            onClick={() =>
                              onUpdateBookingDelivery(booking.id, {
                                deliveryStage: stage.id as DeliveryStage,
                              })
                            }
                            className={`p-1.5 border transition-all ${
                              isCurrent
                                ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold border-carbon dark:border-white'
                                : 'border-bone-border dark:border-obsidian-border text-bone-muted hover:text-carbon dark:hover:text-white'
                            }`}
                          >
                            {stage.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Checklist (Hard Drive & Selection Done) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-[11px] font-mono">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={booking.hardDriveReceived || false}
                        onChange={(e) =>
                          onUpdateBookingDelivery(booking.id, {
                            hardDriveReceived: e.target.checked,
                          })
                        }
                        className="w-3.5 h-3.5 accent-vermillion"
                      />
                      <span className="text-carbon dark:text-white">
                        Hard Drive Received for RAW data (Term #12)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={booking.clientSelectionDone || false}
                        onChange={(e) =>
                          onUpdateBookingDelivery(booking.id, {
                            clientSelectionDone: e.target.checked,
                          })
                        }
                        className="w-3.5 h-3.5 accent-vermillion"
                      />
                      <span className="text-carbon dark:text-white">
                        Photo Selection Completed by Client (Term #11)
                      </span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PRE-DEFINED CATALOG & PRESETS                                      */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Section 1: Pre-defined Requirements */}
          <div className="p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-bone-border dark:border-obsidian-border">
              <h3 className="font-serif text-base font-bold uppercase text-carbon dark:text-white">
                Requirements Catalog
              </h3>
              <span className="text-[9px] font-mono text-bone-muted">Admin Controlled</span>
            </div>

            <div className="space-y-1.5">
              {catalog.standardRequirements.map((req) => (
                <div
                  key={req.id}
                  className="p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border flex items-center justify-between text-[11px] font-mono"
                >
                  <div>
                    <span className="font-bold text-carbon dark:text-white">{req.name}</span>
                    <span className="text-bone-muted ml-2">({req.price})</span>
                  </div>
                  <button
                    disabled={!currentUser.canAccessSettings}
                    onClick={() => {
                      setCatalog({
                        ...catalog,
                        standardRequirements: catalog.standardRequirements.filter((r) => r.id !== req.id),
                      });
                    }}
                    className="text-bone-muted hover:text-vermillion p-0.5"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add requirement */}
            <div className="flex gap-2 pt-1 text-[11px] font-mono">
              <input
                type="text"
                placeholder="e.g. Pre-Wedding Beach Teaser"
                value={newReqName}
                onChange={(e) => setNewReqName(e.target.value)}
                className="flex-1 p-1.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
              />
              <button
                disabled={!currentUser.canAccessSettings}
                onClick={() => {
                  if (!newReqName.trim()) return;
                  setCatalog({
                    ...catalog,
                    standardRequirements: [
                      ...catalog.standardRequirements,
                      { id: `req-${Date.now()}`, name: newReqName, price: '-', included: true },
                    ],
                  });
                  setNewReqName('');
                }}
                className="px-3 py-1.5 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold uppercase"
              >
                Add
              </button>
            </div>
          </div>

          {/* Section 2: Pre-defined Deliverables */}
          <div className="p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-bone-border dark:border-obsidian-border">
              <h3 className="font-serif text-base font-bold uppercase text-carbon dark:text-white">
                Deliverables & Footnotes
              </h3>
              <span className="text-[9px] font-mono text-bone-muted">Admin Controlled</span>
            </div>

            <div className="space-y-1.5">
              {catalog.standardDeliverables.map((del) => (
                <div
                  key={del.id}
                  className="p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border flex items-start justify-between text-[11px] font-mono"
                >
                  <div>
                    <span className="font-bold text-carbon dark:text-white block">{del.item}</span>
                    <span className="text-[10px] text-bone-muted italic">{del.details}</span>
                  </div>
                  <button
                    disabled={!currentUser.canAccessSettings}
                    onClick={() => {
                      setCatalog({
                        ...catalog,
                        standardDeliverables: catalog.standardDeliverables.filter((d) => d.id !== del.id),
                      });
                    }}
                    className="text-bone-muted hover:text-vermillion p-0.5 shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add deliverable */}
            <div className="space-y-1.5 pt-1 text-[11px] font-mono">
              <input
                type="text"
                placeholder="Item title (e.g. Reel for Instagram 4K)"
                value={newDelivItem}
                onChange={(e) => setNewDelivItem(e.target.value)}
                className="w-full p-1.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Details (e.g. *delivered within 48 hours)"
                  value={newDelivDetail}
                  onChange={(e) => setNewDelivDetail(e.target.value)}
                  className="flex-1 p-1.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                />
                <button
                  disabled={!currentUser.canAccessSettings}
                  onClick={() => {
                    if (!newDelivItem.trim()) return;
                    setCatalog({
                      ...catalog,
                      standardDeliverables: [
                        ...catalog.standardDeliverables,
                        {
                          id: `del-${Date.now()}`,
                          item: newDelivItem,
                          details: newDelivDetail || '*custom deliverable',
                          included: true,
                        },
                      ],
                    });
                    setNewDelivItem('');
                    setNewDelivDetail('');
                  }}
                  className="px-3 py-1.5 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold uppercase"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: NEW ENQUIRY MODAL                                                */}
      {/* ========================================================================= */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-bone-border dark:border-obsidian-border">
              <h3 className="font-serif text-lg font-bold uppercase text-carbon dark:text-white">
                Log New Client Lead
              </h3>
              <button
                onClick={() => setShowEnquiryModal(false)}
                className="text-xs font-mono text-bone-muted hover:text-carbon dark:hover:text-white"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleCreateEnquiry} className="space-y-2.5 text-[11px] font-mono">
              <div>
                <label className="block text-[9.5px] uppercase text-bone-muted mb-0.5">
                  Client / Couple Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Alveera D’souza"
                  value={enqClientName}
                  onChange={(e) => setEnqClientName(e.target.value)}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9.5px] uppercase text-bone-muted mb-0.5">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 12849"
                    value={enqPhone}
                    onChange={(e) => setEnqPhone(e.target.value)}
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] uppercase text-bone-muted mb-0.5">
                    City / Venue
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mangalore"
                    value={enqCity}
                    onChange={(e) => setEnqCity(e.target.value)}
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9.5px] uppercase text-bone-muted mb-0.5">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={enqDate}
                    onChange={(e) => setEnqDate(e.target.value)}
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] uppercase text-bone-muted mb-0.5">
                    Budget (Max Rs 44,000)
                  </label>
                  <input
                    type="number"
                    required
                    max="44000"
                    value={enqBudget}
                    onChange={(e) => setEnqBudget(e.target.value)}
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9.5px] uppercase text-bone-muted mb-0.5">
                  Event Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="Catholic Wedding Ceremony & Reception"
                  value={enqType}
                  onChange={(e) => setEnqType(e.target.value)}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold uppercase tracking-widest hover:bg-vermillion transition-all"
                >
                  Save Lead
                </button>
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
                  className="px-3 py-2 border border-bone-border dark:border-obsidian-border uppercase"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE / EDIT QUOTATION MODAL (CASCADES TO ORDERS!)               */}
      {/* ========================================================================= */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-5 sm:p-6 shadow-2xl space-y-4 my-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-bone-border dark:border-obsidian-border">
              <div>
                <span className="text-[9.5px] font-mono text-vermillion uppercase font-bold block">
                  {isEditingQuote ? 'Live Modification Engine' : 'Studio Dispatch'}
                </span>
                <h3 className="font-serif text-xl font-bold uppercase text-carbon dark:text-white">
                  {isEditingQuote ? 'Edit Quotation (Syncs with Order & Invoice)' : 'Package Quotation Builder'}
                </h3>
              </div>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-xs font-mono text-bone-muted hover:text-carbon dark:hover:text-white"
              >
                [ESC]
              </button>
            </div>

            {isEditingQuote && (
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-400 text-[10px] font-mono">
                <strong>Auto-Cascading Sync:</strong> Saving changes here will automatically update the matching confirmed Booking, the Schedule, and the Tax Invoice!
              </div>
            )}

            <form onSubmit={handleSaveQuotation} className="space-y-4 text-[11px] font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] uppercase text-bone-muted mb-0.5">
                    Quotation No.
                  </label>
                  <input
                    type="text"
                    required
                    value={qNumber}
                    onChange={(e) => setQNumber(e.target.value)}
                    className="w-full p-1.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-bone-muted mb-0.5">Date</label>
                  <input
                    type="text"
                    required
                    value={qDate}
                    onChange={(e) => setQDate(e.target.value)}
                    className="w-full p-1.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-bone-muted mb-0.5">Package Title</label>
                  <input
                    type="text"
                    required
                    value={qPackageTitle}
                    onChange={(e) => setQPackageTitle(e.target.value)}
                    className="w-full p-1.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border">
                <div>
                  <label className="block text-[9px] uppercase text-bone-muted mb-0.5">Quoted To (Client)</label>
                  <input
                    type="text"
                    required
                    placeholder="Alveera D’souza"
                    value={qClientName}
                    onChange={(e) => setQClientName(e.target.value)}
                    className="w-full p-1.5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-bone-muted mb-0.5">City</label>
                  <input
                    type="text"
                    required
                    value={qClientCity}
                    onChange={(e) => setQClientCity(e.target.value)}
                    className="w-full p-1.5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border text-carbon dark:text-white"
                  />
                </div>
              </div>

              {/* Requirements Checklist */}
              <div className="space-y-1.5">
                <span className="font-bold uppercase text-[10px] block">
                  Requirements Included in Package:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 border border-bone-border dark:border-obsidian-border">
                  {qRequirements.map((req) => (
                    <label
                      key={req.id}
                      className={`p-1.5 border flex items-center justify-between cursor-pointer transition-all ${
                        req.included
                          ? 'bg-carbon/5 dark:bg-white/10 border-carbon dark:border-white font-bold'
                          : 'border-bone-border dark:border-obsidian-border text-bone-muted'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={req.included}
                          onChange={(e) => {
                            setQRequirements(
                              qRequirements.map((r) =>
                                r.id === req.id ? { ...r, included: e.target.checked } : r
                              )
                            );
                          }}
                          className="accent-vermillion"
                        />
                        <span>{req.name}</span>
                      </div>
                      <span className="text-[9px] opacity-70">{req.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deliverables Checklist */}
              <div className="space-y-1.5">
                <span className="font-bold uppercase text-[10px] block">
                  Deliverables & Footnotes:
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto p-2 border border-bone-border dark:border-obsidian-border">
                  {qDeliverables.map((del) => (
                    <label
                      key={del.id}
                      className={`p-1.5 border flex items-center justify-between cursor-pointer transition-all ${
                        del.included
                          ? 'bg-carbon/5 dark:bg-white/10 border-carbon dark:border-white font-bold'
                          : 'border-bone-border dark:border-obsidian-border text-bone-muted'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={del.included}
                          onChange={(e) => {
                            setQDeliverables(
                              qDeliverables.map((d) =>
                                d.id === del.id ? { ...d, included: e.target.checked } : d
                              )
                            );
                          }}
                          className="accent-vermillion"
                        />
                        <span>{del.item}</span>
                      </div>
                      <span className="text-[9px] text-bone-muted italic">{del.details}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Crew Numbers */}
              <div className="space-y-1.5">
                <span className="font-bold uppercase text-[10px] block">Crew Numbers:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {qCrew.map((crew) => (
                    <div
                      key={crew.id}
                      className="p-1.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border"
                    >
                      <span className="text-[9px] text-bone-muted uppercase block">{crew.role}</span>
                      <input
                        type="number"
                        min="1"
                        value={crew.number}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQCrew(qCrew.map((c) => (c.id === crew.id ? { ...c, number: val } : c)));
                        }}
                        className="w-full bg-transparent font-bold text-xs text-carbon dark:text-white outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Price Capped Strictly Under 45,000 */}
              <div className="p-3 bg-bone-surface dark:bg-obsidian-surface border border-carbon dark:border-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-vermillion block">
                    Total Package Price (Max Rs 44,000)
                  </span>
                  <p className="text-[9px] text-bone-muted">
                    Advance: {qAdvancePct}% ({formatINR((parseFloat(qTotalPrice) * qAdvancePct) / 100)})
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-sm">Rs.</span>
                  <input
                    type="number"
                    required
                    max="44000"
                    value={qTotalPrice}
                    onChange={(e) => setQTotalPrice(e.target.value)}
                    className="w-28 p-1.5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-serif font-black text-base outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold uppercase tracking-widest hover:bg-vermillion transition-all"
                >
                  {isEditingQuote ? 'Update Quote Everywhere' : 'Save & Commit Quotation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2.5 border border-bone-border dark:border-obsidian-border uppercase"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MANUAL PAYMENT ENTRY                                             */}
      {/* ========================================================================= */}
      {showPaymentModal && paymentTargetQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-bone-border dark:border-obsidian-border">
              <h3 className="font-serif text-lg font-bold uppercase text-carbon dark:text-white">
                Record Payment
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-xs font-mono text-bone-muted hover:text-carbon dark:hover:text-white"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-2.5 text-[11px] font-mono">
              <div>
                <label className="block text-[9px] uppercase text-bone-muted mb-0.5">Client Reference</label>
                <input
                  type="text"
                  readOnly
                  value={`${paymentTargetQuote.clientName} (${paymentTargetQuote.quotationNumber})`}
                  className="w-full p-1.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-bone-muted mb-0.5">Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-serif font-black text-base outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-bone-muted mb-0.5">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-1.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                >
                  <option value="UPI / GPay">UPI / GPay</option>
                  <option value="NEFT / RTGS HDFC">NEFT / RTGS HDFC Bank</option>
                  <option value="Cash Receipt">Cash Receipt</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold uppercase tracking-widest hover:bg-vermillion transition-all"
                >
                  Commit & Sync
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-2.5 border border-bone-border dark:border-obsidian-border uppercase"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
