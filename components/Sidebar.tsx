'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Scale,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sun,
  Moon,
  Sparkles,
  Camera,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { ViewModule, UserRole, UserAccount } from '@/types';
import { useTheme } from './ThemeContext';

interface SidebarProps {
  activeModule: ViewModule;
  onSelectModule: (module: ViewModule) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  userRole?: UserRole;
  setUserRole?: (role: UserRole) => void;
  currentUser: UserAccount;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isCollapsed,
  setIsCollapsed,
  currentUser,
  onOpenLoginModal,
  onLogout,
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'overview' as ViewModule, label: 'Overview', icon: LayoutDashboard, badge: 'LIVE' },
    { id: 'quotations' as ViewModule, label: 'Quotations & Orders', icon: Sparkles, badge: currentUser.canEditQuotesAndOrders ? null : 'VIEW' },
    { id: 'calendar' as ViewModule, label: 'Calendar / Call Sheets', icon: CalendarDays, badge: '4 SETS' },
    { id: 'ledger' as ViewModule, label: 'Dual Ledger', icon: Scale, badge: currentUser.canViewFinances ? null : 'LOCK' },
    { id: 'billing' as ViewModule, label: 'Invoices & Retainers', icon: FileText, badge: null },
    { id: 'access' as ViewModule, label: 'Access Control', icon: ShieldCheck, badge: currentUser.role === 'ADMIN_DIRECTOR' ? 'ROOT' : 'CREW' },
    { id: 'settings' as ViewModule, label: 'Studio Settings', icon: Settings, badge: currentUser.canAccessSettings ? null : 'VIEW' },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 68 : 260 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col h-screen shrink-0 z-40 bg-bone-card dark:bg-obsidian-surface border-r border-bone-border dark:border-obsidian-border select-none"
    >
      {/* Top Header / Studio Brand Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-bone-border dark:border-obsidian-border">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
          <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-carbon dark:bg-white text-bone dark:text-obsidian font-serif font-black text-base tracking-widest transition-transform group-hover:scale-105">
            L
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col whitespace-nowrap"
              >
                <span className="font-serif tracking-[0.2em] text-xs font-bold uppercase text-carbon dark:text-white">
                  LUMINA
                </span>
                <span className="text-[9px] uppercase font-mono text-bone-muted dark:text-obsidian-muted tracking-[0.15em]">
                  Studio OS // v2.6
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center w-6 h-6 rounded border border-bone-border dark:border-obsidian-border text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white hover:border-carbon dark:hover:border-white transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Public View Quick-Launcher */}
      <div className="p-2 border-b border-bone-border dark:border-obsidian-border">
        <Link
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-between group p-2 rounded text-[11px] font-mono uppercase tracking-wider transition-all ${
            isCollapsed
              ? 'justify-center bg-carbon/5 dark:bg-white/5 hover:bg-vermillion hover:text-white'
              : 'bg-carbon text-bone dark:bg-white dark:text-carbon hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white hover:text-white'
          }`}
          title="Open Public Editorial Portfolio & Studio Deck"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Camera size={13} className="shrink-0" />
            {!isCollapsed && (
              <span className="truncate font-semibold tracking-wider text-[10px]">
                Public Deck
              </span>
            )}
          </div>
          {!isCollapsed && (
            <ExternalLink size={10} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
          )}
        </Link>
      </div>

      {/* Navigation Modules (Slightly reduced size & cleaner UI) */}
      <nav className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-2.5 py-1">
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-bone-muted dark:text-obsidian-muted">
              Modules
            </p>
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all relative group ${
                isActive
                  ? 'bg-carbon text-bone dark:bg-obsidian-card dark:text-white font-bold'
                  : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white hover:bg-bone-surface dark:hover:bg-obsidian-card/60'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-vermillion"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                size={14}
                className={`shrink-0 transition-colors ${
                  isActive ? 'text-vermillion' : 'group-hover:text-carbon dark:group-hover:text-white'
                }`}
              />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate text-left text-[11px]">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[8px] px-1 py-0.2 tracking-wider font-mono border ${
                        isActive
                          ? 'border-vermillion text-vermillion bg-vermillion/10'
                          : 'border-bone-border dark:border-obsidian-border text-bone-muted dark:text-obsidian-muted'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Dock: Theme Switcher & User Profile Box with Logout Icon */}
      <div className="p-2 border-t border-bone-border dark:border-obsidian-border space-y-1.5">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } p-1.5 text-[10px] font-mono uppercase tracking-wider border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white transition-all`}
          title={`Switch to ${theme === 'dark' ? 'Light (Ivory)' : 'Dark (Obsidian)'} Mode`}
          aria-label="Toggle Color Theme"
        >
          <div className="flex items-center gap-1.5">
            {theme === 'dark' ? (
              <Moon size={12} className="text-editorial-gold" />
            ) : (
              <Sun size={12} className="text-vermillion" />
            )}
            {!isCollapsed && (
              <span className="text-[10px] font-mono">
                {theme === 'dark' ? 'Obsidian' : 'Bone Ivory'}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <span className="text-[8px] px-1 py-0.2 bg-carbon/5 dark:bg-white/10 font-mono">
              Theme
            </span>
          )}
        </button>

        {/* User Identity Profile Card with In-Box Logout */}
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'gap-2'
          } p-1.5 bg-bone-surface dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border`}
        >
          <div className="w-7 h-7 shrink-0 bg-carbon text-bone dark:bg-white dark:text-obsidian font-serif font-black flex items-center justify-center text-[10px]">
            {currentUser.username.substring(0, 2).toUpperCase()}
          </div>
          {!isCollapsed ? (
            <>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-[11px] font-semibold truncate text-carbon dark:text-white leading-tight">
                  {currentUser.fullName}
                </p>
                <p className="text-[9px] font-mono uppercase tracking-wider text-bone-muted dark:text-obsidian-muted truncate">
                  @{currentUser.username} // {currentUser.role === 'ADMIN_DIRECTOR' ? 'ROOT' : 'CREW'}
                </p>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={onOpenLoginModal}
                  className="p-1 text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white transition-colors"
                  title="Switch User Account"
                >
                  <KeyRound size={12} />
                </button>
                <button
                  onClick={onLogout}
                  className="p-1 text-vermillion hover:bg-vermillion/15 transition-colors"
                  title="Sign Out / Lock"
                >
                  <LogOut size={12} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onLogout}
              className="sr-only"
              title="Logout"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
