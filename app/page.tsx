'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { CalendarView } from '@/components/CalendarView';
import { LedgerView } from '@/components/LedgerView';
import { InvoicesView } from '@/components/InvoicesView';
import { QuotationView } from '@/components/QuotationView';
import { SettingsView } from '@/components/SettingsView';
import { CatalogView } from '@/components/CatalogView';
import { LoginModal } from '@/components/LoginModal';
import { LoginPage } from '@/components/LoginPage';
import { MasterSearchModal } from '@/components/MasterSearchModal';
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
  Search,
  Menu,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
} from 'lucide-react';
import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  fetchUsersFromCloud,
  fetchSettingsFromCloud,
  fetchQuotationsFromCloud,
  fetchEnquiriesFromCloud,
  fetchBookingsFromCloud,
  fetchLedgerFromCloud,
  fetchInvoicesFromCloud,
  syncQuotationToCloud,
  syncBookingToCloud,
  syncEnquiryToCloud,
  syncLedgerEntryToCloud,
  deleteLedgerEntryFromCloud,
  syncInvoiceToCloud,
  syncUserToCloud,
  deleteUserFromCloud,
  syncSettingsToCloud,
  seedCloudIfEmpty,
  reseedCloudData,
  subscribeToLuminaRealtime,
} from '@/lib/supabaseService';

function mergeStudioSettings(prev: StudioSettings, cloud: StudioSettings): StudioSettings {
  const effectiveCrew =
    Array.isArray(cloud.crewRoster) && cloud.crewRoster.length > 0
      ? cloud.crewRoster
      : Array.isArray(prev.crewRoster) && prev.crewRoster.length > 0
        ? prev.crewRoster
        : defaultStudioSettings.crewRoster;

  const effectiveReqs =
    Array.isArray(cloud.packageRequirements) && cloud.packageRequirements.length > 0
      ? cloud.packageRequirements
      : Array.isArray(prev.packageRequirements) && prev.packageRequirements.length > 0
        ? prev.packageRequirements
        : defaultStudioSettings.packageRequirements;

  const effectiveDels =
    Array.isArray(cloud.packageDeliverables) && cloud.packageDeliverables.length > 0
      ? cloud.packageDeliverables
      : Array.isArray(prev.packageDeliverables) && prev.packageDeliverables.length > 0
        ? prev.packageDeliverables
        : defaultStudioSettings.packageDeliverables;

  return {
    ...prev,
    ...cloud,
    crewRoster: effectiveCrew,
    packageRequirements: effectiveReqs,
    packageDeliverables: effectiveDels,
    uiTheme: cloud.uiTheme || prev.uiTheme || 'slate',
  };
}

