'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Shield,
  KeyRound,
  Lock,
  User,
  Plus,
  Trash2,
  Edit3,
  Check,
  Palette,
  Landmark,
  FileCheck2,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  StudioSettings,
  UserAccount,
  PDFThemeColor,
  UserRole,
} from '@/types';

interface SettingsViewProps {
  settings: StudioSettings;
  onUpdateSettings: (newSettings: StudioSettings) => void;
  users: UserAccount[];
  currentUser: UserAccount;
  onUpdateUsers: (newUsers: UserAccount[]) => void;
  onOpenLoginModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  users,
  currentUser,
  onUpdateUsers,
  onOpenLoginModal,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'banking' | 'terms' | 'users'>('pdf');

  // Viewer vs Admin edit rights
  const canEdit = currentUser.canAccessSettings;

  // PDF Theme & Studio Info State
  const [studioForm, setStudioForm] = useState<StudioSettings>(settings);
  const [isSavedBanner, setIsSavedBanner] = useState(false);

  // Terms State
  const [terms, setTerms] = useState<string[]>(settings.termsAndConditions);
  const [newTermText, setNewTermText] = useState('');
  const [editingTermIndex, setEditingTermIndex] = useState<number | null>(null);
  const [editingTermText, setEditingTermText] = useState('');

