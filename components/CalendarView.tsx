'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  X,
  Sparkles,
  Camera,
  Layers,
  FileCheck,
  Shield,
  Download,
} from 'lucide-react';
import { ShootBooking, ShootType } from '@/types';
import { generateCallSheetPDF } from '@/lib/pdfGenerator';

interface CalendarViewProps {
  shoots: ShootBooking[];
  selectedShoot: ShootBooking | null;
  onSelectShoot: (shoot: ShootBooking | null) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  shoots,
  selectedShoot,
  onSelectShoot,
}) => {
  const [currentMonth, setCurrentMonth] = useState('September 2026');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Days in September 2026: Sept 1 is Tuesday (so Monday starts Aug 31 or blank)
  // Let's build a bespoke high-fashion grid of 35 days (5 weeks x 7 days)
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Calendar cells for Sept 2026
  // Sept 1, 2026 is Tuesday. So Day 1 has 1 offset day (Aug 31)
  const calendarCells = [
    { dayNumber: 31, isCurrentMonth: false, dateStr: '2026-08-31' },
    ...Array.from({ length: 30 }, (_, i) => {
      const d = i + 1;
      const dayFormatted = d < 10 ? `0${d}` : `${d}`;
      return {
        dayNumber: d,
        isCurrentMonth: true,
        dateStr: `2026-09-${dayFormatted}`,
      };
    }),
    { dayNumber: 1, isCurrentMonth: false, dateStr: '2026-10-01' },
    { dayNumber: 2, isCurrentMonth: false, dateStr: '2026-10-02' },
    { dayNumber: 3, isCurrentMonth: false, dateStr: '2026-10-03' },
    { dayNumber: 4, isCurrentMonth: false, dateStr: '2026-10-04' },
  ];

  const getShootsForDate = (dateStr: string) => {
    return shoots.filter((s) => {
      const matchesDate = s.date === dateStr;
      if (!matchesDate) return false;
      if (activeFilter === 'ALL') return true;
      return s.type === activeFilter;
    });
  };

  const getBadgeColor = (type: ShootType) => {
    switch (type) {
      case 'Haute Couture Editorial':
        return 'bg-carbon text-bone dark:bg-white dark:text-carbon border-carbon dark:border-white';
      case 'Architectural Digest Feature':
        return 'bg-bone-surface text-carbon dark:bg-obsidian-surface dark:text-white border-bone-border dark:border-obsidian-border';
      case 'High Jewelry Lookbook':
        return 'bg-editorial-gold/15 text-amber-900 dark:text-editorial-gold border-editorial-gold/40';
      case 'Commercial Campaign':
        return 'bg-vermillion/10 text-vermillion border-vermillion/40';
      default:
        return 'bg-bone-surface text-bone-muted dark:bg-obsidian-surface dark:text-obsidian-muted';
    }
  };

  const formatCurrency = (val: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-10 max-w-7xl mx-auto relative space-y-4 sm:space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-bone-border dark:border-obsidian-border">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-bone-muted dark:text-obsidian-muted mb-1">
            <span>Production Matrix</span>
            <span>//</span>
            <span className="text-vermillion font-bold">Confirmed Call Sheets</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-black tracking-tight text-carbon dark:text-white uppercase">
            {currentMonth}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Filter Shoot Type */}
          <div className="flex items-center border border-bone-border dark:border-obsidian-border text-[10px] sm:text-[11px] font-mono">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 uppercase tracking-wider transition-colors ${
                activeFilter === 'ALL'
                  ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold'
                  : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
              }`}
            >
              All Sets
            </button>
            <button
              onClick={() => setActiveFilter('Haute Couture Editorial')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 uppercase tracking-wider transition-colors border-l border-bone-border dark:border-obsidian-border ${
                activeFilter === 'Haute Couture Editorial'
                  ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold'
                  : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
              }`}
            >
              Couture
            </button>
            <button
              onClick={() => setActiveFilter('High Jewelry Lookbook')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 uppercase tracking-wider transition-colors border-l border-bone-border dark:border-obsidian-border ${
                activeFilter === 'High Jewelry Lookbook'
                  ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold'
                  : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
              }`}
            >
              Jewelry
            </button>
          </div>

          <div className="flex items-center border border-bone-border dark:border-obsidian-border">
            <button
              className="p-1.5 sm:p-2 text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white hover:bg-bone-surface dark:hover:bg-obsidian-surface transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2.5 sm:px-3 text-[11px] sm:text-xs font-mono font-bold tracking-widest text-carbon dark:text-white">
              SEP 26
            </span>
            <button
              className="p-1.5 sm:p-2 text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white hover:bg-bone-surface dark:hover:bg-obsidian-surface transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="flex items-center justify-between sm:hidden text-[10px] font-mono text-bone-muted dark:text-obsidian-muted pt-1">
        <span>Calendar Roster</span>
        <span>Swipe horizontally ↔</span>
      </div>

      {/* Calendar Scroll Wrapper for Mobile Viewports */}
      <div className="overflow-x-auto border border-bone-border dark:border-obsidian-border -mx-3.5 sm:mx-0">
        <div className="min-w-[620px]">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-bone-border dark:border-obsidian-border bg-bone-surface dark:bg-obsidian-surface">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="py-2.5 text-center font-mono text-[11px] font-bold uppercase tracking-[0.2em] border-r border-bone-border dark:border-obsidian-border text-bone-muted dark:text-obsidian-muted last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Bespoke Day Cells Grid */}
          <div className="grid grid-cols-7 bg-bone-card dark:bg-obsidian-card">
            {calendarCells.map((cell, idx) => {
              const dayShoots = getShootsForDate(cell.dateStr);
              const isToday = cell.dateStr === '2026-09-10';

          return (
            <div
              key={idx}
              className={`min-h-[120px] md:min-h-[145px] p-2 md:p-3 border-r border-b border-bone-border dark:border-obsidian-border flex flex-col justify-between transition-colors relative group ${
                cell.isCurrentMonth
                  ? 'bg-transparent hover:bg-bone-surface/40 dark:hover:bg-obsidian-surface/40'
                  : 'bg-bone-surface/40 dark:bg-obsidian-surface/30 opacity-40'
              } ${isToday ? 'ring-1 ring-inset ring-vermillion' : ''}`}
            >
              {/* Day Number & Status */}
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-xs md:text-sm font-bold tracking-tight ${
                    isToday
                      ? 'text-vermillion font-black flex items-center gap-1'
                      : cell.isCurrentMonth
                      ? 'text-carbon dark:text-white'
                      : 'text-bone-muted dark:text-obsidian-muted'
                  }`}
                >
                  {cell.dayNumber}
                  {isToday && (
                    <span className="text-[9px] font-mono uppercase tracking-widest px-1 py-0.2 bg-vermillion text-white">
                      Today
                    </span>
                  )}
                </span>
                {dayShoots.length > 0 && (
                  <span className="text-[10px] font-mono text-vermillion font-bold">
                    ● {dayShoots.length} SET
                  </span>
                )}
              </div>

              {/* Event Tags in Day Cell */}
              <div className="space-y-1 mt-1 overflow-hidden">
                {dayShoots.map((shoot) => (
                  <motion.button
                    key={shoot.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectShoot(shoot)}
                    className={`w-full text-left p-1.5 border text-[10px] font-mono uppercase tracking-wider block transition-all shadow-sm ${getBadgeColor(
                      shoot.type
                    )}`}
                  >
                    <div className="font-bold truncate">{shoot.client.company}</div>
                    <div className="text-[9px] opacity-80 truncate">{shoot.callTime.split(' ')[0]} // {shoot.location.city.split(',')[0]}</div>
                  </motion.button>
                ))}
              </div>

              {/* Bottom Subtle Date stamp */}
              <div className="text-[9px] font-mono text-bone-muted/40 dark:text-obsidian-muted/40 uppercase tracking-widest text-right">
                {cell.isCurrentMonth ? `S.${cell.dayNumber}` : ''}
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </div>

      {/* Slide-in Shoot Inspector Drawer */}
      <AnimatePresence>
        {selectedShoot && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onSelectShoot(null)}
              className="fixed inset-0 bg-carbon/60 dark:bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Inspector Modal / Slide-out Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-bone-card dark:bg-obsidian-surface border-l border-bone-border dark:border-obsidian-border z-50 overflow-y-auto shadow-2xl flex flex-col"
            >
              {/* Drawer Top Header */}
              <div className="p-4 sm:p-6 border-b border-bone-border dark:border-obsidian-border flex items-center justify-between sticky top-0 bg-bone-card dark:bg-obsidian-surface z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-vermillion" />
                  <span className="text-xs font-mono uppercase tracking-[0.25em] text-bone-muted dark:text-obsidian-muted truncate max-w-[220px] sm:max-w-none">
                    Call Sheet Dossier // {selectedShoot.shootCode}
                  </span>
                </div>
                <button
                  onClick={() => onSelectShoot(null)}
                  className="p-1.5 rounded border border-bone-border dark:border-obsidian-border text-bone-muted hover:text-carbon dark:hover:text-white transition-colors"
                  aria-label="Close Drawer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 flex-1">
                {/* Title & Type */}
                <div>
                  <div className="inline-block px-2.5 py-1 mb-3 text-[10px] font-mono font-bold uppercase tracking-widest bg-carbon text-bone dark:bg-white dark:text-carbon">
                    {selectedShoot.type}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-carbon dark:text-white leading-tight">
                    {selectedShoot.title}
                  </h2>
                  <p className="mt-2 text-xs font-mono uppercase tracking-wider text-bone-muted dark:text-obsidian-muted">
                    Commissioned by: {selectedShoot.client.name} — {selectedShoot.client.company}
                  </p>
                </div>

                {/* Location & Times Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-bone-surface dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted block">
                      Production Date & Call
                    </span>
                    <span className="text-xs font-mono font-bold text-carbon dark:text-white block">
                      {selectedShoot.date} @ {selectedShoot.callTime}
                    </span>
                    <span className="text-[11px] font-mono text-vermillion">
                      Wrap Target: {selectedShoot.endTime}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted block">
                      Location & Access
                    </span>
                    <span className="text-xs font-mono font-bold text-carbon dark:text-white block truncate">
                      {selectedShoot.location.name}
                    </span>
                    <span className="text-[11px] font-mono text-bone-muted dark:text-obsidian-muted block">
                      {selectedShoot.location.coordinates} ({selectedShoot.location.accessCode || 'No Gate Code'})
                    </span>
                  </div>
                </div>

                {/* Financial Ledger Balance */}
                <div className="border border-bone-border dark:border-obsidian-border p-4 bg-bone-card dark:bg-obsidian-card space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                    <span className="text-bone-muted dark:text-obsidian-muted">Production Fee</span>
                    <span className="font-bold text-carbon dark:text-white">
                      {formatCurrency(selectedShoot.financialSummary.totalFee, selectedShoot.financialSummary.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                    <span className="text-bone-muted dark:text-obsidian-muted">Retainer Received</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      +{formatCurrency(selectedShoot.financialSummary.retainerPaid, selectedShoot.financialSummary.currency)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-bone-border dark:border-obsidian-border flex items-center justify-between text-xs font-mono uppercase tracking-widest font-bold">
                    <span>Balance Due Upon Delivery</span>
                    <span className="text-vermillion text-sm">
                      {formatCurrency(selectedShoot.financialSummary.balanceDue, selectedShoot.financialSummary.currency)}
                    </span>
                  </div>
                </div>

                {/* Shot List Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                    <span className="font-bold text-carbon dark:text-white">
                      Shot List Progress: {selectedShoot.shotListCompleted} / {selectedShoot.shotListTotal} Plates
                    </span>
                    <span className="text-vermillion font-bold">
                      {Math.round((selectedShoot.shotListCompleted / selectedShoot.shotListTotal) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-bone-surface dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border overflow-hidden">
                    <div
                      className="h-full bg-vermillion transition-all duration-500"
                      style={{
                        width: `${(selectedShoot.shotListCompleted / selectedShoot.shotListTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Timeline Schedule */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-carbon dark:text-white">
                    Day Schedule Timeline
                  </h3>
                  <div className="border border-bone-border dark:border-obsidian-border divide-y divide-bone-border dark:divide-obsidian-border bg-bone-card dark:bg-obsidian-card">
                    {selectedShoot.scheduleTimeline.map((item, i) => (
                      <div key={i} className="p-3 text-xs font-mono flex items-start gap-4">
                        <span className="font-bold text-vermillion shrink-0">{item.time}</span>
                        <div className="flex-1">
                          <p className="text-carbon dark:text-white font-medium">{item.activity}</p>
                          <p className="text-[10px] text-bone-muted dark:text-obsidian-muted mt-0.5">
                            Lead Coordinator: {item.lead}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment & Gear Allocated */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-carbon dark:text-white">
                    Allocated Studio & Rental Gear
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedShoot.gearAllocated.map((gear, i) => (
                      <div
                        key={i}
                        className="p-2 bg-bone-surface dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border text-[11px] font-mono text-carbon dark:text-white flex items-center gap-2"
                      >
                        <Camera size={12} className="text-bone-muted dark:text-obsidian-muted shrink-0" />
                        <span className="truncate">{gear}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crew Roster */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-carbon dark:text-white">
                    Crew Dispatch
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedShoot.productionTeam.map((member, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-bone-surface dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border flex items-center justify-between text-xs font-mono"
                      >
                        <div>
                          <p className="font-bold text-carbon dark:text-white">{member.name}</p>
                          <p className="text-[10px] text-bone-muted dark:text-obsidian-muted">{member.role}</p>
                        </div>
                        <span className="w-6 h-6 rounded-full bg-carbon text-bone dark:bg-white dark:text-carbon font-mono font-bold text-[10px] flex items-center justify-center">
                          {member.initials}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-bone-border dark:border-obsidian-border bg-bone-card dark:bg-obsidian-surface sticky bottom-0 flex items-center gap-3">
                <button
                  onClick={() => generateCallSheetPDF(selectedShoot)}
                  className="flex-1 py-2.5 text-xs font-mono uppercase tracking-widest bg-carbon text-bone dark:bg-white dark:text-carbon hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  <span>Download Call Sheet PDF</span>
                </button>
                <button
                  onClick={() => onSelectShoot(null)}
                  className="px-4 py-2.5 text-xs font-mono uppercase tracking-widest border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
