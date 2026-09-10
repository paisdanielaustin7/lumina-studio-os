'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Plus,
  Scale,
  Receipt,
  Download,
  Search,
  Lock,
  KeyRound,
  Trash2,
  Edit3,
} from 'lucide-react';
import { LedgerEntry, LedgerCategory, LedgerStatus, UserAccount } from '@/types';

interface LedgerViewProps {
  initialLedger: LedgerEntry[];
  currentUser?: UserAccount;
  onOpenLoginModal?: () => void;
  onUpdateLedger?: (entries: LedgerEntry[]) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  initialLedger,
  currentUser,
  onOpenLoginModal,
  onUpdateLedger,
}) => {
  const [entries, setEntries] = useState<LedgerEntry[]>(initialLedger);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit entry modal state
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCounterparty, setEditCounterparty] = useState('');
  const [editType, setEditType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [editCategory, setEditCategory] = useState<LedgerCategory>('GEAR_RENTAL');
  const [editStatus, setEditStatus] = useState<LedgerStatus>('CLEARED');
  const [editDate, setEditDate] = useState('');

  // Permission check: Admin or user explicitly granted canEditLedger
  const canEditLedger =
    currentUser?.role === 'ADMIN_DIRECTOR' || !!currentUser?.canEditLedger;

  // New entry form state
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCounterparty, setNewCounterparty] = useState('');
  const [newType, setNewType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [newCategory, setNewCategory] = useState<LedgerCategory>('GEAR_RENTAL');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredEntries = entries.filter((e) => {
    if (typeFilter !== 'ALL' && e.type !== typeFilter) return false;
    if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        e.description.toLowerCase().includes(q) ||
        e.counterparty.toLowerCase().includes(q) ||
        e.transactionRef.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalIncome = entries
    .filter((e) => e.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = entries
    .filter((e) => e.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount || !newCounterparty) return;

    const newRef = `${newType === 'INCOME' ? 'REC' : 'EXP'}-2026-${Math.floor(100 + Math.random() * 900)}`;
    const created: LedgerEntry = {
      id: `led-${Date.now()}`,
      transactionRef: newRef,
      date: new Date().toISOString().split('T')[0],
      description: newDesc,
      category: newCategory,
      type: newType,
      amount: parseFloat(newAmount),
      counterparty: newCounterparty,
      status: 'CLEARED',
    };

    const updated = [created, ...entries];
    setEntries(updated);
    if (onUpdateLedger) onUpdateLedger(updated);
    setNewDesc('');
    setNewAmount('');
    setNewCounterparty('');
    setShowAddModal(false);
  };

  const handleOpenEdit = (entry: LedgerEntry) => {
    if (!canEditLedger) return;
    setEditingEntry(entry);
    setEditDesc(entry.description);
    setEditAmount(entry.amount.toString());
    setEditCounterparty(entry.counterparty);
    setEditType(entry.type);
    setEditCategory(entry.category);
    setEditStatus(entry.status);
    setEditDate(entry.date);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !editDesc || !editAmount || !editCounterparty) return;

    const updated = entries.map((item) =>
      item.id === editingEntry.id
        ? {
            ...item,
            description: editDesc,
            amount: parseFloat(editAmount),
            counterparty: editCounterparty,
            type: editType,
            category: editCategory,
            status: editStatus,
            date: editDate,
          }
        : item
    );

    setEntries(updated);
    if (onUpdateLedger) onUpdateLedger(updated);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!canEditLedger) return;
    if (confirm('Are you sure you want to permanently remove this transaction from the ledger?')) {
      const updated = entries.filter((item) => item.id !== entryId);
      setEntries(updated);
      if (onUpdateLedger) onUpdateLedger(updated);
    }
  };

  if (currentUser && !currentUser.canViewFinances) {
    return (
      <div className="p-6 lg:p-12 max-w-4xl mx-auto space-y-6">
        <div className="p-8 bg-bone-card dark:bg-obsidian-card border-2 border-vermillion space-y-4">
          <div className="flex items-center gap-3 text-vermillion">
            <Lock size={28} />
            <h2 className="text-2xl font-serif font-black uppercase tracking-tight">
              Access Restricted // Dual General Ledger
            </h2>
          </div>
          <p className="text-xs font-mono text-bone-muted dark:text-obsidian-muted leading-relaxed">
            Financial ledger entries, cashflow vaults, and retainer balances are hidden for account <code className="text-carbon dark:text-white font-bold">@{currentUser.username}</code> ({currentUser.fullName}) as per selective studio access policies.
          </p>
          {onOpenLoginModal && (
            <div className="pt-4">
              <button
                onClick={onOpenLoginModal}
                className="px-5 py-2.5 bg-vermillion text-white text-xs font-mono uppercase tracking-widest font-bold hover:bg-black transition-all flex items-center gap-2"
              >
                <KeyRound size={14} />
                <span>Authenticate as Director</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-bone-border dark:border-obsidian-border">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-bone-muted dark:text-obsidian-muted mb-1">
            <span>Treasury & Audit</span>
            <span>//</span>
            <span className="text-vermillion font-bold">Dual Entry General Ledger</span>
            <span className="hidden xs:inline">//</span>
            <span className="hidden xs:inline">{canEditLedger ? 'EDIT ACCESS' : 'READ-ONLY'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-black tracking-tight text-carbon dark:text-white uppercase">
            Studio Ledger
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {canEditLedger && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-mono uppercase tracking-widest bg-carbon text-bone dark:bg-white dark:text-carbon hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center gap-1.5 sm:gap-2 font-bold"
            >
              <Plus size={14} />
              <span>Record Transaction</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border">
          <span className="text-[10px] font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted block">
            Total Receivables Cleared
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-green-600 dark:text-green-400 mt-1 block">
            +{formatCurrency(totalIncome)}
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border">
          <span className="text-[10px] font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted block">
            Total Production & Gear Expenses
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-carbon dark:text-white mt-1 block">
            -{formatCurrency(totalExpense)}
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white">
          <span className="text-[10px] font-mono uppercase tracking-widest text-vermillion font-bold block">
            Net Studio Operating Margin
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-carbon dark:text-white mt-1 block">
            {formatCurrency(netBalance)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border text-xs font-mono">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Search size={14} className="text-bone-muted dark:text-obsidian-muted" />
          <input
            type="text"
            placeholder="Search reference, client, or gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-carbon dark:text-white placeholder:text-bone-muted dark:placeholder:text-obsidian-muted outline-none w-full md:w-64"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Type Filter */}
          <div className="flex items-center border border-bone-border dark:border-obsidian-border text-[10px]">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 uppercase ${typeFilter === 'ALL' ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold' : 'text-bone-muted dark:text-obsidian-muted'}`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('INCOME')}
              className={`px-2.5 py-1 uppercase border-l border-bone-border dark:border-obsidian-border ${typeFilter === 'INCOME' ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold' : 'text-bone-muted dark:text-obsidian-muted'}`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter('EXPENSE')}
              className={`px-2.5 py-1 uppercase border-l border-bone-border dark:border-obsidian-border ${typeFilter === 'EXPENSE' ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold' : 'text-bone-muted dark:text-obsidian-muted'}`}
            >
              Expenses
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="border border-bone-border dark:border-obsidian-border bg-bone-card dark:bg-obsidian-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-bone-border dark:border-obsidian-border bg-bone-surface/70 dark:bg-obsidian-surface/80 text-[10px] font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description & Counterparty</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount (INR / ₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                {canEditLedger && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-border dark:divide-obsidian-border text-xs font-mono">
              {filteredEntries.map((entry) => {
                const isIncome = entry.type === 'INCOME';
                return (
                  <tr key={entry.id} className="hover:bg-bone-surface/40 dark:hover:bg-obsidian-surface/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-carbon dark:text-white whitespace-nowrap">
                      {entry.transactionRef}
                    </td>
                    <td className="py-3.5 px-4 text-bone-muted dark:text-obsidian-muted whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-carbon dark:text-white">
                        {entry.description}
                      </div>
                      <div className="text-[10px] text-bone-muted dark:text-obsidian-muted mt-0.5">
                        {entry.counterparty}
                        {entry.relatedShootCode && ` // ${entry.relatedShootCode}`}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[10px] text-bone-muted dark:text-obsidian-muted whitespace-nowrap">
                      {entry.category.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-carbon dark:text-white'}`}>
                        {isIncome ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} className="text-vermillion" />}
                        {isIncome ? '+' : '-'}{formatCurrency(entry.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`text-[9px] px-2 py-0.5 uppercase tracking-widest font-mono font-bold border ${
                        entry.status === 'CLEARED'
                          ? 'border-green-600/30 text-green-700 dark:text-green-400 bg-green-500/10'
                          : 'border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    {canEditLedger && (
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(entry)}
                            className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white transition-colors"
                            title="Edit transaction record"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="p-1 text-bone-muted hover:text-vermillion transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Transaction Modal */}
      {showAddModal && canEditLedger && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-4 sm:p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-bone-border dark:border-obsidian-border mb-4">
              <h2 className="font-serif text-xl font-bold uppercase text-carbon dark:text-white">
                Record Ledger Entry
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-bone-muted hover:text-carbon dark:hover:text-white text-xs font-mono"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('INCOME')}
                    className={`py-2 text-center uppercase border ${newType === 'INCOME' ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold' : 'border-bone-border dark:border-obsidian-border text-bone-muted'}`}
                  >
                    Client Receivable (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('EXPENSE')}
                    className={`py-2 text-center uppercase border ${newType === 'EXPENSE' ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold' : 'border-bone-border dark:border-obsidian-border text-bone-muted'}`}
                  >
                    Production Cost (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phase One Digital Back Rental"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Counterparty (Client / Vendor)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kudla Cine Gear Hire"
                  value={newCounterparty}
                  onChange={(e) => setNewCounterparty(e.target.value)}
                  className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                    Amount (INR / ₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="35000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as LedgerCategory)}
                    className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                  >
                    <option value="CLIENT_RECEIVABLE">Client Receivable</option>
                    <option value="GEAR_RENTAL">Gear Rental</option>
                    <option value="TALENT_PAYOUT">Talent Payout</option>
                    <option value="LOCATION_PERMIT">Location Permit</option>
                    <option value="STUDIO_OVERHEAD">Studio Overhead</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 uppercase tracking-widest bg-carbon text-bone dark:bg-white dark:text-carbon font-bold hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-colors"
                >
                  Commit Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 uppercase tracking-widest border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingEntry && canEditLedger && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-4 sm:p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-bone-border dark:border-obsidian-border mb-4">
              <div>
                <span className="text-[10px] font-mono text-vermillion uppercase font-bold block">
                  Modify Transaction Record
                </span>
                <h2 className="font-serif text-xl font-bold uppercase text-carbon dark:text-white">
                  {editingEntry.transactionRef}
                </h2>
              </div>
              <button
                onClick={() => setEditingEntry(null)}
                className="text-bone-muted hover:text-carbon dark:hover:text-white text-xs font-mono"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditType('INCOME')}
                    className={`py-2 text-center uppercase border ${editType === 'INCOME' ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold' : 'border-bone-border dark:border-obsidian-border text-bone-muted'}`}
                  >
                    Client Receivable (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('EXPENSE')}
                    className={`py-2 text-center uppercase border ${editType === 'EXPENSE' ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold' : 'border-bone-border dark:border-obsidian-border text-bone-muted'}`}
                  >
                    Production Cost (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Counterparty (Client / Vendor)
                </label>
                <input
                  type="text"
                  required
                  value={editCounterparty}
                  onChange={(e) => setEditCounterparty(e.target.value)}
                  className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                    Amount (INR / ₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as LedgerCategory)}
                    className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                  >
                    <option value="CLIENT_RECEIVABLE">Client Receivable</option>
                    <option value="GEAR_RENTAL">Gear Rental</option>
                    <option value="TALENT_PAYOUT">Talent Payout</option>
                    <option value="LOCATION_PERMIT">Location Permit</option>
                    <option value="STUDIO_OVERHEAD">Studio Overhead</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as LedgerStatus)}
                    className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                  >
                    <option value="CLEARED">Cleared</option>
                    <option value="PENDING">Pending</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="DISPUTED">Disputed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 uppercase tracking-widest bg-carbon text-bone dark:bg-white dark:text-carbon font-bold hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2.5 uppercase tracking-widest border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white transition-colors"
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
