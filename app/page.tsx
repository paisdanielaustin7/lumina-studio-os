'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { CalendarView } from '@/components/CalendarView';
import { LedgerView } from '@/components/LedgerView';
import { InvoicesView } from '@/components/InvoicesView';
import { QuotationView } from '@/components/QuotationView';
import {
  mockKPISummary,
  mockShoots,
  mockLedger,
  mockInvoices,
  mockQuotations,
  mockEnquiries,
} from '@/lib/mockData';
import {
  ViewModule,
  UserRole,
  ShootBooking,
  Quotation,
  Enquiry,
  Invoice,
  LedgerEntry,
  KPISummary,
  DeliveryStage,
} from '@/types';
import {
  Shield,
  ShieldCheck,
  Lock,
  User,
  Sliders,
  CheckCircle,
  Database,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function StudioOSHome() {
  const [activeModule, setActiveModule] = useState<ViewModule>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('ADMIN_DIRECTOR');
  const [selectedShoot, setSelectedShoot] = useState<ShootBooking | null>(null);

  // Synced Live State across all modules
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(mockEnquiries);
  const [bookings, setBookings] = useState<ShootBooking[]>(mockShoots);
  const [ledger, setLedger] = useState<LedgerEntry[]>(mockLedger);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [kpi, setKpi] = useState<KPISummary>(mockKPISummary);

  const handleSelectShoot = (shoot: ShootBooking | null) => {
    setSelectedShoot(shoot);
    if (shoot) {
      setActiveModule('calendar');
    }
  };

  // 1. Add new quotation
  const handleAddQuotation = (quote: Quotation) => {
    setQuotations([quote, ...quotations]);
  };

  // 2. Update quotation
  const handleUpdateQuotation = (quote: Quotation) => {
    setQuotations(quotations.map((q) => (q.id === quote.id ? quote : q)));
  };

  // 3. Add new client enquiry
  const handleAddEnquiry = (enquiry: Enquiry) => {
    setEnquiries([enquiry, ...enquiries]);
  };

  // 4. One-Click Conversion: Quotation -> Confirmed Booking / Order
  const handleConvertQuotationToBooking = (quote: Quotation) => {
    // Update quotation status
    const updatedQuote: Quotation = {
      ...quote,
      status: 'CONVERTED',
    };
    handleUpdateQuotation(updatedQuote);

    // If enquiry linked, mark enquiry as CONVERTED
    if (quote.enquiryId) {
      setEnquiries(
        enquiries.map((e) =>
          e.id === quote.enquiryId ? { ...e, status: 'CONVERTED' } : e
        )
      );
    }

    const code = `LUM-MNG-${Math.floor(10 + Math.random() * 89)}`;
    const advance = (quote.totalPrice * quote.advancePercentage) / 100;
    const balance = quote.totalPrice - advance;

    // Create confirmed ShootBooking
    const newBooking: ShootBooking = {
      id: `sht-${Date.now()}`,
      shootCode: code,
      title: `${quote.clientName}: ${quote.packageTitle}`,
      client: {
        id: `cli-${Date.now()}`,
        name: quote.clientName,
        company: quote.clientName,
        brandTier: 'HAUTE_COUTURE',
        email: quote.clientEmail || 'client@lumina.in',
        phone: quote.clientPhone,
        city: quote.clientCity,
        totalBilled: quote.totalPrice,
        totalPaid: advance,
        status: 'ACTIVE',
      },
      type: 'Haute Couture Editorial',
      status: 'CONFIRMED',
      date: '2026-11-20',
      startTime: '06:00',
      endTime: '19:30',
      callTime: '05:30 AM (Set Call)',
      location: {
        name: `${quote.clientCity} Coastal Venue & Heritage Set`,
        city: quote.clientCity,
        coordinates: '12.9141° N, 74.8560° E',
        accessCode: 'COAST-GATE-26',
      },
      productionTeam: [
        { role: 'Studio Director & Lead Camera', name: 'Dan Aurel', initials: 'DA' },
        { role: 'First Camera Assistant', name: 'Roshan D’Silva', initials: 'RD' },
        { role: 'Digital Imaging Technician (DIT)', name: 'Farooq Mansoor', initials: 'FM' },
      ],
      shotListTotal: 25,
      shotListCompleted: 0,
      financialSummary: {
        totalFee: quote.totalPrice,
        retainerPaid: advance,
        balanceDue: balance,
        currency: 'INR',
      },
      scheduleTimeline: [
        { time: '05:30', activity: 'Grip & Tethering Setup', lead: 'Farooq Mansoor' },
        { time: '06:30', activity: 'Traditional Draping & Kasavu Portraits', lead: 'Dan Aurel' },
        { time: '16:00', activity: 'Sunset Coastal & Drone Cinema Flight', lead: 'Dan Aurel' },
        { time: '19:30', activity: 'Wrap & Dual NVMe RAW Ingest Verification', lead: 'Farooq Mansoor' },
      ],
      gearAllocated: [
        'Hasselblad H6D-100c Medium Format',
        'Phase One IQ4 150MP Achromatic Back',
        'Profoto Pro-11 Studio Flash Generators',
      ],
      editorialNotes: 'Converted from Quotation ' + quote.quotationNumber,
      quotationId: quote.id,
      deliveryStage: 'RAW_INGESTED',
      hardDriveReceived: false,
      clientSelectionDone: false,
    };

    setBookings([newBooking, ...bookings]);

    // Also auto-generate matching Invoice
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-0${Math.floor(100 + Math.random() * 899)}`,
      clientId: newBooking.client.id,
      clientName: quote.clientName,
      brand: quote.packageTitle,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '2026-11-20',
      items: [
        {
          id: 'item-1',
          description: `${quote.packageTitle} Coverage & High-Res Plates`,
          quantity: 1,
          unitPrice: quote.totalPrice,
          total: quote.totalPrice,
        },
      ],
      subtotal: quote.totalPrice,
      productionFeeTax: 0,
      totalAmount: quote.totalPrice,
      balanceDue: balance,
      status: balance === 0 ? 'PAID' : advance > 0 ? 'PARTIAL' : 'UNPAID',
    };

    setInvoices([newInvoice, ...invoices]);

    alert(`Order ${code} created successfully! Added to Calendar and Invoices.`);
  };

  // 5. Synced Payment Entry Engine (Updates Order + Invoice + Dual General Ledger + KPI Vault)
  const handleRecordPayment = (payment: {
    reference: string;
    amount: number;
    paymentMethod: string;
    relatedShootCode?: string;
    clientName: string;
    notes?: string;
  }) => {
    // A. Add to Live Dual Ledger
    const newLedgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      transactionRef: payment.reference,
      date: new Date().toISOString().split('T')[0],
      description: `Client Payment: ${payment.clientName} (${payment.notes || 'Settlement'})`,
      category: 'CLIENT_RECEIVABLE',
      type: 'INCOME',
      amount: payment.amount,
      counterparty: payment.clientName,
      relatedShootCode: payment.relatedShootCode,
      status: 'CLEARED',
      paymentMethod: payment.paymentMethod,
    };
    setLedger([newLedgerEntry, ...ledger]);

    // B. Update Matching Booking (Order)
    setBookings(
      bookings.map((b) => {
        if (
          b.client.name.toLowerCase() === payment.clientName.toLowerCase() ||
          b.shootCode === payment.relatedShootCode
        ) {
          const newPaid = b.financialSummary.retainerPaid + payment.amount;
          const newBal = Math.max(0, b.financialSummary.totalFee - newPaid);
          return {
            ...b,
            financialSummary: {
              ...b.financialSummary,
              retainerPaid: newPaid,
              balanceDue: newBal,
            },
          };
        }
        return b;
      })
    );

    // C. Update Matching Invoice
    setInvoices(
      invoices.map((inv) => {
        if (inv.clientName.toLowerCase() === payment.clientName.toLowerCase()) {
          const newBal = Math.max(0, inv.balanceDue - payment.amount);
          return {
            ...inv,
            balanceDue: newBal,
            status: newBal === 0 ? 'PAID' : 'PARTIAL',
          };
        }
        return inv;
      })
    );

    // D. Update Studio KPI Vault
    setKpi({
      ...kpi,
      cashFlow: {
        ...kpi.cashFlow,
        current: kpi.cashFlow.current + payment.amount,
        monthInflow: kpi.cashFlow.monthInflow + payment.amount,
      },
      unpaidRetainers: {
        ...kpi.unpaidRetainers,
        total: Math.max(0, kpi.unpaidRetainers.total - payment.amount),
      },
    });

    alert(
      `Payment of Rs ${payment.amount.toLocaleString(
        'en-IN'
      )} recorded and synced to General Ledger, Order, and Invoices!`
    );
  };

  // 6. Update Delivery Milestones
  const handleUpdateBookingDelivery = (
    bookingId: string,
    updates: {
      deliveryStage?: DeliveryStage;
      hardDriveReceived?: boolean;
      clientSelectionDone?: boolean;
    }
  ) => {
    setBookings(
      bookings.map((b) => (b.id === bookingId ? { ...b, ...updates } : b))
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bone dark:bg-obsidian text-carbon dark:text-white">
      {/* Left Collapsible Studio OS Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 h-screen overflow-y-auto relative flex flex-col">
        {/* Subtle Top Status Bar */}
        <div className="h-10 px-6 border-b border-bone-border dark:border-obsidian-border flex items-center justify-between text-[11px] font-mono shrink-0 bg-bone-surface/60 dark:bg-obsidian-surface/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              ENGINE ONLINE
            </span>
            <span className="text-bone-muted dark:text-obsidian-muted hidden sm:inline">
              // ACTIVE MODE: {userRole === 'ADMIN_DIRECTOR' ? 'STUDIO DIRECTOR [ROOT]' : 'SECOND UNIT [RESTRICTED]'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-bone-muted dark:text-obsidian-muted">
            <span className="hidden md:inline">COLOR PIPELINE: 16-BIT PROPHOTO RGB // MANGALORE COASTAL HQ</span>
            <Link
              href="/about"
              className="text-carbon dark:text-white hover:text-vermillion dark:hover:text-vermillion transition-colors flex items-center gap-1 uppercase font-bold"
            >
              <span>Public Deck</span>
              <ExternalLink size={10} />
            </Link>
          </div>
        </div>

        {/* Dynamic Operating Modules */}
        <div className="flex-1 pb-16">
          {activeModule === 'overview' && (
            <DashboardView
              kpi={kpi}
              shoots={bookings}
              ledger={ledger}
              onNavigate={setActiveModule}
              onSelectShoot={handleSelectShoot}
            />
          )}

          {activeModule === 'quotations' && (
            <QuotationView
              quotations={quotations}
              enquiries={enquiries}
              bookings={bookings}
              invoices={invoices}
              onAddQuotation={handleAddQuotation}
              onUpdateQuotation={handleUpdateQuotation}
              onAddEnquiry={handleAddEnquiry}
              onConvertQuotationToBooking={handleConvertQuotationToBooking}
              onRecordPayment={handleRecordPayment}
              onUpdateBookingDelivery={handleUpdateBookingDelivery}
            />
          )}

          {activeModule === 'calendar' && (
            <CalendarView
              shoots={bookings}
              selectedShoot={selectedShoot}
              onSelectShoot={setSelectedShoot}
            />
          )}

          {activeModule === 'ledger' && (
            <LedgerView initialLedger={ledger} />
          )}

          {activeModule === 'billing' && (
            <InvoicesView invoices={invoices} />
          )}

          {/* Access Control Module */}
          {activeModule === 'access' && (
            <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
              <div className="pb-6 border-b border-bone-border dark:border-obsidian-border">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-bone-muted dark:text-obsidian-muted mb-1">
                  <span>Security & Roles</span>
                  <span>//</span>
                  <span className="text-vermillion font-bold">Supabase RLS Matrix</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight uppercase">
                  Access Control
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl font-bold uppercase">Director (Root Principal)</h2>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-vermillion text-white font-bold">
                      Full Read / Write
                    </span>
                  </div>
                  <p className="text-xs font-mono text-bone-muted dark:text-obsidian-muted">
                    Full cryptographic control over dual general ledger, client billing, shoot pricing, and master call sheets.
                  </p>
                  <ul className="space-y-2 text-xs font-mono">
                    <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={14} /> <span>General Ledger RLS bypass</span>
                    </li>
                    <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={14} /> <span>Create / Modify / Void Invoices & Quotes</span>
                    </li>
                    <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={14} /> <span>Edit Pre-defined catalog items</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => setUserRole('ADMIN_DIRECTOR')}
                    className={`w-full py-2.5 text-xs font-mono uppercase tracking-widest ${
                      userRole === 'ADMIN_DIRECTOR'
                        ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold'
                        : 'border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white'
                    }`}
                  >
                    {userRole === 'ADMIN_DIRECTOR' ? 'Current Active Role' : 'Switch to Director'}
                  </button>
                </div>

                <div className="p-6 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl font-bold uppercase">Second Unit / Crew</h2>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-carbon/10 dark:bg-white/10 font-bold">
                      Restricted Call Sheets
                    </span>
                  </div>
                  <p className="text-xs font-mono text-bone-muted dark:text-obsidian-muted">
                    Confined strictly to schedule timeline, call times, location coordinates, and equipment allocations. Financial ledgers remain obfuscated.
                  </p>
                  <ul className="space-y-2 text-xs font-mono">
                    <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={14} /> <span>Read-only access to assigned call sheets</span>
                    </li>
                    <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={14} /> <span>Edit call sheet checklist & delivery notes</span>
                    </li>
                    <li className="flex items-center gap-2 text-vermillion">
                      <Lock size={14} /> <span>Financial retainers & ledger hidden</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => setUserRole('SECOND_SHOOTER')}
                    className={`w-full py-2.5 text-xs font-mono uppercase tracking-widest ${
                      userRole === 'SECOND_SHOOTER'
                        ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold'
                        : 'border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white'
                    }`}
                  >
                    {userRole === 'SECOND_SHOOTER' ? 'Current Active Role' : 'Switch to Second Shooter'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Module */}
          {activeModule === 'settings' && (
            <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
              <div className="pb-6 border-b border-bone-border dark:border-obsidian-border">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-bone-muted dark:text-obsidian-muted mb-1">
                  <span>Hardware & Color</span>
                  <span>//</span>
                  <span className="text-vermillion font-bold">System Parameters</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight uppercase">
                  Studio Settings
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                <div className="p-6 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-4">
                  <h2 className="font-serif text-lg font-bold uppercase text-carbon dark:text-white">
                    Color Profile & Raw Conversion
                  </h2>
                  <div>
                    <label className="block text-[10px] uppercase text-bone-muted mb-1">
                      Default Working Color Space
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="ProPhoto RGB (16-bit D65 Linear)"
                      className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-bone-muted mb-1">
                      Tether Backup Redundancy
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="Triple Mirror RAID (Dual On-Set NVMe + Cold Cloud Sync)"
                      className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white"
                    />
                  </div>
                </div>

                <div className="p-6 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-4">
                  <h2 className="font-serif text-lg font-bold uppercase text-carbon dark:text-white">
                    Supabase Database Connection
                  </h2>
                  <div>
                    <label className="block text-[10px] uppercase text-bone-muted mb-1">
                      Supabase Instance Status
                    </label>
                    <div className="p-2.5 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 font-bold flex items-center gap-2">
                      <Database size={14} />
                      <span>Schema Defined (`schema.sql` ready to sync)</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-bone-muted mb-1">
                      Environment Keys
                    </label>
                    <p className="text-[11px] text-bone-muted dark:text-obsidian-muted">
                      Configured to read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` when deployed live.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