  // User Management State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [userFormData, setUserFormData] = useState<{
    fullName: string;
    username: string;
    password: string;
    role: UserRole;
    canViewFinances: boolean;
    canAccessSettings: boolean;
    canEditQuotesAndOrders: boolean;
    canEditLedger: boolean;
  }>({
    fullName: '',
    username: '',
    password: '',
    role: 'SECOND_SHOOTER',
    canViewFinances: false,
    canAccessSettings: false,
    canEditQuotesAndOrders: false,
    canEditLedger: false,
  });

  const showSuccessFeedback = () => {
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  const handleSaveStudioInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    onUpdateSettings({
      ...studioForm,
      termsAndConditions: terms,
    });
    showSuccessFeedback();
  };

  const handleSelectPDFTheme = (color: PDFThemeColor) => {
    if (!canEdit) return;
    const updated = { ...studioForm, pdfThemeColor: color };
    setStudioForm(updated);
    onUpdateSettings({ ...updated, termsAndConditions: terms });
    showSuccessFeedback();
  };

  // Terms management
  const handleAddTerm = () => {
    if (!canEdit || !newTermText.trim()) return;
    const updated = [...terms, newTermText.trim()];
    setTerms(updated);
    setNewTermText('');
    onUpdateSettings({ ...studioForm, termsAndConditions: updated });
    showSuccessFeedback();
  };

  const handleDeleteTerm = (index: number) => {
    if (!canEdit) return;
    const updated = terms.filter((_, i) => i !== index);
    setTerms(updated);
    onUpdateSettings({ ...studioForm, termsAndConditions: updated });
    showSuccessFeedback();
  };

  const handleStartEditTerm = (index: number) => {
    if (!canEdit) return;
    setEditingTermIndex(index);
    setEditingTermText(terms[index]);
  };

  const handleSaveEditTerm = () => {
    if (!canEdit || editingTermIndex === null || !editingTermText.trim()) return;
    const updated = [...terms];
    updated[editingTermIndex] = editingTermText.trim();
    setTerms(updated);
    setEditingTermIndex(null);
    setEditingTermText('');
    onUpdateSettings({ ...studioForm, termsAndConditions: updated });
    showSuccessFeedback();
  };

  // User management
  const handleOpenAddUser = () => {
    if (!canEdit) return;
    setEditingUser(null);
    setUserFormData({
      fullName: '',
      username: '',
      password: '',
      role: 'SECOND_SHOOTER',
      canViewFinances: false,
      canAccessSettings: false,
      canEditQuotesAndOrders: false,
      canEditLedger: false,
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: UserAccount) => {
    if (!canEdit) return;
    setEditingUser(u);
    setUserFormData({
      fullName: u.fullName,
      username: u.username,
      password: u.password,
      role: u.role,
      canViewFinances: u.canViewFinances,
      canAccessSettings: u.canAccessSettings,
      canEditQuotesAndOrders: u.canEditQuotesAndOrders,
      canEditLedger: !!u.canEditLedger,
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !userFormData.username || !userFormData.password) return;

    if (editingUser) {
      const updatedUsers = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              fullName: userFormData.fullName,
              username: userFormData.username.trim().toLowerCase(),
              password: userFormData.password,
              role: userFormData.role,
              canViewFinances: userFormData.canViewFinances,
              canAccessSettings: userFormData.canAccessSettings,
              canEditQuotesAndOrders: userFormData.canEditQuotesAndOrders,
              canEditLedger: userFormData.canEditLedger,
            }
          : u
      );
      onUpdateUsers(updatedUsers);
    } else {
      if (users.some((u) => u.username.toLowerCase() === userFormData.username.trim().toLowerCase())) {
        alert('Username already exists. Please choose a unique username.');
        return;
      }
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        fullName: userFormData.fullName || userFormData.username,
        username: userFormData.username.trim().toLowerCase(),
        password: userFormData.password,
        role: userFormData.role,
        canViewFinances: userFormData.canViewFinances,
        canAccessSettings: userFormData.canAccessSettings,
        canEditQuotesAndOrders: userFormData.canEditQuotesAndOrders,
        canEditLedger: userFormData.canEditLedger,
      };
      onUpdateUsers([...users, newUser]);
    }

    setIsUserModalOpen(false);
    showSuccessFeedback();
  };

  const handleDeleteUser = (userId: string) => {
    if (!canEdit) return;
    const target = users.find((u) => u.id === userId);
    if (target?.username === 'admin') {
      alert('The root "admin" account cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to remove user "${target?.username}"?`)) {
      onUpdateUsers(users.filter((u) => u.id !== userId));
      showSuccessFeedback();
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner Feedback */}
      {isSavedBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-4 right-8 z-50 px-3.5 py-2 bg-green-600 text-white font-mono text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-2 border border-white"
        >
          <Check size={13} />
          <span>Studio Parameters Updated</span>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-bone-border dark:border-obsidian-border">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-bone-muted dark:text-obsidian-muted mb-0.5">
            <span>Operating Matrix</span>
            <span>//</span>
            <span className="text-vermillion font-bold">Studio Configurations</span>
            <span>//</span>
            <span>{canEdit ? 'DIRECTOR ADMIN ACCESS' : 'VIEWER INSPECTION ACCESS'}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-black tracking-tight text-carbon dark:text-white uppercase">
            Studio Settings
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {!canEdit && (
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 bg-carbon/10 dark:bg-white/10 text-bone-muted dark:text-obsidian-muted font-bold">
              Read-Only Viewer
            </span>
          )}
        </div>
      </div>

      {/* Viewer Notice if Read-Only */}
      {!canEdit && (
        <div className="p-3 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border flex items-center gap-2.5 text-xs font-mono text-bone-muted dark:text-obsidian-muted">
          <Lock size={14} className="text-vermillion shrink-0" />
          <span>
            You have <strong>Viewer Access</strong> to studio parameters and banking details. Administrative credentials are required to modify settings or add user accounts.
          </span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-bone-border dark:border-obsidian-border pb-2 text-xs font-mono">
        {[
          { id: 'pdf', label: 'PDF Themes & Studio Info', icon: Palette },
          { id: 'banking', label: 'Banking & Remittance', icon: Landmark },
          { id: 'terms', label: `Terms & Conditions (${terms.length})`, icon: FileCheck2 },
          { id: 'users', label: `User Accounts & Credentials (${users.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                isActive
                  ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold border-carbon dark:border-white'
                  : 'border-transparent text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: PDF Theme Color & Studio Info */}
      {activeTab === 'pdf' && (
        <form onSubmit={handleSaveStudioInfo} className="space-y-6 text-xs font-mono">
          {/* PDF Theme Palette Selector */}
          <div className="p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold uppercase">PDF Document Theme Palette</h3>
                <p className="text-[11px] text-bone-muted dark:text-obsidian-muted">
                  Palette applied to generated Quotation and Invoice PDFs.
                </p>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 bg-vermillion text-white font-bold">
                Active: {studioForm.pdfThemeColor.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {[
                {
                  id: 'sage' as PDFThemeColor,
                  name: 'Coastal Sage',
                  bgChip: '#f8faf9',
                  accentChip: '#284638',
                  desc: 'Mangalore botanical green and forest slate.',
                },
                {
                  id: 'monochrome' as PDFThemeColor,
                  name: 'Obsidian Mono',
                  bgChip: '#fafafa',
                  accentChip: '#111111',
                  desc: 'Editorial brutalist black and bone silver.',
                },
                {
                  id: 'sand_gold' as PDFThemeColor,
                  name: 'Malpe Sand Gold',
                  bgChip: '#fbf9f4',
                  accentChip: '#7d6124',
                  desc: 'Sun-bleached coastal sands and archival sepia.',
                },
                {
                  id: 'terracotta' as PDFThemeColor,
                  name: 'Heritage Terracotta',
                  bgChip: '#fdf9f8',
                  accentChip: '#a33325',
                  desc: 'Coastal tile red and raw earth tones.',
                },
              ].map((themeOpt) => {
                const isSelected = studioForm.pdfThemeColor === themeOpt.id;
                return (
                  <div
                    key={themeOpt.id}
                    onClick={() => canEdit && handleSelectPDFTheme(themeOpt.id)}
                    className={`p-3 border transition-all space-y-2 ${
                      canEdit ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isSelected
                        ? 'border-2 border-carbon dark:border-white bg-bone-surface dark:bg-obsidian-surface'
                        : 'border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-black/20"
                          style={{ backgroundColor: themeOpt.bgChip }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/20"
                          style={{ backgroundColor: themeOpt.accentChip }}
                        />
                      </div>
                      {isSelected && <Check size={13} className="text-vermillion" />}
                    </div>
                    <div>
                      <div className="font-bold text-carbon dark:text-white uppercase text-[11px]">{themeOpt.name}</div>
                      <p className="text-[10px] text-bone-muted dark:text-obsidian-muted mt-0.5">
                        {themeOpt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Studio Brand Info */}
          <div className="p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-4">
            <h3 className="font-serif text-base font-bold uppercase">Studio Profile & Contact Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Studio Name
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={studioForm.studioName}
                  onChange={(e) => setStudioForm({ ...studioForm, studioName: e.target.value })}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={studioForm.tagline}
                  onChange={(e) => setStudioForm({ ...studioForm, tagline: e.target.value })}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Studio City / Region
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={studioForm.city}
                  onChange={(e) => setStudioForm({ ...studioForm, city: e.target.value })}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white disabled:opacity-75"
                />
              </div>

              {/* GSTIN: Optional with Checkbox */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase text-bone-muted dark:text-obsidian-muted">
                    GST Registration (Optional)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-mono">
                    <input
                      type="checkbox"
                      checked={studioForm.hasGst || false}
                      disabled={!canEdit}
                      onChange={(e) =>
                        setStudioForm({
                          ...studioForm,
                          hasGst: e.target.checked,
                          gstin: e.target.checked ? studioForm.gstin || '29AABCL1984M1Z8' : '',
                        })
                      }
                      className="w-3.5 h-3.5 accent-vermillion rounded"
                    />
                    <span className="text-carbon dark:text-white font-bold">Enable GST</span>
                  </label>
                </div>

                {studioForm.hasGst ? (
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={studioForm.gstin || ''}
                    onChange={(e) => setStudioForm({ ...studioForm, gstin: e.target.value })}
                    placeholder="e.g. 29AABCL1984M1Z8"
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white uppercase disabled:opacity-75"
                  />
                ) : (
                  <div className="p-2 bg-bone-surface dark:bg-obsidian-surface border border-dashed border-bone-border dark:border-obsidian-border text-[11px] text-bone-muted dark:text-obsidian-muted">
                    Small Enterprise / Micro-Business (GST Not Applicable)
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Lead Contact Person
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={studioForm.contactPerson}
                  onChange={(e) => setStudioForm({ ...studioForm, contactPerson: e.target.value })}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white uppercase font-bold disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Contact Phone / WhatsApp
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={studioForm.contactPhone}
                  onChange={(e) => setStudioForm({ ...studioForm, contactPhone: e.target.value })}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white disabled:opacity-75"
                />
              </div>
            </div>

            {canEdit && (
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-carbon text-bone dark:bg-white dark:text-carbon hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all font-bold"
                >
                  Save Studio Information
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Tab 2: Banking Details */}
      {activeTab === 'banking' && (
        <form onSubmit={handleSaveStudioInfo} className="space-y-6 text-xs font-mono">
          <div className="p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-4">
            <div>
              <h3 className="font-serif text-base font-bold uppercase">Banking Remittance & Settlement Details</h3>
              <p className="text-[11px] text-bone-muted dark:text-obsidian-muted">
                These banking and UPI details print on Page 2 of generated Quotations and Invoices.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Beneficiary Account Name
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={studioForm.bankingDetails.accountName}
                  onChange={(e) =>
                    setStudioForm({
                      ...studioForm,
                      bankingDetails: { ...studioForm.bankingDetails, accountName: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold disabled:opacity-75"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={studioForm.bankingDetails.bankName}
                  onChange={(e) =>
                    setStudioForm({
                      ...studioForm,
                      bankingDetails: { ...studioForm.bankingDetails, bankName: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white disabled:opacity-75"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Branch Name / City
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={studioForm.bankingDetails.branch}
                  onChange={(e) =>
                    setStudioForm({
                      ...studioForm,
                      bankingDetails: { ...studioForm.bankingDetails, branch: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white disabled:opacity-75"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={studioForm.bankingDetails.accountNumber}
                  onChange={(e) =>
                    setStudioForm({
                      ...studioForm,
                      bankingDetails: { ...studioForm.bankingDetails, accountNumber: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-mono font-bold disabled:opacity-75"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={studioForm.bankingDetails.ifscCode}
                  onChange={(e) =>
                    setStudioForm({
                      ...studioForm,
                      bankingDetails: { ...studioForm.bankingDetails, ifscCode: e.target.value.toUpperCase() },
                    })
                  }
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-mono uppercase font-bold disabled:opacity-75"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                  UPI VPA / QR Handle
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={studioForm.bankingDetails.upiId || ''}
                  onChange={(e) =>
                    setStudioForm({
                      ...studioForm,
                      bankingDetails: { ...studioForm.bankingDetails, upiId: e.target.value },
                    })
                  }
                  placeholder="e.g. lumina.studios@hdfcbank"
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white disabled:opacity-75"
                />
              </div>
            </div>

            {canEdit && (
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-carbon text-bone dark:bg-white dark:text-carbon hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all font-bold"
                >
                  Update Banking Remittance
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Tab 3: Terms & Conditions Management */}
      {activeTab === 'terms' && (
        <div className="space-y-5 text-xs font-mono">
          <div className="p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-base font-bold uppercase">Master Terms & Conditions</h3>
                <p className="text-[11px] text-bone-muted dark:text-obsidian-muted">
                  Clauses automatically embedded into all quotations and legal engagement documents.
                </p>
              </div>
              <span className="text-[11px] font-mono text-vermillion font-bold uppercase">
                {terms.length} Active Clauses
              </span>
            </div>

            {/* Add New Term Clause Input (Admin only) */}
            {canEdit && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTermText}
                  onChange={(e) => setNewTermText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTerm()}
                  placeholder="Type new contractual clause..."
                  className="flex-1 p-2 text-xs font-mono bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white focus:outline-none focus:border-carbon dark:focus:border-white"
                />
                <button
                  onClick={handleAddTerm}
                  disabled={!newTermText.trim()}
                  className="px-3 py-2 bg-carbon text-bone dark:bg-white dark:text-carbon font-mono text-xs uppercase tracking-wider hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all disabled:opacity-40 flex items-center gap-1 shrink-0"
                >
                  <Plus size={13} />
                  <span>Add Clause</span>
                </button>
              </div>
            )}

            {/* Terms List */}
            <div className="space-y-1.5 pt-1">
              {terms.map((term, index) => {
                const isEditing = editingTermIndex === index;
                return (
                  <div
                    key={index}
                    className="p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border flex items-start gap-2.5 group"
                  >
                    <span className="text-[10px] text-bone-muted dark:text-obsidian-muted font-bold pt-0.5 w-5 shrink-0">
                      {index + 1}.
                    </span>

                    {isEditing && canEdit ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editingTermText}
                          onChange={(e) => setEditingTermText(e.target.value)}
                          className="flex-1 p-1 bg-bone-card dark:bg-obsidian-card border border-carbon dark:border-white text-carbon dark:text-white text-xs font-mono focus:outline-none"
                        />
                        <button
                          onClick={handleSaveEditTerm}
                          className="px-2.5 py-1 bg-green-600 text-white text-[10px] uppercase font-bold flex items-center gap-1"
                        >
                          <Check size={11} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setEditingTermIndex(null)}
                          className="px-2 py-1 text-bone-muted hover:text-carbon dark:hover:text-white text-[10px] uppercase"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="flex-1 text-carbon dark:text-white leading-relaxed text-[11px]">{term}</p>
                        {canEdit && (
                          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => handleStartEditTerm(index)}
                              className="p-1 hover:text-vermillion transition-colors"
                              title="Edit clause"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteTerm(index)}
                              className="p-1 text-bone-muted hover:text-vermillion transition-colors"
                              title="Delete clause"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: User Accounts & Granular Access Control */}
      {activeTab === 'users' && (
        <div className="space-y-5 text-xs font-mono">
          <div className="p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-base font-bold uppercase">Credential Management & Access Control</h3>
                <p className="text-[11px] text-bone-muted dark:text-obsidian-muted">
                  {canEdit
                    ? 'Administer staff accounts and assign selective access to finances, settings, and orders.'
                    : 'Inspection of active studio roster. Administrative credentials required to add or modify accounts.'}
                </p>
              </div>

              {canEdit && (
                <button
                  onClick={handleOpenAddUser}
                  className="px-3.5 py-1.5 bg-carbon text-bone dark:bg-white dark:text-carbon font-mono text-xs uppercase tracking-wider hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center gap-1.5 shrink-0 font-bold"
                >
                  <Plus size={13} />
                  <span>Add User Account</span>
                </button>
              )}
            </div>

            {/* User Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {users.map((u) => {
                const isRoot = u.username === 'admin';
                const isCurrent = currentUser.id === u.id;
                return (
                  <div
                    key={u.id}
                    className={`p-4 bg-bone-surface dark:bg-obsidian-surface border ${
                      isCurrent
                        ? 'border-2 border-vermillion'
                        : 'border-bone-border dark:border-obsidian-border'
                    } flex flex-col justify-between space-y-3 relative`}
                  >
                    {isCurrent && (
                      <span className="absolute top-2 right-2 text-[8px] font-mono uppercase bg-vermillion text-white px-1.5 py-0.2 font-bold">
                        Logged In
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User size={13} className="text-vermillion" />
                        <span className="font-bold text-xs text-carbon dark:text-white truncate">
                          {u.fullName}
                        </span>
                      </div>
                      <div className="text-bone-muted dark:text-obsidian-muted text-[10px]">
                        Username: <code className="text-carbon dark:text-white font-bold">@{u.username}</code>
                      </div>
                      <div className="text-bone-muted dark:text-obsidian-muted text-[10px]">
                        Password:{' '}
                        <code className="text-carbon dark:text-white font-mono">
                          {canEdit ? u.password : '••••••••••••'}
                        </code>
                      </div>
                    </div>

                    {/* Permissions Matrix Pills */}
                    <div className="space-y-1 pt-2 border-t border-bone-border dark:border-obsidian-border text-[9px]">
                      <div className="flex items-center justify-between">
                        <span className="text-bone-muted">Financial Ledger:</span>
                        <span className={u.canViewFinances ? 'text-green-600 dark:text-green-400 font-bold' : 'text-vermillion'}>
                          {u.canViewFinances ? 'FULL' : 'HIDDEN'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-bone-muted">Studio Settings:</span>
                        <span className={u.canAccessSettings ? 'text-green-600 dark:text-green-400 font-bold' : 'text-vermillion'}>
                          {u.canAccessSettings ? 'EDIT' : 'VIEW ONLY'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-bone-muted">Quotes & Orders:</span>
                        <span className={u.canEditQuotesAndOrders ? 'text-green-600 dark:text-green-400 font-bold' : 'text-vermillion'}>
                          {u.canEditQuotesAndOrders ? 'EDIT' : 'VIEW ONLY'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-bone-muted">Edit Ledger Entries:</span>
                        <span className={u.canEditLedger || u.role === 'ADMIN_DIRECTOR' ? 'text-green-600 dark:text-green-400 font-bold' : 'text-vermillion'}>
                          {u.canEditLedger || u.role === 'ADMIN_DIRECTOR' ? 'ALLOWED' : 'LOCKED'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons (Admin only) */}
                    {canEdit && (
                      <div className="pt-2 border-t border-bone-border dark:border-obsidian-border flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="px-2 py-0.5 text-[10px] border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white transition-all flex items-center gap-1"
                        >
                          <Edit3 size={10} />
                          <span>Edit</span>
                        </button>

                        {!isRoot && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="px-2 py-0.5 text-[10px] text-vermillion hover:bg-vermillion/10 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal (Admin only) */}
      {isUserModalOpen && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/80 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white shadow-2xl p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-vermillion font-bold mb-1">
                <ShieldCheck size={12} />
                <span>Credential & Permissions Authority</span>
              </div>
              <h2 className="text-xl font-serif font-black uppercase tracking-tight text-carbon dark:text-white">
                {editingUser ? `Edit Account: @${editingUser.username}` : 'Register New Studio User'}
              </h2>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Full Name / Title
                </label>
                <input
                  type="text"
                  value={userFormData.fullName}
                  onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                  placeholder="e.g. Joyline Sequeira (Second Shooter)"
                  required
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    placeholder="e.g. joyline"
                    required
                    disabled={editingUser?.username === 'admin'}
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white disabled:opacity-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-bone-muted mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder="Enter password"
                    required
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Primary Role
                </label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white uppercase font-bold"
                >
                  <option value="ADMIN_DIRECTOR">Admin Studio Director</option>
                  <option value="SECOND_SHOOTER">Second Unit / Crew</option>
                  <option value="PRODUCER">Production Producer</option>
                </select>
              </div>

              {/* Selective Access Control Toggles */}
              <div className="p-3 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border space-y-2.5">
                <span className="text-[10px] uppercase tracking-wider text-vermillion font-bold block">
                  Selective Permission Matrix
                </span>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={userFormData.canViewFinances}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, canViewFinances: e.target.checked })
                    }
                    className="w-3.5 h-3.5 accent-vermillion rounded"
                  />
                  <div>
                    <span className="font-bold text-carbon dark:text-white block text-[11px]">
                      Financial Visibility (Ledger & Revenue)
                    </span>
                    <span className="text-[9px] text-bone-muted block">
                      If unchecked, financial totals, margins, and the General Ledger are hidden.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={userFormData.canAccessSettings}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, canAccessSettings: e.target.checked })
                    }
                    className="w-3.5 h-3.5 accent-vermillion rounded"
                  />
                  <div>
                    <span className="font-bold text-carbon dark:text-white block text-[11px]">
                      Edit Studio Settings & Manage Users
                    </span>
                    <span className="text-[9px] text-bone-muted block">
                      If unchecked, user has read-only view of settings and cannot manage accounts.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={userFormData.canEditQuotesAndOrders}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, canEditQuotesAndOrders: e.target.checked })
                    }
                    className="w-3.5 h-3.5 accent-vermillion rounded"
                  />
                  <div>
                    <span className="font-bold text-carbon dark:text-white block text-[11px]">
                      Edit Quotations & Orders
                    </span>
                    <span className="text-[9px] text-bone-muted block">
                      If unchecked, quotations and orders can only be viewed in read-only mode.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={userFormData.canEditLedger}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, canEditLedger: e.target.checked })
                    }
                    className="w-3.5 h-3.5 accent-vermillion rounded"
                  />
                  <div>
                    <span className="font-bold text-carbon dark:text-white block text-[11px]">
                      Edit & Record Ledger Transactions
                    </span>
                    <span className="text-[9px] text-bone-muted block">
                      Allows staff to modify, create, and delete entries in the Dual General Ledger.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-3.5 py-1.5 border border-bone-border dark:border-obsidian-border text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold text-xs uppercase hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
