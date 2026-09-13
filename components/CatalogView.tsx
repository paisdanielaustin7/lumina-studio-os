'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  Users,
  CheckCircle2,
  Package,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Phone,
  User,
  Sparkles,
  Layers,
  DollarSign,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import {
  StudioSettings,
  UserAccount,
  CrewTemplateItem,
  QuotationItem,
  DeliverableItem,
} from '@/types';
import { defaultCatalog, defaultCrewRoster } from '@/lib/catalogDefaults';

interface CatalogViewProps {
  settings: StudioSettings;
  onUpdateSettings: (newSettings: StudioSettings) => void;
  currentUser: UserAccount;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  settings,
  onUpdateSettings,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'crew' | 'requirements' | 'deliverables'>('crew');
  const canEdit = currentUser.canAccessSettings || currentUser.canEditQuotesAndOrders;

  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const showSavedNotice = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3000);
  };

  // -------------------------------------------------------------
  // 1. CREW ROSTER STATE & ACTIONS
  // -------------------------------------------------------------
  const crewRoster: CrewTemplateItem[] = settings.crewRoster || defaultCrewRoster;
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [editingCrewId, setEditingCrewId] = useState<string | null>(null);
  const [crewRole, setCrewRole] = useState('');
  const [crewCount, setCrewCount] = useState(1);
  const [crewName, setCrewName] = useState('');
  const [crewPhone, setCrewPhone] = useState('');

  const handleOpenAddCrew = () => {
    setEditingCrewId(null);
    setCrewRole('');
    setCrewCount(1);
    setCrewName('');
    setCrewPhone('');
    setIsCrewModalOpen(true);
  };

  const handleOpenEditCrew = (item: CrewTemplateItem) => {
    setEditingCrewId(item.id);
    setCrewRole(item.role);
    setCrewCount(item.defaultCount);
    setCrewName(item.defaultName || '');
    setCrewPhone(item.phone || '');
    setIsCrewModalOpen(true);
  };

  const handleSaveCrew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !crewRole.trim()) return;

    let updatedList: CrewTemplateItem[];
    if (editingCrewId) {
      updatedList = crewRoster.map((c) =>
        c.id === editingCrewId
          ? {
              ...c,
              role: crewRole.trim(),
              defaultCount: Math.max(1, crewCount),
              defaultName: crewName.trim() || undefined,
              phone: crewPhone.trim() || undefined,
            }
          : c
      );
    } else {
      const newItem: CrewTemplateItem = {
        id: `crw-${Date.now()}`,
        role: crewRole.trim(),
        defaultCount: Math.max(1, crewCount),
        defaultName: crewName.trim() || undefined,
        phone: crewPhone.trim() || undefined,
      };
      updatedList = [...crewRoster, newItem];
    }

    onUpdateSettings({
      ...settings,
      crewRoster: updatedList,
    });
    setIsCrewModalOpen(false);
    showSavedNotice(editingCrewId ? 'Crew role updated' : 'New crew role added to studio roster');
  };

  const handleDeleteCrew = (id: string) => {
    if (!canEdit) return;
    const updated = crewRoster.filter((c) => c.id !== id);
    onUpdateSettings({
      ...settings,
      crewRoster: updated,
    });
    showSavedNotice('Crew role removed from roster');
  };

  // -------------------------------------------------------------
  // 2. REQUIREMENTS CATALOG STATE & ACTIONS
  // -------------------------------------------------------------
  const requirementsList: QuotationItem[] =
    settings.packageRequirements && settings.packageRequirements.length > 0
      ? settings.packageRequirements
      : defaultCatalog.standardRequirements;

  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [reqName, setReqName] = useState('');
  const [reqPrice, setReqPrice] = useState('-');
  const [reqIncluded, setReqIncluded] = useState(true);

  const handleOpenAddReq = () => {
    setEditingReqId(null);
    setReqName('');
    setReqPrice('-');
    setReqIncluded(true);
    setIsReqModalOpen(true);
  };

  const handleOpenEditReq = (item: QuotationItem) => {
    setEditingReqId(item.id);
    setReqName(item.name);
    setReqPrice(String(item.price || '-'));
    setReqIncluded(item.included);
    setIsReqModalOpen(true);
  };

  const handleSaveReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !reqName.trim()) return;

    let updatedReqs: QuotationItem[];
    if (editingReqId) {
      updatedReqs = requirementsList.map((r) =>
        r.id === editingReqId
          ? {
              ...r,
              name: reqName.trim(),
              price: reqPrice.trim() || '-',
              included: reqIncluded,
            }
          : r
      );
    } else {
      const newReq: QuotationItem = {
        id: `req-${Date.now()}`,
        name: reqName.trim(),
        price: reqPrice.trim() || '-',
        included: reqIncluded,
      };
      updatedReqs = [...requirementsList, newReq];
    }

    onUpdateSettings({
      ...settings,
      packageRequirements: updatedReqs,
    });
    setIsReqModalOpen(false);
    showSavedNotice(editingReqId ? 'Requirement updated' : 'New requirement added to catalog');
  };

  const handleDeleteReq = (id: string) => {
    if (!canEdit) return;
    const updated = requirementsList.filter((r) => r.id !== id);
    onUpdateSettings({
      ...settings,
      packageRequirements: updated,
    });
    showSavedNotice('Requirement removed from catalog');
  };

  // -------------------------------------------------------------
  // 3. DELIVERABLES CATALOG STATE & ACTIONS
  // -------------------------------------------------------------
  const deliverablesList: DeliverableItem[] =
    settings.packageDeliverables && settings.packageDeliverables.length > 0
      ? settings.packageDeliverables
      : defaultCatalog.standardDeliverables;

  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [editingDelId, setEditingDelId] = useState<string | null>(null);
  const [delItem, setDelItem] = useState('');
  const [delDetails, setDelDetails] = useState('');
  const [delIncluded, setDelIncluded] = useState(true);

  const handleOpenAddDel = () => {
    setEditingDelId(null);
    setDelItem('');
    setDelDetails('');
    setDelIncluded(true);
    setIsDelModalOpen(true);
  };

  const handleOpenEditDel = (del: DeliverableItem) => {
    setEditingDelId(del.id);
    setDelItem(del.item);
    setDelDetails(del.details);
    setDelIncluded(del.included);
    setIsDelModalOpen(true);
  };

  const handleSaveDel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !delItem.trim()) return;

    let updatedDels: DeliverableItem[];
    if (editingDelId) {
      updatedDels = deliverablesList.map((d) =>
        d.id === editingDelId
          ? {
              ...d,
              item: delItem.trim(),
              details: delDetails.trim() || '*standard delivery specification',
              included: delIncluded,
            }
          : d
      );
    } else {
      const newDel: DeliverableItem = {
        id: `del-${Date.now()}`,
        item: delItem.trim(),
        details: delDetails.trim() || '*standard delivery specification',
        included: delIncluded,
      };
      updatedDels = [...deliverablesList, newDel];
    }

    onUpdateSettings({
      ...settings,
      packageDeliverables: updatedDels,
    });
    setIsDelModalOpen(false);
    showSavedNotice(editingDelId ? 'Deliverable updated' : 'New deliverable added to catalog');
  };

  const handleDeleteDel = (id: string) => {
    if (!canEdit) return;
    const updated = deliverablesList.filter((d) => d.id !== id);
    onUpdateSettings({
      ...settings,
      packageDeliverables: updated,
    });
    showSavedNotice('Deliverable removed from catalog');
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      {/* Toast Notice */}
      <AnimatePresence>
        {savedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-8 z-50 px-4 py-2 bg-green-600 text-white font-mono text-[11px] uppercase tracking-wider shadow-xl flex items-center gap-2 border border-white"
          >
            <Check size={13} />
            <span>{savedBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-bone-border dark:border-obsidian-border">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-bone-muted dark:text-obsidian-muted mb-1">
            <span>Production Matrix</span>
            <span>//</span>
            <span className="text-vermillion font-bold">Catalog & Crew Roster</span>
            <span>//</span>
            <span>{canEdit ? 'DIRECTOR ADMIN' : 'READ-ONLY'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-black tracking-tight text-carbon dark:text-white uppercase">
            Catalog & Crew
          </h1>
        </div>

        <p className="text-xs font-mono text-bone-muted dark:text-obsidian-muted max-w-md">
          Standard requirements, deliverables, and production crew templates automatically populate all upcoming quotations and call sheets.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-bone-border dark:border-obsidian-border pb-2 text-xs font-mono overflow-x-auto">
        {[
          { id: 'crew', label: `Crew Roster (${crewRoster.length})`, icon: Users },
          { id: 'requirements', label: `Requirements (${requirementsList.length})`, icon: Sparkles },
          { id: 'deliverables', label: `Deliverables (${deliverablesList.length})`, icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 uppercase tracking-wider flex items-center gap-1.5 border transition-all shrink-0 ${
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

      {/* ===================================================================== */}
      {/* TAB 1: CREW ROSTER                                                    */}
      {/* ===================================================================== */}
      {activeTab === 'crew' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold uppercase text-carbon dark:text-white">
                Studio Crew Allocation Roster
              </h2>
              <p className="text-xs font-mono text-bone-muted dark:text-obsidian-muted">
                Assign standard team roles, default operator headcounts, and verified personnel contacts.
              </p>
            </div>

            {canEdit && (
              <button
                onClick={handleOpenAddCrew}
                className="px-4 py-2 bg-carbon text-bone dark:bg-white dark:text-carbon font-mono text-xs uppercase tracking-wider hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center gap-1.5 shrink-0 font-bold"
              >
                <Plus size={13} />
                <span>Add Crew Role</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {crewRoster.map((crew) => (
              <div
                key={crew.id}
                className="p-4 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border flex flex-col justify-between space-y-3 relative group hover:border-carbon dark:hover:border-white transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif font-bold text-sm text-carbon dark:text-white leading-tight">
                      {crew.role}
                    </h3>
                    <span className="text-[9.5px] font-mono uppercase px-2 py-0.5 bg-carbon/10 dark:bg-white/10 text-bone-muted dark:text-obsidian-muted font-bold whitespace-nowrap">
                      {crew.defaultCount} {crew.defaultCount === 1 ? 'Operator' : 'Operators'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono text-bone-muted dark:text-obsidian-muted">
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-vermillion shrink-0" />
                      <span className="text-carbon dark:text-white font-bold truncate">
                        {crew.defaultName || 'Unassigned / Open Unit'}
                      </span>
                    </div>

                    {crew.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="shrink-0" />
                        <a
                          href={`https://wa.me/${crew.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-vermillion hover:underline"
                        >
                          {crew.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {canEdit && (
                  <div className="pt-2 border-t border-bone-border/60 dark:border-obsidian-border/60 flex items-center justify-between text-[11px] font-mono uppercase">
                    <button
                      onClick={() => handleOpenEditCrew(crew)}
                      className="text-bone-muted hover:text-carbon dark:hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCrew(crew.id)}
                      className="text-bone-muted hover:text-vermillion flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: REQUIREMENTS CATALOG                                           */}
      {/* ===================================================================== */}
      {activeTab === 'requirements' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold uppercase text-carbon dark:text-white">
                Standard Requirement Items
              </h2>
              <p className="text-xs font-mono text-bone-muted dark:text-obsidian-muted">
                Core services (Photography, 4K Cinema, Aerial Drone, Traditional Stills) selectable during quote creation.
              </p>
            </div>

            {canEdit && (
              <button
                onClick={handleOpenAddReq}
                className="px-4 py-2 bg-carbon text-bone dark:bg-white dark:text-carbon font-mono text-xs uppercase tracking-wider hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center gap-1.5 shrink-0 font-bold"
              >
                <Plus size={13} />
                <span>Add Requirement</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {requirementsList.map((req, index) => (
              <div
                key={req.id}
                className="p-3.5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-bone-muted dark:text-obsidian-muted font-bold w-6">
                    {(index + 1).toString().padStart(2, '0')}.
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-carbon dark:text-white">{req.name}</h4>
                    <span className="text-[10px] text-bone-muted uppercase">
                      Default: {req.included ? 'Included in Base Package' : 'Optional Add-on'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="px-2.5 py-1 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border font-bold text-xs">
                    {req.price}
                  </span>

                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditReq(req)}
                        className="p-1 text-bone-muted hover:text-carbon dark:hover:text-white transition-colors"
                        title="Edit Requirement"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteReq(req.id)}
                        className="p-1 text-bone-muted hover:text-vermillion transition-colors"
                        title="Delete Requirement"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: DELIVERABLES CATALOG                                           */}
      {/* ===================================================================== */}
      {activeTab === 'deliverables' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold uppercase text-carbon dark:text-white">
                Standard Deliverable Specifications
              </h2>
              <p className="text-xs font-mono text-bone-muted dark:text-obsidian-muted">
                Tangible album specifications, teaser film lengths, and high-resolution photo counts promised to clients.
              </p>
            </div>

            {canEdit && (
              <button
                onClick={handleOpenAddDel}
                className="px-4 py-2 bg-carbon text-bone dark:bg-white dark:text-carbon font-mono text-xs uppercase tracking-wider hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center gap-1.5 shrink-0 font-bold"
              >
                <Plus size={13} />
                <span>Add Deliverable</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {deliverablesList.map((del, index) => (
              <div
                key={del.id}
                className="p-3.5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="text-bone-muted dark:text-obsidian-muted font-bold w-6 pt-0.5 sm:pt-0">
                    {(index + 1).toString().padStart(2, '0')}.
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-carbon dark:text-white">{del.item}</h4>
                    <p className="text-[11px] text-bone-muted italic">{del.details}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span
                    className={`text-[9px] uppercase px-2 py-0.5 font-bold border ${
                      del.included
                        ? 'border-green-600/40 text-green-600 dark:text-green-400 bg-green-600/10'
                        : 'border-bone-border dark:border-obsidian-border text-bone-muted'
                    }`}
                  >
                    {del.included ? 'Default Included' : 'Optional'}
                  </span>

                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditDel(del)}
                        className="p-1 text-bone-muted hover:text-carbon dark:hover:text-white transition-colors"
                        title="Edit Deliverable"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteDel(del.id)}
                        className="p-1 text-bone-muted hover:text-vermillion transition-colors"
                        title="Delete Deliverable"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: ADD / EDIT CREW                                              */}
      {/* ===================================================================== */}
      {isCrewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-bone-border dark:border-obsidian-border">
              <h3 className="font-serif text-lg font-bold uppercase text-carbon dark:text-white">
                {editingCrewId ? 'Edit Crew Role' : 'Add Production Crew Role'}
              </h3>
              <button
                onClick={() => setIsCrewModalOpen(false)}
                className="text-xs font-mono text-bone-muted hover:text-carbon dark:hover:text-white"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleSaveCrew} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Role Title / Description *
                </label>
                <input
                  type="text"
                  value={crewRole}
                  onChange={(e) => setCrewRole(e.target.value)}
                  placeholder="e.g. Lead Candid Photographer or Drone Pilot"
                  required
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-bone-muted mb-1">
                    Default Headcount *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={crewCount}
                    onChange={(e) => setCrewCount(parseInt(e.target.value) || 1)}
                    required
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-bone-muted mb-1">
                    Assigned Person Name
                  </label>
                  <input
                    type="text"
                    value={crewName}
                    onChange={(e) => setCrewName(e.target.value)}
                    placeholder="e.g. Dan Aurel"
                    className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Contact Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={crewPhone}
                  onChange={(e) => setCrewPhone(e.target.value)}
                  placeholder="e.g. +91 93800 57445"
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-bone-border dark:border-obsidian-border">
                <button
                  type="button"
                  onClick={() => setIsCrewModalOpen(false)}
                  className="px-3.5 py-1.5 border border-bone-border dark:border-obsidian-border text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold text-xs uppercase hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all"
                >
                  {editingCrewId ? 'Update Role' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: ADD / EDIT REQUIREMENT                                       */}
      {/* ===================================================================== */}
      {isReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-bone-border dark:border-obsidian-border">
              <h3 className="font-serif text-lg font-bold uppercase text-carbon dark:text-white">
                {editingReqId ? 'Edit Requirement Item' : 'Add Requirement Item'}
              </h3>
              <button
                onClick={() => setIsReqModalOpen(false)}
                className="text-xs font-mono text-bone-muted hover:text-carbon dark:hover:text-white"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleSaveReq} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Service / Item Name *
                </label>
                <input
                  type="text"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  placeholder="e.g. Drone Aerial Cinema Coverage"
                  required
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Default Display Price (or '-' if bundled in package)
                </label>
                <input
                  type="text"
                  value={reqPrice}
                  onChange={(e) => setReqPrice(e.target.value)}
                  placeholder="e.g. - or Rs 6,000 /-"
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={reqIncluded}
                  onChange={(e) => setReqIncluded(e.target.checked)}
                  className="accent-vermillion"
                />
                <span className="font-bold text-carbon dark:text-white text-[11px]">
                  Included by default in new quotations
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-bone-border dark:border-obsidian-border">
                <button
                  type="button"
                  onClick={() => setIsReqModalOpen(false)}
                  className="px-3.5 py-1.5 border border-bone-border dark:border-obsidian-border text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold text-xs uppercase hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all"
                >
                  {editingReqId ? 'Save Changes' : 'Add Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: ADD / EDIT DELIVERABLE                                       */}
      {/* ===================================================================== */}
      {isDelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-bone-border dark:border-obsidian-border">
              <h3 className="font-serif text-lg font-bold uppercase text-carbon dark:text-white">
                {editingDelId ? 'Edit Deliverable Item' : 'Add Deliverable Item'}
              </h3>
              <button
                onClick={() => setIsDelModalOpen(false)}
                className="text-xs font-mono text-bone-muted hover:text-carbon dark:hover:text-white"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleSaveDel} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Deliverable Title *
                </label>
                <input
                  type="text"
                  value={delItem}
                  onChange={(e) => setDelItem(e.target.value)}
                  placeholder="e.g. Cinematic 4K Highlight Reel"
                  required
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-bone-muted mb-1">
                  Specification / Details Description
                </label>
                <input
                  type="text"
                  value={delDetails}
                  onChange={(e) => setDelDetails(e.target.value)}
                  placeholder="e.g. *duration 3-5 minutes with 4K HDR color grade"
                  className="w-full p-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={delIncluded}
                  onChange={(e) => setDelIncluded(e.target.checked)}
                  className="accent-vermillion"
                />
                <span className="font-bold text-carbon dark:text-white text-[11px]">
                  Included by default in new quotations
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-bone-border dark:border-obsidian-border">
                <button
                  type="button"
                  onClick={() => setIsDelModalOpen(false)}
                  className="px-3.5 py-1.5 border border-bone-border dark:border-obsidian-border text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold text-xs uppercase hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all"
                >
                  {editingDelId ? 'Save Changes' : 'Add Deliverable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
