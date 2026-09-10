'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { CalendarView } from '@/components/CalendarView';
import { LedgerView } from '@/components/LedgerView';
import { InvoicesView } from '@/components/InvoicesView';
import {
  mockKPISummary,
  mockShoots,
  mockLedger,
  mockInvoices,
} from '@/lib/mockData';
import { ViewModule, UserRole, ShootBooking } from '@/types';
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

  const handleSelectShoot = (shoot: ShootBooking | null) => {
    setSelectedShoot(shoot);
    if (shoot) {
      setActiveModule('calendar');
    }
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
            <span className="hidden md:inline">COLOR PIPELINE: 16-BIT PROPHOTO RGB</span>
            <Link
              href="/about"
              className="text-carbon dark:text-white hover:text-vermillion dark:hover:text-vermillion transition-colors flex items-center gap-1 uppercase font-bold"
            >
              <span>Public Deck</span>
              <ExternalLink size={10} />
            </Link>
          </div>
        </div>

        {/* Dynamic Views */}
        <div className="flex-1 pb-16">
          {activeModule === 'overview' && (
            <DashboardView
              kpi={mockKPISummary}
              shoots={mockShoots}
              ledger={mockLedger}
              onNavigate={setActiveModule}
              onSelectShoot={handleSelectShoot}
            />
          )}

          {activeModule === 'calendar' && (
            <CalendarView
              shoots={mockShoots}
              selectedShoot={selectedShoot}
              onSelectShoot={setSelectedShoot}
            />
          )}

          {activeModule === 'ledger' && (
            <LedgerView initialLedger={mockLedger} />
          )}

          {activeModule === 'billing' && (
            <InvoicesView invoices={mockInvoices} />
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
                      <CheckCircle size={14} /> <span>Create / Modify / Void Invoices</span>
                    </li>
                    <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={14} /> <span>Crew assignment & gear lock</span>
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
                    <li className="flex items-center gap-2 text-vermillion">
                      <Lock size={14} /> <span>Financial retainers & ledger hidden</span>
                    </li>
                    <li className="flex items-center gap-2 text-vermillion">
                      <Lock size={14} /> <span>Client contact emails & billing restricted</span>
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
