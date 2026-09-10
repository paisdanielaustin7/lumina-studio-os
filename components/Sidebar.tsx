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
} from 'lucide-react';
import { ViewModule, UserRole } from '@/types';
import { useTheme } from './ThemeContext';

interface SidebarProps {
  activeModule: ViewModule;
  onSelectModule: (module: ViewModule) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isCollapsed,
  setIsCollapsed,
  userRole,
  setUserRole,
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'overview' as ViewModule, label: 'Overview', icon: LayoutDashboard, badge: 'LIVE' },
    { id: 'calendar' as ViewModule, label: 'Calendar / Call Sheets', icon: CalendarDays, badge: '4 SETS' },
    { id: 'ledger' as ViewModule, label: 'Dual Ledger', icon: Scale, badge: null },
    { id: 'billing' as ViewModule, label: 'Invoices & Retainers', icon: FileText, badge: null },
    { id: 'access' as ViewModule, label: 'Access Control', icon: ShieldCheck, badge: userRole === 'ADMIN_DIRECTOR' ? 'DIR' : '2ND' },
    { id: 'settings' as ViewModule, label: 'Studio Settings', icon: Settings, badge: null },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 280 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col h-screen shrink-0 z-40 bg-bone-card dark:bg-obsidian-surface border-r border-bone-border dark:border-obsidian-border select-none"
    >
      {/* Top Header / Studio Brand Logo */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-bone-border dark:border-obsidian-border">
        <Link href="/" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-carbon dark:bg-white text-bone dark:text-obsidian font-serif font-black text-lg tracking-widest transition-transform group-hover:scale-105">
            L
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col whitespace-nowrap"
              >
                <span className="font-serif tracking-[0.25em] text-sm font-bold uppercase text-carbon dark:text-white">
                  LUMINA
                </span>
                <span className="text-[10px] uppercase font-mono text-bone-muted dark:text-obsidian-muted tracking-[0.18em]">
                  Studio OS // v2.6
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded border border-bone-border dark:border-obsidian-border text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white hover:border-carbon dark:hover:border-white transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Public View Quick-Launcher Banner */}
      <div className="p-3 border-b border-bone-border dark:border-obsidian-border">
        <Link
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-between group p-2.5 rounded text-xs font-mono uppercase tracking-wider transition-all ${
            isCollapsed
              ? 'justify-center bg-carbon/5 dark:bg-white/5 hover:bg-vermillion hover:text-white'
              : 'bg-carbon text-bone dark:bg-white dark:text-carbon hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white hover:text-white'
          }`}
          title="Open Public Editorial Portfolio & Studio Deck"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Camera size={14} className="shrink-0" />
            {!isCollapsed && (
              <span className="truncate font-semibold tracking-widest text-[11px]">
                Live Public Deck
              </span>
            )}
          </div>
          {!isCollapsed && (
            <ExternalLink size={12} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
          )}
        </Link>
      </div>

      {/* Navigation Modules */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2">
          {!isCollapsed && (
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-bone-muted dark:text-obsidian-muted">
              Operating Modules
            </p>
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-mono uppercase tracking-wider transition-all relative group ${
                isActive
                  ? 'bg-carbon text-bone dark:bg-obsidian-card dark:text-white font-bold'
                  : 'text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white hover:bg-bone-surface dark:hover:bg-obsidian-card/60'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-vermillion"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                size={16}
                className={`shrink-0 transition-colors ${
                  isActive ? 'text-vermillion' : 'group-hover:text-carbon dark:group-hover:text-white'
                }`}
              />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 tracking-widest font-mono border ${
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

      {/* Role Switcher (Admin / Second Shooter) */}
      {!isCollapsed && (
        <div className="px-4 py-3 mx-2 mb-2 bg-bone-surface dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted mb-2">
            <span>Permissions</span>
            <span className="text-vermillion font-bold">
              {userRole === 'ADMIN_DIRECTOR' ? 'Director' : '2nd Unit'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
            <button
              onClick={() => setUserRole('ADMIN_DIRECTOR')}
              className={`py-1 text-center transition-all ${
                userRole === 'ADMIN_DIRECTOR'
                  ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold'
                  : 'bg-transparent text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
              }`}
            >
              Director
            </button>
            <button
              onClick={() => setUserRole('SECOND_SHOOTER')}
              className={`py-1 text-center transition-all ${
                userRole === 'SECOND_SHOOTER'
                  ? 'bg-carbon text-bone dark:bg-white dark:text-carbon font-bold'
                  : 'bg-transparent text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white'
              }`}
            >
              2nd Shooter
            </button>
          </div>
        </div>
      )}

      {/* Bottom Dock: Theme Switcher & Identity Tag */}
      <div className="p-3 border-t border-bone-border dark:border-obsidian-border space-y-2">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } p-2 text-xs font-mono uppercase tracking-wider border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white transition-all`}
          title={`Switch to ${theme === 'dark' ? 'Light (Ivory)' : 'Dark (Obsidian)'} Mode`}
          aria-label="Toggle Color Theme"
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon size={14} className="text-editorial-gold" />
            ) : (
              <Sun size={14} className="text-vermillion" />
            )}
            {!isCollapsed && (
              <span className="text-[11px] font-mono">
                {theme === 'dark' ? 'Mode: Obsidian' : 'Mode: Bone Ivory'}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <span className="text-[9px] px-1.5 py-0.5 bg-carbon/5 dark:bg-white/10 font-mono">
              Toggle
            </span>
          )}
        </button>

        {/* User Identity Profile Card */}
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'gap-3'
          } p-2 bg-bone-surface dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border`}
        >
          <div className="w-8 h-8 shrink-0 bg-carbon text-bone dark:bg-white dark:text-obsidian font-serif font-black flex items-center justify-center text-xs">
            DA
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold truncate text-carbon dark:text-white">
                Dan Aurel
              </p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-bone-muted dark:text-obsidian-muted truncate">
                {userRole === 'ADMIN_DIRECTOR' ? 'Studio Principal' : 'Second Unit Lead'}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