export default function StudioOSHome() {
  const [activeModule, setActiveModule] = useState<ViewModule>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('ADMIN_DIRECTOR');
  const [selectedShoot, setSelectedShoot] = useState<ShootBooking | null>(null);

  // Internet & Supabase Cloud Connection Telemetry State
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Authentication & Settings State
  const [studioSettings, setStudioSettings] = useState<StudioSettings>(defaultStudioSettings);
  const [users, setUsers] = useState<UserAccount[]>(defaultUsers);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMasterSearchOpen, setIsMasterSearchOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
    let savedSession: string | null = null;
    let activeUsername: string | null = null;
    let activeUserId: string | null = null;

    if (typeof window !== 'undefined') {
      const savedUsers = localStorage.getItem('lumina_users');
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Permanently filter out legacy dummy accounts of roshan and farooq
            const sanitized = parsed.filter(
              (u: UserAccount) =>
                u.id !== 'usr-roshan' &&
                u.id !== 'usr-farooq' &&
                u.username.toLowerCase() !== 'roshan' &&
                u.username.toLowerCase() !== 'farooq'
            );
            activeUsersList = sanitized.length > 0 ? sanitized : defaultUsers;
            setUsers(activeUsersList);
            localStorage.setItem('lumina_users', JSON.stringify(activeUsersList));
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
          if (parsedSettings.uiTheme) {
            document.documentElement.setAttribute('data-theme', parsedSettings.uiTheme);
          }
        } catch (e) {
          console.error('Failed to parse saved settings', e);
        }
      }

      // Check active session from sessionStorage OR browser session cookie
      savedSession = sessionStorage.getItem('lumina_active_session');
      if (savedSession) {
        try {
          const parsedSession = JSON.parse(savedSession);
          if (parsedSession.username) activeUsername = parsedSession.username;
          if (parsedSession.userId) activeUserId = parsedSession.userId;
        } catch (e) {
          console.error('Failed to restore session', e);
        }
      }

      // Check browser session cookie if opened in another tab in the same browser session
      if (!activeUsername && typeof document !== 'undefined') {
        const cookieMatch = document.cookie.match(/(?:^|;\s*)lumina_session_user=([^;]+)/);
        if (cookieMatch) {
          activeUsername = decodeURIComponent(cookieMatch[1]);
        }
      }

      if (activeUsername || activeUserId) {
        const matched = activeUsersList.find(
          (u) =>
            (activeUserId && u.id === activeUserId) ||
            (activeUsername && u.username.toLowerCase() === activeUsername.toLowerCase())
        );
        if (matched) {
          setCurrentUser(matched);
          setUserRole(matched.role);
          sessionStorage.setItem(
            'lumina_active_session',
            JSON.stringify({
              userId: matched.id,
              username: matched.username,
              role: matched.role,
              loggedInAt: new Date().toISOString(),
            })
          );
          document.cookie = `lumina_session_user=${encodeURIComponent(matched.username)}; path=/; SameSite=Lax`;
        }
      }
    }

    // If Supabase credentials are configured, connect to Cloud and listen to Realtime
    let unsubscribeRealtime: (() => void) | null = null;

    if (isSupabaseConfigured()) {
      setIsCloudConnected(true);

      // Fallback timeout to ensure screen is never frozen
      const authTimeout = setTimeout(() => {
        setIsAuthChecking(false);
      }, 1500);

      const loadCloudData = async () => {
        try {
          const [
            cloudUsers,
            cloudSettings,
            cloudQuotes,
            cloudEnquiries,
            cloudBookings,
            cloudLedger,
            cloudInvoices,
          ] = await Promise.all([
            fetchUsersFromCloud(),
            fetchSettingsFromCloud(),
            fetchQuotationsFromCloud(),
            fetchEnquiriesFromCloud(),
            fetchBookingsFromCloud(),
            fetchLedgerFromCloud(),
            fetchInvoicesFromCloud(),
          ]);

          // Permanently delete roshan and farooq from Supabase cloud if they exist
          if (cloudUsers && cloudUsers.length > 0) {
            const deprecated = cloudUsers.filter(
              (u) =>
                u.id === 'usr-roshan' ||
                u.id === 'usr-farooq' ||
                u.username.toLowerCase() === 'roshan' ||
                u.username.toLowerCase() === 'farooq'
            );
            for (const du of deprecated) {
              await deleteUserFromCloud(du.id);
            }
          }

          const cleanedCloudUsers = cloudUsers
            ? cloudUsers.filter(
                (u) =>
                  u.id !== 'usr-roshan' &&
                  u.id !== 'usr-farooq' &&
                  u.username.toLowerCase() !== 'roshan' &&
                  u.username.toLowerCase() !== 'farooq'
              )
            : [];

          let effectiveUsers = activeUsersList;
          if (cleanedCloudUsers && cleanedCloudUsers.length > 0) {
            const cloudUsernames = new Set(cleanedCloudUsers.map((u) => u.username.toLowerCase()));
            const localOnlyUsers = activeUsersList.filter(
              (u) => !cloudUsernames.has(u.username.toLowerCase())
            );

            if (localOnlyUsers.length > 0) {
              for (const lu of localOnlyUsers) {
                await syncUserToCloud(lu);
              }
              const reloadedUsers = await fetchUsersFromCloud();
              const sanitizedReloaded = (reloadedUsers || []).filter(
                (u) =>
                  u.id !== 'usr-roshan' &&
                  u.id !== 'usr-farooq' &&
                  u.username.toLowerCase() !== 'roshan' &&
                  u.username.toLowerCase() !== 'farooq'
              );
              if (sanitizedReloaded.length > 0) {
                effectiveUsers = sanitizedReloaded;
                setUsers(sanitizedReloaded);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('lumina_users', JSON.stringify(sanitizedReloaded));
                }
              }
            } else {
              effectiveUsers = cleanedCloudUsers;
              setUsers(cleanedCloudUsers);
              if (typeof window !== 'undefined') {
                localStorage.setItem('lumina_users', JSON.stringify(cleanedCloudUsers));
              }
            }
          } else if (activeUsersList && activeUsersList.length > 0) {
            for (const u of activeUsersList) {
              await syncUserToCloud(u);
            }
          }

          if (cloudSettings) {
            setStudioSettings((prevSettings) => {
              const merged = mergeStudioSettings(prevSettings, cloudSettings);
              if (typeof window !== 'undefined') {
                localStorage.setItem('lumina_settings', JSON.stringify(merged));
                if (merged.uiTheme) {
                  document.documentElement.setAttribute('data-theme', merged.uiTheme);
                }
              }
              return merged;
            });
          }

          if (cloudQuotes && cloudQuotes.length > 0) setQuotations(cloudQuotes);
          if (cloudEnquiries && cloudEnquiries.length > 0) setEnquiries(cloudEnquiries);
          if (cloudBookings && cloudBookings.length > 0) setBookings(cloudBookings);
          if (cloudLedger && cloudLedger.length > 0) setLedger(cloudLedger);
          if (cloudInvoices && cloudInvoices.length > 0) setInvoices(cloudInvoices);

          // Seed default database data if freshly deployed and completely empty
          if (
            (!cloudUsers || cloudUsers.length === 0) &&
            (!cloudQuotes || cloudQuotes.length === 0)
          ) {
            await seedCloudIfEmpty({
              users: defaultUsers,
              settings: defaultStudioSettings,
              quotations: mockQuotations,
              enquiries: mockEnquiries,
              bookings: mockShoots,
              ledger: mockLedger,
              invoices: mockInvoices,
            });
          }

          // Refresh active session against latest cloud permissions
          if (activeUsername || activeUserId) {
            try {
              const matched = effectiveUsers.find(
                (u) =>
                  (activeUserId && u.id === activeUserId) ||
                  (activeUsername && u.username.toLowerCase() === activeUsername.toLowerCase())
              );
              if (matched) {
                setCurrentUser(matched);
                setUserRole(matched.role);
              }
            } catch (e) {
              console.error('Session sync error', e);
            }
          }
        } catch (err) {
          console.warn('[Supabase] Initial cloud load error, falling back to local storage:', err);
        } finally {
          clearTimeout(authTimeout);
          setIsAuthChecking(false);
        }
      };

      loadCloudData();

      // Establish real-time websocket listener across all 7 PostgreSQL tables
      unsubscribeRealtime = subscribeToLuminaRealtime({
        onQuotationsChange: (quotes) => setQuotations(quotes),
        onEnquiriesChange: (enqs) => setEnquiries(enqs),
        onBookingsChange: (bks) => setBookings(bks),
        onLedgerChange: (led) => setLedger(led),
        onInvoicesChange: (invs) => setInvoices(invs),
        onUsersChange: (newUsers) => {
          setUsers(newUsers);
          if (typeof window !== 'undefined') {
            localStorage.setItem('lumina_users', JSON.stringify(newUsers));
          }
          setCurrentUser((prev) => {
            if (!prev) return prev;
            const matched = newUsers.find((u) => u.id === prev.id);
            return matched || prev;
          });
        },
        onSettingsChange: (newSettings) => {
          setStudioSettings((prevSettings) => {
            const merged = mergeStudioSettings(prevSettings, newSettings);
            if (typeof window !== 'undefined') {
              localStorage.setItem('lumina_settings', JSON.stringify(merged));
              if (merged.uiTheme) {
                document.documentElement.setAttribute('data-theme', merged.uiTheme);
              }
            }
            return merged;
          });
        },
      });
    }

    return () => {
      if (unsubscribeRealtime) unsubscribeRealtime();
    };
  }, []);

  // Network Connectivity (Online / Offline WiFi) Listener & Auto-Resync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = async () => {
        setIsOnline(true);
        if (isSupabaseConfigured()) {
          setIsCloudConnected(true);
          try {
            const [q, e, b, l, i, u, s] = await Promise.all([
              fetchQuotationsFromCloud(),
              fetchEnquiriesFromCloud(),
              fetchBookingsFromCloud(),
              fetchLedgerFromCloud(),
              fetchInvoicesFromCloud(),
              fetchUsersFromCloud(),
              fetchSettingsFromCloud(),
            ]);
            if (q && q.length > 0) setQuotations(q);
            if (e && e.length > 0) setEnquiries(e);
            if (b && b.length > 0) setBookings(b);
            if (l && l.length > 0) setLedger(l);
            if (i && i.length > 0) setInvoices(i);
            if (u && u.length > 0) setUsers(u);
            if (s) {
              setStudioSettings((prevSettings) => {
                const merged = mergeStudioSettings(prevSettings, s);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('lumina_settings', JSON.stringify(merged));
                  if (merged.uiTheme) {
                    document.documentElement.setAttribute('data-theme', merged.uiTheme);
                  }
                }
                return merged;
              });
            }
          } catch (err) {
            console.warn('[Network] Re-sync error upon internet reconnection:', err);
          }
        }
      };

      const handleOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Global Ctrl+K / Cmd+K listener for Master Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsMasterSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateUsers = (newUsers: UserAccount[]) => {
    const previousUserIds = new Set(users.map((u) => u.id));
    const currentUserIds = new Set(newUsers.map((u) => u.id));

    // Handle user deletions in cloud
    previousUserIds.forEach((id) => {
      if (!currentUserIds.has(id)) {
        deleteUserFromCloud(id);
      }
    });
    // Handle user upserts in cloud
    newUsers.forEach((u) => {
      syncUserToCloud(u);
    });

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
    syncSettingsToCloud(newSettings);
  };

  const handleResetSampleData = async () => {
    setQuotations(mockQuotations);
    setEnquiries(mockEnquiries);
    setBookings(mockShoots);
    setLedger(mockLedger);
    setInvoices(mockInvoices);
    setStudioSettings(defaultStudioSettings);
    setKpi(mockKPISummary);

    if (typeof window !== 'undefined') {
      localStorage.setItem('lumina_quotations', JSON.stringify(mockQuotations));
      localStorage.setItem('lumina_enquiries', JSON.stringify(mockEnquiries));
      localStorage.setItem('lumina_bookings', JSON.stringify(mockShoots));
      localStorage.setItem('lumina_ledger', JSON.stringify(mockLedger));
      localStorage.setItem('lumina_invoices', JSON.stringify(mockInvoices));
      localStorage.setItem('lumina_settings', JSON.stringify(defaultStudioSettings));
    }

    if (isSupabaseConfigured()) {
      await reseedCloudData({
        settings: defaultStudioSettings,
        quotations: mockQuotations,
        enquiries: mockEnquiries,
        bookings: mockShoots,
        ledger: mockLedger,
        invoices: mockInvoices,
      });
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
      document.cookie = `lumina_session_user=${encodeURIComponent(user.username)}; path=/; SameSite=Lax`;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lumina_active_session');
      document.cookie = 'lumina_session_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
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
    syncQuotationToCloud(quote);
  };

  // 2. Update quotation with Cascading Updates (Quotation -> ShootBooking Order -> Tax Invoice)
  const handleUpdateQuotation = (quote: Quotation) => {
    // A. Update quote in state & cloud
    setQuotations((prev) => prev.map((q) => (q.id === quote.id ? quote : q)));
    syncQuotationToCloud(quote);

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
          const updatedBooking: ShootBooking = {
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
          syncBookingToCloud(updatedBooking);
          return updatedBooking;
        }
        return b;
      })
    );

    // C. Cascade to linked Invoices
    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) => {
        const isLinked =
          inv.quotationId === quote.id ||
          inv.clientName.toLowerCase() === quote.clientName.toLowerCase();
        if (isLinked) {
          const newTotal = quote.totalPrice;
          const prevPaid = Math.max(0, inv.totalAmount - inv.balanceDue);
          const newBalance = Math.max(0, newTotal - prevPaid);

          // Build synchronized line items from quote deliverables if available
          const lineItems = (quote.deliverables && quote.deliverables.length > 0)
            ? quote.deliverables.map((deliv, idx) => {
                const count = quote.deliverables.length;
                const baseItemPrice = Math.round(newTotal / count);
                const isLast = idx === count - 1;
                const price = isLast ? newTotal - baseItemPrice * (count - 1) : baseItemPrice;
                return {
                  id: `inv-item-${idx + 1}`,
                  description: deliv.details ? `${deliv.item} — ${deliv.details}` : deliv.item,
                  quantity: 1,
                  unitPrice: price,
                  total: price,
                };
              })
            : [
                {
                  id: inv.items[0]?.id || 'item-1',
                  description: `${quote.packageTitle} Coverage & High-Res Plates`,
                  quantity: 1,
                  unitPrice: newTotal,
                  total: newTotal,
                },
              ];

          const updatedInvoice: Invoice = {
            ...inv,
            quotationId: quote.id,
            clientName: quote.clientName,
            brand: quote.packageTitle,
            subtotal: newTotal,
            totalAmount: newTotal,
            balanceDue: newBalance,
            status: newBalance === 0 ? 'PAID' : prevPaid > 0 ? 'PARTIAL' : 'UNPAID',
            items: lineItems,
          };
          syncInvoiceToCloud(updatedInvoice);
          return updatedInvoice;
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
    syncEnquiryToCloud(enquiry);
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
        enquiries.map((e) => {
          if (e.id === quote.enquiryId) {
            const updatedEnq = { ...e, status: 'CONVERTED' as const };
            syncEnquiryToCloud(updatedEnq);
            return updatedEnq;
          }
          return e;
        })
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
        { role: 'Cinematographer (4K Motion)', name: 'Reuben Serrao', initials: 'RS' },
        { role: 'Grip & Lighting Assistant', name: 'Santhosh Bhandary', initials: 'SB' },
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
        { time: '05:30', activity: 'Grip & Lighting Equipment Setup', lead: 'Santhosh Bhandary' },
        { time: '06:30', activity: 'Traditional Draping & Portraiture Master Plates', lead: 'Dan Aurel' },
        { time: '16:00', activity: 'Sunset Coastal & Drone Cinema Flight', lead: 'Dan Aurel' },
        { time: '19:30', activity: 'Wrap & Dual NVMe RAW Ingest Verification', lead: 'Reuben Serrao' },
      ],
      gearAllocated: [
        'Sony FX3 + Sony A7R V Dual Body Rig',
        'Sony GM 24-70mm f/2.8 & 85mm f/1.4 Primes',
        'Godox AD400 Pro Wireless Strobes',
      ],
      editorialNotes: 'Converted from Quotation ' + quote.quotationNumber,
      quotationId: quote.id,
      deliveryStage: 'RAW_INGESTED',
      hardDriveReceived: false,
      clientSelectionDone: false,
    };

    setBookings([newBooking, ...bookings]);
    syncBookingToCloud(newBooking);

    const lineItems = (quote.deliverables && quote.deliverables.length > 0)
      ? quote.deliverables.map((deliv, idx) => {
          const count = quote.deliverables.length;
          const baseItemPrice = Math.round(quote.totalPrice / count);
          const isLast = idx === count - 1;
          const price = isLast ? quote.totalPrice - baseItemPrice * (count - 1) : baseItemPrice;
          return {
            id: `inv-item-${idx + 1}`,
            description: deliv.details ? `${deliv.item} — ${deliv.details}` : deliv.item,
            quantity: 1,
            unitPrice: price,
            total: price,
          };
        })
      : [
          {
            id: 'item-1',
            description: `${quote.packageTitle} Coverage & Master Deliverables`,
            quantity: 1,
            unitPrice: quote.totalPrice,
            total: quote.totalPrice,
          },
        ];

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      quotationId: quote.id,
      invoiceNumber: `INV-2026-0${Math.floor(100 + Math.random() * 899)}`,
      clientId: newBooking.client.id,
      clientName: quote.clientName,
      brand: quote.packageTitle,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '2026-11-20',
      items: lineItems,
      subtotal: quote.totalPrice,
      productionFeeTax: 0,
      totalAmount: quote.totalPrice,
      balanceDue: balance,
      status: balance === 0 ? 'PAID' : advance > 0 ? 'PARTIAL' : 'UNPAID',
    };

    setInvoices([newInvoice, ...invoices]);
    syncInvoiceToCloud(newInvoice);

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
    syncLedgerEntryToCloud(newLedgerEntry);

    setBookings(
      bookings.map((b) => {
        if (
          b.client.name.toLowerCase() === payment.clientName.toLowerCase() ||
          b.shootCode === payment.relatedShootCode
        ) {
          const newPaid = b.financialSummary.retainerPaid + payment.amount;
          const newBal = Math.max(0, b.financialSummary.totalFee - newPaid);
          const updatedBooking: ShootBooking = {
            ...b,
            financialSummary: {
              ...b.financialSummary,
              retainerPaid: newPaid,
              balanceDue: newBal,
            },
          };
          syncBookingToCloud(updatedBooking);
          return updatedBooking;
        }
        return b;
      })
    );

    setInvoices(
      invoices.map((inv) => {
        if (inv.clientName.toLowerCase() === payment.clientName.toLowerCase()) {
          const newBal = Math.max(0, inv.balanceDue - payment.amount);
          const updatedInv: Invoice = {
            ...inv,
            balanceDue: newBal,
            status: newBal === 0 ? 'PAID' : 'PARTIAL',
          };
          syncInvoiceToCloud(updatedInv);
          return updatedInv;
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
      bookings.map((b) => {
        if (b.id === bookingId) {
          const updated = { ...b, ...updates };
          syncBookingToCloud(updated);
          return updated;
        }
        return b;
      })
    );
  };

  // 7. General Ledger Updates & Deletions
  const handleUpdateLedger = (newEntries: LedgerEntry[]) => {
    const previousIds = new Set(ledger.map((e) => e.id));
    const currentIds = new Set(newEntries.map((e) => e.id));

    previousIds.forEach((id) => {
      if (!currentIds.has(id)) {
        deleteLedgerEntryFromCloud(id);
      }
    });
    newEntries.forEach((entry) => {
      syncLedgerEntryToCloud(entry);
    });

    setLedger(newEntries);
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
      document.cookie = `lumina_session_user=${encodeURIComponent(user.username)}; path=/; SameSite=Lax`;
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

      {/* Global Studio Master Search Modal (Instant Record Retrieval across all modules) */}
      <MasterSearchModal
        isOpen={isMasterSearchOpen}
        onClose={() => setIsMasterSearchOpen(false)}
        quotations={quotations}
        bookings={bookings}
        invoices={invoices}
        ledger={ledger}
        enquiries={enquiries}
        currentUser={currentUser}
        onSelectRecord={(module, recordId) => {
          setActiveModule(module);
          if (module === 'calendar') {
            const matched = bookings.find((b) => b.id === recordId || b.shootCode === recordId);
            if (matched) setSelectedShoot(matched);
          }
        }}
      />

      {/* Left Collapsible Studio OS Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 h-screen overflow-y-auto relative flex flex-col">
        {/* Subtle Top Status Bar with Master Search, Mobile Menu Hamburger and Logout Action */}
        <div className="h-12 md:h-10 px-3 sm:px-6 border-b border-bone-border dark:border-obsidian-border flex items-center justify-between text-[11px] font-mono shrink-0 bg-bone-surface/80 dark:bg-obsidian-surface/80 backdrop-blur-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Hamburger Drawer Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 -ml-1 text-carbon dark:text-white hover:bg-carbon/5 dark:hover:bg-white/10 rounded transition-colors flex items-center justify-center"
              aria-label="Open Navigation Menu"
              title="Open Menu"
            >
              <Menu size={18} />
            </button>

            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold text-[10px] sm:text-[11px] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              <span>ENGINE ONLINE</span>
            </span>

            {/* Internet Access & Supabase Cloud Telemetry Badge */}
            {!isOnline ? (
              <span
                className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-[10px] border border-rose-500/40 px-2 py-0.5 bg-rose-500/10 tracking-wider shrink-0 animate-pulse"
                title="Internet connection offline. Working in local offline cache mode. Changes will auto-sync when WiFi reconnects."
              >
                <WifiOff size={11} className="text-rose-500 shrink-0" />
                <span className="hidden sm:inline">OFFLINE (NO WIFI)</span>
                <span className="sm:hidden">OFFLINE</span>
              </span>
            ) : isCloudConnected ? (
              <span
                className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/30 px-2 py-0.5 bg-emerald-500/10 tracking-wider shrink-0"
                title="Internet connected & Supabase real-time cloud synchronization active"
              >
                <Wifi size={11} className="text-emerald-500 shrink-0" />
                <span className="hidden sm:inline">CLOUD SYNC LIVE</span>
                <span className="sm:hidden">SYNC LIVE</span>
              </span>
            ) : (
              <span
                className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-[10px] border border-amber-500/30 px-2 py-0.5 bg-amber-500/10 tracking-wider shrink-0"
                title="Internet connected, running in local storage fallback mode."
              >
                <Wifi size={11} className="text-amber-500 shrink-0" />
                <span className="hidden sm:inline">LOCAL STORAGE</span>
                <span className="sm:hidden">LOCAL</span>
              </span>
            )}

            <span className="text-bone-muted dark:text-obsidian-muted hidden md:inline truncate max-w-xs lg:max-w-md">
              // ACTIVE IDENTITY: {currentUser.fullName} (@{currentUser.username}) [
              {currentUser.role === 'ADMIN_DIRECTOR' ? 'ROOT DIRECTOR' : 'RESTRICTED CREW'}]
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-bone-muted dark:text-obsidian-muted">
            {/* Global Master Search Quick-Button */}
            <button
              onClick={() => setIsMasterSearchOpen(true)}
              className="px-2 sm:px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white text-carbon dark:text-white flex items-center gap-1 sm:gap-1.5 transition-all bg-bone-card/50 dark:bg-obsidian-card/50 shrink-0"
              title="Search all records (Ctrl+K)"
            >
              <Search size={11} className="text-vermillion" />
              <span className="hidden xs:inline">Master</span>
              <span>Search</span>
              <kbd className="hidden sm:inline-block px-1 py-0.2 bg-carbon/10 dark:bg-white/10 text-[9px] font-mono">
                Ctrl+K
              </kbd>
            </button>

            {/* Prominent Logout Button */}
            <button
              onClick={handleLogout}
              className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-vermillion hover:text-white hover:bg-vermillion border border-vermillion/40 px-2 sm:px-2.5 py-1 sm:py-0.5 transition-all flex items-center gap-1 sm:gap-1.5 font-bold shrink-0"
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
              className="hidden sm:flex text-carbon dark:text-white hover:text-vermillion dark:hover:text-vermillion transition-colors items-center gap-1 uppercase font-bold text-[10px] sm:text-xs"
            >
              <span>Public Deck</span>
              <ExternalLink size={10} />
            </Link>
          </div>
        </div>

        {/* Offline Network Warning Notification Banner */}
        {!isOnline && (
          <div className="bg-rose-950/90 border-b border-rose-800/60 text-rose-200 px-3 sm:px-6 py-1.5 text-[10px] sm:text-[11px] font-mono flex items-center justify-between shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <WifiOff size={13} className="text-rose-400 animate-pulse shrink-0" />
              <span>
                <strong>NETWORK OFFLINE:</strong> No internet connection detected. You can keep working safely — quotes and payments are saved locally and will auto-sync once WiFi reconnects.
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-rose-400 tracking-widest hidden md:inline shrink-0">
              SAFE LOCAL STORAGE ACTIVE
            </span>
          </div>
        )}

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
              onUpdateLedger={handleUpdateLedger}
            />
          )}

          {activeModule === 'billing' && (
            <InvoicesView
              invoices={invoices}
              settings={studioSettings}
              currentUser={currentUser}
            />
          )}

          {/* Catalog & Crew Production Directory Module */}
          {activeModule === 'catalog' && (
            <CatalogView
              settings={studioSettings}
              onUpdateSettings={handleUpdateSettings}
              currentUser={currentUser}
            />
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
              onResetSampleData={handleResetSampleData}
            />
          )}
        </div>
      </main>
    </div>
  );
}
