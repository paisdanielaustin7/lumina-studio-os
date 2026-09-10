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
} from '@/types';
import { defaultCatalog, CatalogTemplate } from '@/lib/catalogDefaults';
import { generateQuotationPDF } from '@/lib/pdfGenerator';

interface QuotationViewProps {
  quotations: Quotation[];
  enquiries: Enquiry[];
  bookings: ShootBooking[];
  invoices: Invoice[];
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
  const [enqBudget, setEnqBudget] = useState('90000');
  const [enqNotes, setEnqNotes] = useState('');

  // New Quotation Modal State
  const [showCreateQuoteModal, setShowCreateQuoteModal] = useState(false);
  const [qNumber, setQNumber] = useState(`Q NO. 0${quotations.length + 7}`);
  const [qDate, setQDate] = useState('6 August , 2026');
  const [qClientName, setQClientName] = useState('');
  const [qClientCity, setQClientCity] = useState('Mangalore');
  const [qClientPhone, setQClientPhone] = useState('');
  const [qClientEmail, setQClientEmail] = useState('');
  const [qPackageTitle, setQPackageTitle] = useState('PACKAGE');
  const [qTotalPrice, setQTotalPrice] = useState('90000');
  const [qAdvancePct, setQAdvancePct] = useState(50);
  const [qRequirements, setQRequirements] = useState<QuotationItem[]>(catalog.standardRequirements);
  const [qDeliverables, setQDeliverables] = useState<DeliverableItem[]>(catalog.standardDeliverables);
  const [qCrew, setQCrew] = useState<CrewRequirement[]>(catalog.standardCrew);

  // Manual Payment Entry Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('45000');
  const [paymentMethod, setPaymentMethod] = useState('UPI / GPay');
  const [paymentNotes, setPaymentNotes] = useState('50% Advance booking confirmation');
  const [paymentTargetQuote, setPaymentTargetQuote] = useState<Quotation | null>(null);

  const formatINR = (val: number) => {
    return 'Rs ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val) + ' /-';
  };

