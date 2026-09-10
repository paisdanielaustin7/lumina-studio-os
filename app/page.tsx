'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { CalendarView } from '@/components/CalendarView';
import { LedgerView } from '@/components/LedgerView';
import { InvoicesView } from '@/components/InvoicesView';
import { QuotationView } from '@/components/QuotationView';
import { SettingsView } from '@/components/SettingsView';
import { LoginModal } from '@/components/LoginModal';
import { LoginPage } from '@/components/LoginPage';
import {
  mockKPISummary,
  mockShoots,
  mockLedger,
  mockInvoices,
  mockQuotations,
  mockEnquiries,
} from '@/lib/mockData';
import { defaultStudioSettings, defaultUsers } from '@/lib/catalogDefaults';
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
  StudioSettings,
  UserAccount,
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
  Users,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

export default function StudioOSHome() {
  const [activeModule, setActiveModule] = useState<ViewModule>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('ADMIN_DIRECTOR');
  const [selectedShoot, setSelectedShoot] = useState<ShootBooking | null>(null);

  // Authentication & Settings State
  const [studioSettings, setStudioSettings] = useState<StudioSettings>(defaultStudioSettings);
  const [users, setUsers] = useState<UserAccount[]>(defaultUsers);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Synced Live State across all modules
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(mockEnquiries);
  const [bookings, setBookings] = useState<ShootBooking[]>(mockShoots);
  const [ledger, setLedger] = useState<LedgerEntry[]>(mockLedger);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [kpi, setKpi] = useState<KPISummary>(mockKPISummary);

  // Restore saved users & active session from browser storage on mount
  useEffect(() => {
    let activeUsersList = defaultUsers;

    if (typeof window !== 'undefined') {
      const savedUsers = localStorage.getItem('lumina_users');
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            activeUsersList = parsed;
            setUsers(parsed);
          }
        } catch (e) {
          console.error('Failed to parse saved users', e);
        }
      }

      const savedSettings = localStorage.getItem('lumina_settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setStudioSettings(parsedSettings);
        } catch (e) {
          console.error('Failed to parse saved settings', e);
        }
      }

      // Check active session
      const savedSession = sessionStorage.getItem('lumina_active_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          const matched = activeUsersList.find(
            (u) => u.id === session.userId || u.username === session.username
          );
          if (matched) {
            setCurrentUser(matched);
            setUserRole(matched.role);
          }
        } catch (e) {
          console.error('Failed to restore session', e);
        }
      }
    }

    setIsAuthChecking(false);
  }, []);

  const handleUpdateUsers = (newUsers: UserAccount[]) => {
    setUsers(newUsers);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumina_users', JSON.stringify(newUsers));
    }
  };

  const handleUpdateSettings = (newSettings: StudioSettings) => {
    setStudioSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumina_settings', JSON.stringify(newSettings));
    }
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setUserRole(user.role);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'lumina_active_session',
        JSON.stringify({
          userId: user.id,
          username: user.username,
          role: user.role,
          loggedInAt: new Date().toISOString(),
        })
      );
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lumina_active_session');
    }
  };

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

  // 2. Update quotation with Cascading Updates (Quotation -> ShootBooking Order -> Tax Invoice)
  const handleUpdateQuotation = (quote: Quotation) => {
    // A. Update quote in state
    setQuotations((prev) => prev.map((q) => (q.id === quote.id ? quote : q)));

    // B. Cascade to linked ShootBooking (Order) if already converted
    let cascadedBookingFound = false;
    setBookings((prevBookings) =>
      prevBookings.map((b) => {
        const isLinked =
          b.quotationId === quote.id ||
          b.client.name.toLowerCase() === quote.clientName.toLowerCase();
        if (isLinked) {
          cascadedBookingFound = true;
          const newTotal = quote.totalPrice;
          const retainerPaid = b.financialSummary.retainerPaid;
          const newBalance = Math.max(0, newTotal - retainerPaid);
          return {
            ...b,
            title: `${quote.clientName}: ${quote.packageTitle}`,
            client: {
              ...b.client,
              name: quote.clientName,
              company: quote.clientName,
              city: quote.clientCity,
              phone: quote.clientPhone || b.client.phone,
              totalBilled: newTotal,
            },
            financialSummary: {
              ...b.financialSummary,
              totalFee: newTotal,
              balanceDue: newBalance,
            },
          };
        }
        return b;
      })
    );

    // C. Cascade to linked Invoices
    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) => {
        const isLinked = inv.clientName.toLowerCase() === quote.clientName.toLowerCase();
        if (isLinked) {
          const newTotal = quote.totalPrice;
          const prevPaid = Math.max(0, inv.totalAmount - inv.balanceDue);
          const newBalance = Math.max(0, newTotal - prevPaid);
          return {
            ...inv,
            clientName: quote.clientName,
            brand: quote.packageTitle,
            subtotal: newTotal,
            totalAmount: newTotal,
            balanceDue: newBalance,
            status: newBalance === 0 ? 'PAID' : prevPaid > 0 ? 'PARTIAL' : 'UNPAID',
            items: [
              {
                id: inv.items[0]?.id || 'item-1',
                description: `${quote.packageTitle} Coverage & High-Res Plates`,
                quantity: 1,
                unitPrice: newTotal,
                total: newTotal,
              },
            ],
          };
        }
        return inv;
      })
    );

    if (cascadedBookingFound) {
      alert(
        `Quotation ${quote.quotationNumber} updated! Cascaded new total (₹${quote.totalPrice.toLocaleString(
          'en-IN'
        )}) to linked Booking Order and Tax Invoice.`
      );
    }
  };

  // 3. Add new client enquiry
  const handleAddEnquiry = (enquiry: Enquiry) => {
    setEnquiries([enquiry, ...enquiries]);
  };

  // 4. One-Click Conversion: Quotation -> Confirmed Booking / Order
  const handleConvertQuotationToBooking = (quote: Quotation) => {
    const updatedQuote: Quotation = {
      ...quote,
      status: 'CONVERTED',
    };
    handleUpdateQuotation(updatedQuote);

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

  // 5. Synced Payment Entry Engine
  const handleRecordPayment = (payment: {
    reference: string;
    amount: number;
    paymentMethod: string;
    relatedShootCode?: string;
    clientName: string;
    notes?: string;
  }) => {
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

  const handleSwitchUser = (user: UserAccount) => {
    setCurrentUser(user);
    setUserRole(user.role);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'lumina_active_session',
        JSON.stringify({
          userId: user.id,
          username: user.username,
          role: user.role,
          loggedInAt: new Date().toISOString(),
        })
      );
    }
  };

  // If initial auth check is ongoing, display luxury editorial loader
  if (isAuthChecking) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center font-mono text-white text-xs tracking-widest uppercase">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-vermillion animate-ping" />
          <span>INITIALIZING LUMINA STUDIO OS // PLEASE WAIT...</span>
        </div>
      </div>
    );
  }

  // ENFORCED SECURITY: User must land on Login Page unless authenticated
  if (!currentUser) {
    return <LoginPage users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bone dark:bg-obsidian text-carbon dark:text-white">
      {/* Login & Identity Switch Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onLogin={handleSwitchUser}
      />

      {/* Left Collapsible Studio OS Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userRole={userRole}
        setUserRole={(role) => {
          setUserRole(role);
          const found = users.find((u) => u.role === role);
          if (found) handleSwitchUser(found);
        }}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 h-screen overflow-y-auto relative flex flex-col">
        {/* Subtle Top Status Bar with Logout Action */}
        <div className="h-10 px-6 border-b border-bone-border dark:border-obsidian-border flex items-center justify-between text-[11px] font-mono shrink-0 bg-bone-surface/60 dark:bg-obsidian-surface/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              ENGINE ONLINE
            </span>
            <span className="text-bone-muted dark:text-obsidian-muted hidden sm:inline">
              // ACTIVE IDENTITY: {currentUser.fullName} (@{currentUser.username}) [
              {currentUser.role === 'ADMIN_DIRECTOR' ? 'ROOT DIRECTOR' : 'RESTRICTED CREW'}]
            </span>
          </div>

          <div className="flex items-center gap-4 text-bone-muted dark:text-obsidian-muted">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-xs uppercase font-mono tracking-wider hover:text-carbon dark:hover:text-white flex items-center gap-1.5 text-carbon dark:text-white transition-colors"
              title="Switch identity"
            >
              <KeyRound size={12} />
              <span className="hidden sm:inline">Switch User</span>
            </button>

            {/* Prominent Logout Button */}
            <button
              onClick={handleLogout}
              className="text-xs uppercase font-mono tracking-wider text-vermillion hover:text-white hover:bg-vermillion border border-vermillion/40 px-2.5 py-0.5 transition-all flex items-center gap-1.5 font-bold"
              title="Exit session and lock system"
            >
              <LogOut size={12} />
              <span>Logout</span>
            </button>

            <span className="hidden lg:inline text-bone-muted/70 dark:text-obsidian-muted/70">
              MANGALORE HQ
            </span>
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
              settings={studioSettings}
              currentUser={currentUser}
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
            <LedgerView
              initialLedger={ledger}
              currentUser={currentUser}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          )}

          {activeModule === 'billing' && (
            <InvoicesView
              invoices={invoices}
              settings={studioSettings}
              currentUser={currentUser}
            />
          )}

          {/* Access Control Overview Module */}
          {activeModule === 'access' && (
            <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-bone-border dark:border-obsidian-border">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-bone-muted dark:text-obsidian-muted mb-1">
                    <span>Security & Roles</span>
                    <span>//</span>
                    <span className="text-vermillion font-bold">Supabase RLS Matrix</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight uppercase">
                    Access Control
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveModule('settings')}
                    className="px-4 py-2.5 bg-carbon text-bone dark:bg-white dark:text-carbon text-xs font-mono uppercase tracking-widest font-bold hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center gap-2"
                  >
                    <Users size={14} />
                    <span>Manage User Accounts in Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2.5 text-vermillion border border-vermillion/40 text-xs font-mono uppercase tracking-widest hover:bg-vermillion hover:text-white transition-all flex items-center gap-2 font-bold"
                  >
                    <LogOut size={14} />
                    <span>Logout Session</span>
                  </button>
                </div>
              </div>

              {/* Active Identity Card */}
              <div className="p-6 bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-vermillion font-bold">
                    Currently Authenticated Identity
                  </span>
                  <h3 className="text-2xl font-serif font-bold uppercase">{currentUser.fullName}</h3>
                  <p className="text-xs font-mono text-bone-muted dark:text-obsidian-muted">
                    Username: <code className="text-carbon dark:text-white font-bold">@{currentUser.username}</code> | Assigned Role:{' '}
                    <span className="font-bold uppercase text-carbon dark:text-white">{currentUser.role}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 font-mono text-xs uppercase font-bold">
                    Engine Session Active
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 bg-vermillion text-white text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 hover:bg-black transition-colors"
                  >
                    <LogOut size={12} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-4">
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
                      <CheckCircle size={14} /> <span>Add / Edit User Credentials & Permissions</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      const admin = users.find((u) => u.username === 'admin') || defaultUsers[0];
                      handleSwitchUser(admin);
                    }}
                    className={`w-full py-2.5 text-xs font-mono uppercase tracking-widest ${
                      currentUser.role === 'ADMIN_DIRECTOR'
                        ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold'
                        : 'border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white'
                    }`}
                  >
                    {currentUser.role === 'ADMIN_DIRECTOR' ? 'Current Active Role' : 'Switch to Director (admin)'}
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
                    onClick={() => {
                      const crew = users.find((u) => u.role === 'SECOND_SHOOTER') || defaultUsers[1];
                      handleSwitchUser(crew);
                    }}
                    className={`w-full py-2.5 text-xs font-mono uppercase tracking-widest ${
                      currentUser.role === 'SECOND_SHOOTER'
                        ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold'
                        : 'border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white'
                    }`}
                  >
                    {currentUser.role === 'SECOND_SHOOTER' ? 'Current Active Role' : 'Switch to Second Shooter'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Module (Allows Admin to Add/Edit/Delete Users & Permissions) */}
          {activeModule === 'settings' && (
            <SettingsView
              settings={studioSettings}
              onUpdateSettings={handleUpdateSettings}
              users={users}
              currentUser={currentUser}
              onUpdateUsers={handleUpdateUsers}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
