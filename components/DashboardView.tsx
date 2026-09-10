'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  CreditCard,
  Camera,
  AlertCircle,
  MapPin,
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2,
  Share2,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { ShootBooking, LedgerEntry, KPISummary, ViewModule } from '@/types';

interface DashboardViewProps {
  kpi: KPISummary;
  shoots: ShootBooking[];
  ledger: LedgerEntry[];
  onNavigate: (module: ViewModule) => void;
  onSelectShoot: (shoot: ShootBooking) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpi,
  shoots,
  ledger,
  onNavigate,
  onSelectShoot,
}) => {
  const nextShoot = shoots[0]; // Next up on set (Someshwara Beach / Saffron & Silk)
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const filteredLedger = ledger.filter((entry) => {
    if (filterType === 'ALL') return true;
    return entry.type === filterType;
  });

  const formatCurrency = (val: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-3.5 sm:p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Top Editorial Breadcrumb & Status Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-bone-border dark:border-obsidian-border">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-bone-muted dark:text-obsidian-muted mb-1">
            <span>Studio Terminal</span>
            <span>//</span>
            <span className="text-vermillion font-bold">Mangalore Coastal Atelier</span>
            <span className="hidden xs:inline">//</span>
            <span className="hidden xs:inline">Session 2026.09</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-black tracking-tight text-carbon dark:text-white uppercase">
            Master Directoire
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('calendar')}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-mono uppercase tracking-widest bg-carbon text-bone dark:bg-white dark:text-carbon hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center gap-1.5 sm:gap-2"
          >
            <Calendar size={13} />
            <span>Open Calendar</span>
          </button>
          <button
            onClick={() => onNavigate('ledger')}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-mono uppercase tracking-widest border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white transition-all flex items-center gap-1.5 sm:gap-2"
          >
            <Layers size={13} />
            <span>Dual Ledger</span>
          </button>
        </div>
      </div>

      {/* Avant-Garde KPI Grid */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Net Margin */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border flex flex-col justify-between relative overflow-hidden group hover:border-carbon dark:hover:border-white transition-colors"
          >
            <div className="flex items-center justify-between text-bone-muted dark:text-obsidian-muted mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
                Net Production Margin
              </span>
              <TrendingUp size={14} className="text-vermillion" />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-carbon dark:text-white tracking-tight">
                {formatCurrency(kpi.netMargins.amount)}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] font-mono">
                <span className="px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 font-bold border border-green-500/20">
                  +{kpi.netMargins.changePct}% MoM
                </span>
                <span className="text-bone-muted dark:text-obsidian-muted">
                  {kpi.netMargins.percentage}% Yield
                </span>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 text-7xl font-serif font-black opacity-[0.03] select-none pointer-events-none text-carbon dark:text-white">
              01
            </div>
          </motion.div>

          {/* KPI 2: Cash Flow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border flex flex-col justify-between relative overflow-hidden group hover:border-carbon dark:hover:border-white transition-colors"
          >
            <div className="flex items-center justify-between text-bone-muted dark:text-obsidian-muted mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
                Liquid Vault Reserve
              </span>
              <CreditCard size={14} className="text-carbon dark:text-white" />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-carbon dark:text-white tracking-tight">
                {formatCurrency(kpi.cashFlow.current)}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-bone-muted dark:text-obsidian-muted">
                <span className="text-green-600 dark:text-green-400">
                  +{formatCurrency(kpi.cashFlow.monthInflow)}
                </span>
                <span>/</span>
                <span className="text-vermillion">
                  -{formatCurrency(kpi.cashFlow.monthOutflow)}
                </span>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 text-7xl font-serif font-black opacity-[0.03] select-none pointer-events-none text-carbon dark:text-white">
              02
            </div>
          </motion.div>

          {/* KPI 3: Confirmed Shoots */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border flex flex-col justify-between relative overflow-hidden group hover:border-carbon dark:hover:border-white transition-colors"
          >
            <div className="flex items-center justify-between text-bone-muted dark:text-obsidian-muted mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
                Active Coastal Sets
              </span>
              <Camera size={14} className="text-vermillion" />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-carbon dark:text-white tracking-tight flex items-baseline gap-2">
                <span>{kpi.confirmedShoots.count}</span>
                <span className="text-xs font-mono text-bone-muted dark:text-obsidian-muted uppercase font-normal">
                  Campaigns
                </span>
              </div>
              <div className="mt-2 text-[11px] font-mono text-bone-muted dark:text-obsidian-muted">
                {kpi.confirmedShoots.activeProductionDays} Production Call Days scheduled
              </div>
            </div>
            <div className="absolute right-0 bottom-0 text-7xl font-serif font-black opacity-[0.03] select-none pointer-events-none text-carbon dark:text-white">
              03
            </div>
          </motion.div>

          {/* KPI 4: Unpaid Retainers */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border flex flex-col justify-between relative overflow-hidden group hover:border-carbon dark:hover:border-white transition-colors"
          >
            <div className="flex items-center justify-between text-bone-muted dark:text-obsidian-muted mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
                Pending Client Retainers
              </span>
              <AlertCircle size={14} className="text-amber-500" />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-carbon dark:text-white tracking-tight">
                {formatCurrency(kpi.unpaidRetainers.total)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-600 dark:text-amber-400">
                  {kpi.unpaidRetainers.count} Retainers Awaited
                </span>
                <span className="text-bone-muted dark:text-obsidian-muted">
                  Strict 15-Day Net
                </span>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 text-7xl font-serif font-black opacity-[0.03] select-none pointer-events-none text-carbon dark:text-white">
              04
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Split: "Next Up on Set" Call-Sheet + Live Dual Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Next Up On Set (5 cols) */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-vermillion animate-pulse" />
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-carbon dark:text-white">
                Next Up On Set // Call Sheet
              </h2>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted">
              CODE: {nextShoot.shootCode}
            </span>
          </div>

          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            onClick={() => onSelectShoot(nextShoot)}
            className="cursor-pointer bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-6 relative overflow-hidden shadow-brutalist-light dark:shadow-brutalist-dark"
          >
            {/* Stamp Tag */}
            <div className="inline-block px-2.5 py-1 mb-4 text-[10px] font-mono font-bold uppercase tracking-widest bg-carbon text-bone dark:bg-white dark:text-carbon">
              {nextShoot.type}
            </div>

            <h3 className="text-2xl font-serif font-bold text-carbon dark:text-white leading-snug">
              {nextShoot.title}
            </h3>

            <p className="mt-1 text-xs font-mono uppercase tracking-wider text-bone-muted dark:text-obsidian-muted">
              Client: {nextShoot.client.name} — {nextShoot.client.company}
            </p>

            {/* Shoot Countdown & Call Time */}
            <div className="mt-6 pt-5 border-t border-bone-border dark:border-obsidian-border grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted">
                  Call Time
                </span>
                <span className="text-sm font-mono font-bold text-vermillion mt-0.5 flex items-center gap-1.5">
                  <Clock size={12} />
                  {nextShoot.callTime}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted">
                  Date of Production
                </span>
                <span className="text-sm font-mono font-bold text-carbon dark:text-white mt-0.5">
                  {nextShoot.date}
                </span>
              </div>
            </div>

            {/* Coordinates & Location */}
            <div className="mt-4 p-3 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-carbon dark:text-white">
                <MapPin size={13} className="text-vermillion shrink-0" />
                <span className="truncate">{nextShoot.location.name}</span>
              </div>
              <div className="text-[11px] font-mono text-bone-muted dark:text-obsidian-muted pl-5 flex items-center justify-between">
                <span>{nextShoot.location.city}</span>
                <span className="font-mono text-[10px] bg-carbon/10 dark:bg-white/10 px-1.5 py-0.5">
                  {nextShoot.location.coordinates}
                </span>
              </div>
            </div>

            {/* Production Crew Tags */}
            <div className="mt-5">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted mb-2">
                Confirmed Crew Roster ({nextShoot.productionTeam.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {nextShoot.productionTeam.map((member, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-vermillion" />
                    <strong className="text-carbon dark:text-white">{member.initials}</strong>
                    <span className="text-bone-muted dark:text-obsidian-muted truncate max-w-[120px]">
                      {member.role.split('&')[0]}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Balance & Shot Count Metrics */}
            <div className="mt-6 pt-4 border-t border-bone-border dark:border-obsidian-border flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-bone-muted dark:text-obsidian-muted block text-[10px] uppercase tracking-wider">
                  Shot List Target
                </span>
                <span className="font-bold text-carbon dark:text-white">
                  {nextShoot.shotListTotal} Editorial Plates
                </span>
              </div>
              <div className="text-right">
                <span className="text-bone-muted dark:text-obsidian-muted block text-[10px] uppercase tracking-wider">
                  Outstanding Balance
                </span>
                <span className="font-bold text-vermillion">
                  {formatCurrency(nextShoot.financialSummary.balanceDue, nextShoot.financialSummary.currency)}
                </span>
              </div>
            </div>

            <div className="mt-5 text-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectShoot(nextShoot);
                }}
                className="w-full py-2 text-xs font-mono uppercase tracking-widest bg-carbon text-bone dark:bg-white dark:text-carbon hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center justify-center gap-1"
              >
                <span>Inspect Full Call Sheet</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </section>

        {/* Right Column: Live Dual Ledger Feed (7 cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-carbon dark:text-white">
                Live Dual Ledger Feed
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-carbon/5 dark:bg-white/10 text-bone-muted dark:text-obsidian-muted">
                Receivables vs Expenses
              </span>
            </div>

            {/* Filter Pill Tabs */}
            <div className="flex items-center border border-bone-border dark:border-obsidian-border text-[11px] font-mono">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 uppercase tracking-wider transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold'
                    : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('INCOME')}
                className={`px-3 py-1 uppercase tracking-wider transition-colors border-l border-bone-border dark:border-obsidian-border ${
                  filterType === 'INCOME'
                    ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold'
                    : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
                }`}
              >
                Receivables
              </button>
              <button
                onClick={() => setFilterType('EXPENSE')}
                className={`px-3 py-1 uppercase tracking-wider transition-colors border-l border-bone-border dark:border-obsidian-border ${
                  filterType === 'EXPENSE'
                    ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold'
                    : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
                }`}
              >
                Gear / Studio Costs
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="border border-bone-border dark:border-obsidian-border bg-bone-card dark:bg-obsidian-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-bone-border dark:border-obsidian-border bg-bone-surface/70 dark:bg-obsidian-surface/80 text-[10px] font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted">
                    <th className="py-3 px-4">Ref & Date</th>
                    <th className="py-3 px-4">Description / Entity</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bone-border dark:divide-obsidian-border text-xs font-mono">
                  {filteredLedger.slice(0, 6).map((entry) => {
                    const isIncome = entry.type === 'INCOME';
                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-bone-surface/50 dark:hover:bg-obsidian-surface/50 transition-colors group"
                      >
                        {/* Ref & Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="block font-bold text-carbon dark:text-white">
                            {entry.transactionRef}
                          </span>
                          <span className="text-[10px] text-bone-muted dark:text-obsidian-muted">
                            {entry.date}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-carbon dark:text-white line-clamp-1">
                            {entry.description}
                          </div>
                          <div className="text-[10px] text-bone-muted dark:text-obsidian-muted flex items-center gap-2 mt-0.5">
                            <span className="truncate">{entry.counterparty}</span>
                            {entry.relatedShootCode && (
                              <span className="px-1 bg-carbon/5 dark:bg-white/10 text-[9px]">
                                {entry.relatedShootCode}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-[10px] tracking-wider uppercase text-bone-muted dark:text-obsidian-muted">
                            {entry.category.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <span
                            className={`font-mono font-bold flex items-center justify-end gap-1 ${
                              isIncome
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-carbon dark:text-white'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft size={12} className="shrink-0" />
                            ) : (
                              <ArrowUpRight size={12} className="shrink-0 text-vermillion" />
                            )}
                            {isIncome ? '+' : '-'}
                            {formatCurrency(entry.amount)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-block text-[9px] px-2 py-0.5 uppercase tracking-widest font-mono font-semibold border ${
                              entry.status === 'CLEARED'
                                ? 'border-green-600/30 text-green-700 dark:text-green-400 bg-green-500/10'
                                : 'border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10'
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Bar: Quick View All in Ledger */}
            <div className="p-3 bg-bone-surface dark:bg-obsidian-surface border-t border-bone-border dark:border-obsidian-border flex items-center justify-between text-xs font-mono">
              <span className="text-bone-muted dark:text-obsidian-muted text-[11px]">
                Showing latest dual accounting entries
              </span>
              <button
                onClick={() => onNavigate('ledger')}
                className="text-vermillion hover:underline font-bold flex items-center gap-1 uppercase tracking-wider text-[11px]"
              >
                <span>View Full Studio Ledger</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