  const handleCreateEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enqClientName) return;

    const newEnq: Enquiry = {
      id: `enq-${Date.now()}`,
      enquiryNumber: `ENQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName: enqClientName,
      phone: enqPhone || '+91 98450 00000',
      email: enqEmail || `${enqClientName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      city: enqCity,
      eventDate: enqDate,
      eventType: enqType,
      estimatedBudget: parseFloat(enqBudget) || 90000,
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
    setEnqBudget('90000');
    setEnqNotes('');
  };

  const handleLaunchQuoteFromEnquiry = (enquiry: Enquiry) => {
    setQClientName(enquiry.clientName);
    setQClientCity(enquiry.city);
    setQClientPhone(enquiry.phone);
    setQClientEmail(enquiry.email);
    setQTotalPrice(enquiry.estimatedBudget.toString());
    setQPackageTitle(enquiry.eventType.toUpperCase().includes('WEDDING') ? 'WEDDING PACKAGE' : 'PACKAGE');
    setQRequirements(catalog.standardRequirements);
    setQDeliverables(catalog.standardDeliverables);
    setQCrew(catalog.standardCrew);
    setShowCreateQuoteModal(true);
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qClientName) return;

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
      termsAndConditions: catalog.standardTerms,
      totalPrice: parseFloat(qTotalPrice) || 90000,
      advancePercentage: qAdvancePct,
      status: 'SENT',
      contactPerson: catalog.defaultContactPerson,
      contactPhone: catalog.defaultContactPhone,
    };

    onAddQuotation(createdQuote);
    setSelectedQuote(createdQuote);
    setShowCreateQuoteModal(false);
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
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-bone-border dark:border-obsidian-border">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-bone-muted dark:text-obsidian-muted mb-1">
            <span>Commercial Operations</span>
            <span>//</span>
            <span className="text-vermillion font-bold">Enquiries, Quotations & Deliveries</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-carbon dark:text-white uppercase">
            Quotation Engine
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowEnquiryModal(true)}
            className="px-4 py-2.5 text-xs font-mono uppercase tracking-widest border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white transition-all flex items-center gap-2"
          >
            <Plus size={14} />
            <span>New Enquiry</span>
          </button>
          <button
            onClick={() => {
              setQClientName('');
              setQClientCity('Mangalore');
              setQClientPhone('');
              setQTotalPrice('90000');
              setQRequirements(catalog.standardRequirements);
              setQDeliverables(catalog.standardDeliverables);
              setQCrew(catalog.standardCrew);
              setShowCreateQuoteModal(true);
            }}
            className="px-4 py-2.5 text-xs font-mono uppercase tracking-widest bg-carbon text-bone dark:bg-white dark:text-carbon hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center gap-2"
          >
            <FileText size={14} />
            <span>Generate Quotation</span>
          </button>
        </div>
      </div>

      {/* Primary Module Tabs */}
      <div className="flex items-center border-b border-bone-border dark:border-obsidian-border text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab('quotations')}
          className={`pb-3 px-4 uppercase tracking-wider font-bold transition-all relative whitespace-nowrap ${
            activeTab === 'quotations'
              ? 'text-carbon dark:text-white border-b-2 border-vermillion'
              : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
          }`}
        >
          Quotations ({quotations.length})
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`pb-3 px-4 uppercase tracking-wider font-bold transition-all relative whitespace-nowrap ${
            activeTab === 'enquiries'
              ? 'text-carbon dark:text-white border-b-2 border-vermillion'
              : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
          }`}
        >
          Enquiries CRM ({enquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 uppercase tracking-wider font-bold transition-all relative whitespace-nowrap ${
            activeTab === 'orders'
              ? 'text-carbon dark:text-white border-b-2 border-vermillion'
              : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
          }`}
        >
          Orders & Delivery Pipeline ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 uppercase tracking-wider font-bold transition-all relative whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'text-carbon dark:text-white border-b-2 border-vermillion'
              : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
          }`}
        >
          Pre-defined Catalog & Items
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE QUOTATIONS & VISUAL INSPECTOR                               */}
      {/* ========================================================================= */}
      {activeTab === 'quotations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Quotation Cards List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted">
                Issued Packages ({filteredQuotes.length})
              </span>
              <div className="flex items-center gap-2 border border-bone-border dark:border-obsidian-border px-2 py-1 text-[11px] font-mono">
                <Search size={12} className="text-bone-muted" />
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none w-28 text-carbon dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredQuotes.map((q) => {
                const isSelected = selectedQuote.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuote(q)}
                    className={`p-5 border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-carbon dark:border-white bg-bone-card dark:bg-obsidian-card shadow-brutalist-light dark:shadow-brutalist-dark'
                        : 'border-bone-border dark:border-obsidian-border bg-bone-card/60 dark:bg-obsidian-card/40 hover:border-carbon dark:hover:border-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="font-bold text-vermillion">{q.quotationNumber}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 uppercase tracking-widest font-bold border ${
                          q.status === 'ACCEPTED' || q.status === 'CONVERTED'
                            ? 'border-green-600/30 text-green-700 dark:text-green-400 bg-green-500/10'
                            : 'border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-carbon dark:text-white">
                      {q.clientName}
                    </h3>
                    <p className="text-xs font-mono text-bone-muted dark:text-obsidian-muted">
                      {q.clientCity} // {q.date}
                    </p>

                    <div className="mt-4 pt-3 border-t border-bone-border dark:border-obsidian-border flex items-center justify-between text-xs font-mono">
                      <span className="text-bone-muted dark:text-obsidian-muted">Package Total</span>
                      <span className="font-bold text-carbon dark:text-white">{formatINR(q.totalPrice)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Visual Preview Deck (Matches Attached PDF Exactly!) */}
          <div className="lg:col-span-7 bg-[#f3f7f4] text-[#0f1714] border-2 border-carbon dark:border-white p-6 lg:p-10 shadow-2xl space-y-6">
            {/* Top Bar with Real Sample Header */}
            <div className="flex items-start justify-between border-b border-[#d8e2dc] pb-4">
              <div>
                <span className="font-serif font-black text-2xl tracking-widest uppercase block">
                  VOWS
                </span>
                <span className="text-[9px] font-mono text-[#6e7d76] uppercase tracking-wider block">
                  Wedding Cinemastory & Stills // Mangalore
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold block">{selectedQuote.quotationNumber}</span>
                <span className="text-[10px] font-mono text-[#6e7d76]">Official Quotation</span>
              </div>
            </div>

            {/* Title & Date */}
            <div>
              <h2 className="font-serif text-4xl lg:text-5xl font-black uppercase tracking-tight">
                {selectedQuote.packageTitle}
              </h2>
              <p className="text-xs font-mono font-bold mt-1">Date: {selectedQuote.date}</p>
            </div>

            {/* Quoted to */}
            <div className="font-mono text-xs space-y-0.5">
              <span className="font-bold uppercase text-[10px] text-[#6e7d76] block mb-1">
                Quoted to:
              </span>
              <p className="font-bold text-sm text-[#0f1714]">{selectedQuote.clientName}</p>
              <p className="text-[#3b4741]">{selectedQuote.clientCity}</p>
              {selectedQuote.clientPhone && <p className="text-[#6e7d76]">{selectedQuote.clientPhone}</p>}
            </div>

            {/* Requirements Table */}
            <div className="border border-[#d8e2dc] rounded-sm overflow-hidden bg-white/70">
              <div className="bg-[#e4ede7] px-4 py-2 flex justify-between font-mono text-xs font-bold text-[#19231e]">
                <span>Requirement</span>
                <span>Price</span>
              </div>
              <div className="divide-y divide-[#e4ede7] text-xs font-mono">
                {selectedQuote.requirements
                  .filter((r) => r.included)
                  .map((req) => (
                    <div key={req.id} className="px-4 py-2 flex justify-between">
                      <span>{req.name}</span>
                      <span className="text-right">{req.price || '-'}</span>
                    </div>
                  ))}
              </div>
              <div className="bg-[#e4ede7] px-4 py-2.5 flex justify-between font-mono text-xs font-black text-[#0f1714] border-t border-[#d8e2dc]">
                <span>Total</span>
                <span>{formatINR(selectedQuote.totalPrice)}</span>
              </div>
            </div>

            {/* Deliverables Table */}
            <div>
              <h4 className="text-center font-serif font-bold text-sm uppercase tracking-wider mb-2">
                Deliverables
              </h4>
              <div className="border border-[#d8e2dc] rounded-sm overflow-hidden bg-white/70">
                <div className="bg-[#e4ede7] px-4 py-2 flex justify-between font-mono text-xs font-bold text-[#19231e]">
                  <span>Items</span>
                  <span>Details</span>
                </div>
                <div className="divide-y divide-[#e4ede7] text-xs font-mono">
                  {selectedQuote.deliverables
                    .filter((d) => d.included)
                    .map((del) => (
                      <div key={del.id} className="px-4 py-2 flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="font-bold">{del.item}</span>
                        <span className="text-[#5a6962] text-[11px] italic">{del.details}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Crew Members (Page 2 Preview Section) */}
            <div>
              <div className="bg-[#e4ede7] px-4 py-2 flex justify-between font-mono text-xs font-bold text-[#19231e] border border-[#d8e2dc]">
                <span>Crew Members</span>
                <span>Number</span>
              </div>
              <div className="border-x border-b border-[#d8e2dc] divide-y divide-[#e4ede7] text-xs font-mono bg-white/70">
                {selectedQuote.crewAllocation.map((crew) => (
                  <div key={crew.id} className="px-4 py-2 flex justify-between">
                    <span>{crew.role}</span>
                    <span className="font-bold">{crew.number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms Summary Tag */}
            <div className="p-3 bg-white/80 border border-[#d8e2dc] text-[10px] font-mono text-[#5a6962] space-y-1">
              <span className="font-bold uppercase text-[#0f1714] block">
                Terms & Conditions Summary ({selectedQuote.termsAndConditions.length} Points Verified)
              </span>
              <p>• 50% advance secures date. Balance due on or before event date.</p>
              <p>• Couple needs to provide a Hard Drive for RAW data collection (6-month retention).</p>
            </div>

            {/* Signoff Footer */}
            <div className="pt-4 border-t border-[#d8e2dc] flex items-center justify-between text-xs font-mono font-bold">
              <span>{selectedQuote.contactPerson}</span>
              <span>{selectedQuote.contactPhone}</span>
            </div>

            {/* Interactive Operations Deck (PDF Export, Conversion & Payment Sync) */}
            <div className="pt-6 border-t-2 border-carbon space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => generateQuotationPDF(selectedQuote)}
                  className="py-3 px-4 bg-carbon text-bone hover:bg-vermillion transition-all text-xs font-mono uppercase font-bold tracking-widest flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  <span>Download 2-Page PDF</span>
                </button>

                <button
                  onClick={() => onConvertQuotationToBooking(selectedQuote)}
                  disabled={selectedQuote.status === 'CONVERTED'}
                  className={`py-3 px-4 text-xs font-mono uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-all ${
                    selectedQuote.status === 'CONVERTED'
                      ? 'bg-green-600/20 text-green-800 border border-green-600/40 cursor-not-allowed'
                      : 'border-2 border-carbon hover:bg-carbon hover:text-white'
                  }`}
                >
                  <CheckCircle size={14} />
                  <span>{selectedQuote.status === 'CONVERTED' ? 'Order Active' : 'Convert to Order'}</span>
                </button>

                <button
                  onClick={() => {
                    setPaymentTargetQuote(selectedQuote);
                    setPaymentAmount(
                      ((selectedQuote.totalPrice * selectedQuote.advancePercentage) / 100).toString()
                    );
                    setShowPaymentModal(true);
                  }}
                  className="py-3 px-4 bg-vermillion text-white hover:bg-vermillion-glow transition-all text-xs font-mono uppercase font-bold tracking-widest flex items-center justify-center gap-2"
                >
                  <CreditCard size={14} />
                  <span>Record Payment</span>
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted">
              Incoming Coastal Enquiries ({enquiries.length})
            </span>
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="px-3 py-1.5 bg-carbon text-bone dark:bg-white dark:text-carbon text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus size={12} />
              <span>Log New Client Lead</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enquiries.map((enq) => (
              <div
                key={enq.id}
                className="p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-4 hover:border-carbon dark:hover:border-white transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="font-bold text-carbon dark:text-white">{enq.enquiryNumber}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 uppercase tracking-widest font-bold border ${
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

                  <h3 className="font-serif text-lg font-bold text-carbon dark:text-white">
                    {enq.clientName}
                  </h3>
                  <p className="text-xs font-mono text-bone-muted dark:text-obsidian-muted">
                    {enq.eventType}
                  </p>

                  <div className="mt-4 space-y-1 text-xs font-mono text-carbon/80 dark:text-bone/80">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-vermillion" />
                      <span>Event: {enq.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-vermillion" />
                      <span>{enq.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-bone-muted" />
                      <span>{enq.phone}</span>
                    </div>
                  </div>

                  {enq.notes && (
                    <p className="mt-3 p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-[11px] font-mono text-bone-muted dark:text-obsidian-muted line-clamp-2">
                      {enq.notes}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-bone-border dark:border-obsidian-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-bone-muted dark:text-obsidian-muted block">
                      Target Budget
                    </span>
                    <span className="font-bold text-sm text-carbon dark:text-white">
                      {formatINR(enq.estimatedBudget)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleLaunchQuoteFromEnquiry(enq)}
                    className="px-3 py-1.5 bg-carbon text-bone dark:bg-white dark:text-carbon text-xs font-mono uppercase tracking-wider hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center gap-1"
                  >
                    <span>Create Quote</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ORDERS & DELIVERY PIPELINE (CONVERTED BOOKINGS)                     */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted">
              Active Production Orders & Post-Delivery Stages ({bookings.length})
            </span>
          </div>

          <div className="space-y-4">
            {bookings.map((booking) => {
              const currentStage: DeliveryStage = booking.deliveryStage || 'EDITING_IN_PROGRESS';
              return (
                <div
                  key={booking.id}
                  className="p-6 bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white shadow-sm space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-bone-border dark:border-obsidian-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-vermillion">
                          ORDER: {booking.shootCode}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-carbon/5 dark:bg-white/10 uppercase">
                          {booking.type}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-carbon dark:text-white mt-1">
                        {booking.title}
                      </h3>
                      <p className="text-xs font-mono text-bone-muted dark:text-obsidian-muted">
                        Client: {booking.client.name} — {booking.client.company} ({booking.location.city})
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-[10px] uppercase text-bone-muted dark:text-obsidian-muted block">
                        Financial Settlement
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-bold">
                        Paid: {formatINR(booking.financialSummary.retainerPaid)}
                      </span>
                      <span className="text-xs text-vermillion font-bold block">
                        Balance Due: {formatINR(booking.financialSummary.balanceDue)}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Pipeline Stepper */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted block mb-3">
                      Post-Production & Delivery Milestones
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px] font-mono text-center">
                      {[
                        { id: 'RAW_INGESTED', label: '1. RAW Ingest' },
                        { id: 'SELECTION_PENDING', label: '2. Client Selection' },
                        { id: 'EDITING_IN_PROGRESS', label: '3. Color & Retouch' },
                        { id: 'ALBUM_DESIGN', label: '4. Album Printing' },
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
                            className={`p-2 border transition-all ${
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-xs font-mono">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={booking.hardDriveReceived || false}
                        onChange={(e) =>
                          onUpdateBookingDelivery(booking.id, {
                            hardDriveReceived: e.target.checked,
                          })
                        }
                        className="w-4 h-4 accent-vermillion"
                      />
                      <span className="font-semibold text-carbon dark:text-white">
                        Client Hard Drive Received for RAW Data (Term #12)
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
                        className="w-4 h-4 accent-vermillion"
                      />
                      <span className="font-semibold text-carbon dark:text-white">
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
      {/* TAB 4: PRE-DEFINED CATALOG & ITEMS EDITOR                                  */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Section 1: Pre-defined Requirements List */}
          <div className="p-6 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-bone-border dark:border-obsidian-border">
              <h3 className="font-serif text-lg font-bold uppercase text-carbon dark:text-white">
                Pre-defined Requirements Catalog
              </h3>
              <span className="text-[10px] font-mono text-bone-muted">Admin Controlled</span>
            </div>

            <div className="space-y-2">
              {catalog.standardRequirements.map((req, idx) => (
                <div
                  key={req.id}
                  className="p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-carbon dark:text-white">{req.name}</span>
                    <span className="text-bone-muted dark:text-obsidian-muted ml-2">({req.price})</span>
                  </div>
                  <button
                    onClick={() => {
                      setCatalog({
                        ...catalog,
                        standardRequirements: catalog.standardRequirements.filter((r) => r.id !== req.id),
                      });
                    }}
                    className="text-bone-muted hover:text-vermillion p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add requirement */}
            <div className="flex gap-2 pt-2 text-xs font-mono">
              <input
                type="text"
                placeholder="e.g. Drone Night FPV Chase"
                value={newReqName}
                onChange={(e) => setNewReqName(e.target.value)}
                className="flex-1 p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
              />
              <button
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
                className="px-4 py-2 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold uppercase"
              >
                Add
              </button>
            </div>
          </div>

          {/* Section 2: Pre-defined Deliverables with Details */}
          <div className="p-6 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-bone-border dark:border-obsidian-border">
              <h3 className="font-serif text-lg font-bold uppercase text-carbon dark:text-white">
                Pre-defined Deliverables & Footnotes
              </h3>
              <span className="text-[10px] font-mono text-bone-muted">Admin Controlled</span>
            </div>

            <div className="space-y-2">
              {catalog.standardDeliverables.map((del) => (
                <div
                  key={del.id}
                  className="p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border flex items-start justify-between text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-carbon dark:text-white block">{del.item}</span>
                    <span className="text-[11px] text-bone-muted dark:text-obsidian-muted italic">
                      {del.details}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setCatalog({
                        ...catalog,
                        standardDeliverables: catalog.standardDeliverables.filter((d) => d.id !== del.id),
                      });
                    }}
                    className="text-bone-muted hover:text-vermillion p-1 shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add deliverable */}
            <div className="space-y-2 pt-2 text-xs font-mono">
              <input
                type="text"
                placeholder="Item title (e.g. Wedding Highlight Teaser)"
                value={newDelivItem}
                onChange={(e) => setNewDelivItem(e.target.value)}
                className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Details (e.g. *60-sec vertical reel)"
                  value={newDelivDetail}
                  onChange={(e) => setNewDelivDetail(e.target.value)}
                  className="flex-1 p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                />
                <button
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
                  className="px-4 py-2 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold uppercase"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: NEW CLIENT ENQUIRY MODAL                                          */}
      {/* ========================================================================= */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-bone-border dark:border-obsidian-border">
              <h3 className="font-serif text-xl font-bold uppercase text-carbon dark:text-white">
                Log New Coastal Enquiry
              </h3>
              <button
                onClick={() => setShowEnquiryModal(false)}
                className="text-xs font-mono text-bone-muted hover:text-carbon dark:hover:text-white"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleCreateEnquiry} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Client / Couple Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alveera D’souza / Arvind Hegde"
                  value={enqClientName}
                  onChange={(e) => setEnqClientName(e.target.value)}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted mb-1">
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
                  <label className="block text-[10px] uppercase text-bone-muted mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mangalore / Udupi"
                    value={enqCity}
                    onChange={(e) => setEnqCity(e.target.value)}
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted mb-1">
                    Target Event Date
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
                  <label className="block text-[10px] uppercase text-bone-muted mb-1">
                    Budget Estimate (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={enqBudget}
                    onChange={(e) => setEnqBudget(e.target.value)}
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Event Category
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Catholic Nuptials, Roce & Ullal Reception"
                  value={enqType}
                  onChange={(e) => setEnqType(e.target.value)}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Creative Requirements & Location Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Beachside sunset portraits, drone clearance details, church protocols..."
                  value={enqNotes}
                  onChange={(e) => setEnqNotes(e.target.value)}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold uppercase tracking-widest hover:bg-vermillion transition-all"
                >
                  Save Enquiry
                </button>
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
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
      {/* MODAL 2: GENERATE / CUSTOMIZE QUOTATION MODAL                              */}
      {/* ========================================================================= */}
      {showCreateQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-bone-border dark:border-obsidian-border">
              <div>
                <span className="text-[10px] font-mono text-vermillion uppercase font-bold block">
                  Studio Dispatch
                </span>
                <h3 className="font-serif text-2xl font-bold uppercase text-carbon dark:text-white">
                  Package Quotation Builder
                </h3>
              </div>
              <button
                onClick={() => setShowCreateQuoteModal(false)}
                className="text-xs font-mono text-bone-muted hover:text-carbon dark:hover:text-white"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} className="space-y-6 text-xs font-mono">
              {/* Header Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted mb-1">
                    Quotation No.
                  </label>
                  <input
                    type="text"
                    required
                    value={qNumber}
                    onChange={(e) => setQNumber(e.target.value)}
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    required
                    value={qDate}
                    onChange={(e) => setQDate(e.target.value)}
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted mb-1">
                    Package Title
                  </label>
                  <input
                    type="text"
                    required
                    value={qPackageTitle}
                    onChange={(e) => setQPackageTitle(e.target.value)}
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold"
                  />
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border">
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted mb-1">
                    Quoted to (Client Name)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alveera D’souza"
                    value={qClientName}
                    onChange={(e) => setQClientName(e.target.value)}
                    className="w-full p-2 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted mb-1">
                    City / Jurisdiction
                  </label>
                  <input
                    type="text"
                    required
                    value={qClientCity}
                    onChange={(e) => setQClientCity(e.target.value)}
                    className="w-full p-2 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border text-carbon dark:text-white"
                  />
                </div>
              </div>

              {/* Requirements Checklist (Add / Remove from Pre-defined) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-[11px]">
                    Select Requirements Included in Package:
                  </span>
                  <span className="text-[10px] text-bone-muted">From Pre-defined Catalog</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 border border-bone-border dark:border-obsidian-border">
                  {qRequirements.map((req) => (
                    <label
                      key={req.id}
                      className={`p-2 border flex items-center justify-between cursor-pointer transition-all ${
                        req.included
                          ? 'bg-carbon/5 dark:bg-white/10 border-carbon dark:border-white font-bold'
                          : 'border-bone-border dark:border-obsidian-border text-bone-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
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
                      <span className="text-[10px] opacity-70">{req.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deliverables Checklist (Add / Remove from Pre-defined) */}
              <div className="space-y-2">
                <span className="font-bold uppercase text-[11px] block">
                  Select Deliverables & Footnotes:
                </span>
                <div className="space-y-1.5 max-h-44 overflow-y-auto p-2 border border-bone-border dark:border-obsidian-border">
                  {qDeliverables.map((del) => (
                    <label
                      key={del.id}
                      className={`p-2 border flex items-center justify-between cursor-pointer transition-all ${
                        del.included
                          ? 'bg-carbon/5 dark:bg-white/10 border-carbon dark:border-white font-bold'
                          : 'border-bone-border dark:border-obsidian-border text-bone-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
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
                      <span className="text-[10px] text-bone-muted italic">{del.details}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Crew Numbers */}
              <div className="space-y-2">
                <span className="font-bold uppercase text-[11px] block">Crew Members Allocation:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {qCrew.map((crew) => (
                    <div
                      key={crew.id}
                      className="p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border"
                    >
                      <span className="text-[10px] text-bone-muted uppercase block">{crew.role}</span>
                      <input
                        type="number"
                        min="1"
                        value={crew.number}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQCrew(qCrew.map((c) => (c.id === crew.id ? { ...c, number: val } : c)));
                        }}
                        className="w-full bg-transparent font-bold text-sm text-carbon dark:text-white outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Price */}
              <div className="p-4 bg-bone-surface dark:bg-obsidian-surface border-2 border-carbon dark:border-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-vermillion block">
                    Grand Package Price (INR)
                  </span>
                  <p className="text-[11px] text-bone-muted">
                    Advance: {qAdvancePct}% ({formatINR((parseFloat(qTotalPrice) * qAdvancePct) / 100)})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-lg">Rs.</span>
                  <input
                    type="number"
                    required
                    value={qTotalPrice}
                    onChange={(e) => setQTotalPrice(e.target.value)}
                    className="w-36 p-2 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-serif font-black text-lg outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold uppercase tracking-widest hover:bg-vermillion transition-all"
                >
                  Generate & Commit Quotation
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateQuoteModal(false)}
                  className="px-6 py-3 border border-bone-border dark:border-obsidian-border uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RECORD MANUAL PAYMENT & AUTO-SYNC ENGINE                         */}
      {/* ========================================================================= */}
      {showPaymentModal && paymentTargetQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-bone-border dark:border-obsidian-border">
              <div>
                <span className="text-[10px] font-mono text-vermillion uppercase font-bold block">
                  Treasury Ledger Sync
                </span>
                <h3 className="font-serif text-xl font-bold uppercase text-carbon dark:text-white">
                  Record Manual Payment
                </h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-xs font-mono text-bone-muted hover:text-carbon dark:hover:text-white"
              >
                [ESC]
              </button>
            </div>

            <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-xs font-mono">
              <span className="font-bold block">Auto-Sync Activated:</span>
              <span>
                Recording this payment will immediately update the Order balance, invoice status, and
                log an incoming receipt in the Dual General Ledger.
              </span>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Client & Quotation Reference
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${paymentTargetQuote.clientName} (${paymentTargetQuote.quotationNumber})`}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Payment Amount Received (INR)
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-serif font-black text-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                >
                  <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                  <option value="NEFT / RTGS HDFC">NEFT / RTGS HDFC Bank</option>
                  <option value="IMPS Transfer">IMPS Direct</option>
                  <option value="Cheque Deposit">Bank Cheque Deposit</option>
                  <option value="Cash Receipt">Cash Deposit / Float</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Notes / Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR # 894029104928"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold uppercase tracking-widest hover:bg-vermillion transition-all"
                >
                  Commit & Sync Everywhere
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-3 border border-bone-border dark:border-obsidian-border uppercase"
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
