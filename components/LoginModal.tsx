'use client';

import React, { useState } from 'react';
import { KeyRound, Lock, User, Check, X, ShieldAlert } from 'lucide-react';
import { UserAccount } from '@/types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  currentUser: UserAccount;
  onLogin: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const found = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (found) {
      onLogin(found);
      setUsername('');
      setPassword('');
      onClose();
    } else {
      setError('Invalid studio credentials. Check username or password.');
    }
  };

  const handleQuickSwitch = (user: UserAccount) => {
    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon/80 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white shadow-2xl p-6 md:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-bone-muted dark:text-obsidian-muted hover:text-carbon dark:hover:text-white"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-vermillion font-bold mb-1">
            <KeyRound size={13} />
            <span>Studio Identity & Auth</span>
          </div>
          <h2 className="text-2xl font-serif font-black uppercase tracking-tight text-carbon dark:text-white">
            LUMINA Gatekeeper
          </h2>
          <p className="text-xs font-mono text-bone-muted dark:text-obsidian-muted mt-1">
            Authenticate to unlock elevated root permissions or switch to restricted crew terminal.
          </p>
        </div>

        {/* Current Active User Banner */}
        <div className="p-3 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-xs font-mono flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-bone-muted dark:text-obsidian-muted block">
              Currently Authenticated
            </span>
            <span className="font-bold text-carbon dark:text-white">{currentUser.fullName}</span>
            <span className="text-[10px] text-bone-muted block font-normal">@{currentUser.username}</span>
          </div>
          <span
            className={`text-[9px] px-2 py-0.5 font-bold uppercase ${
              currentUser.role === 'ADMIN_DIRECTOR'
                ? 'bg-vermillion text-white'
                : 'bg-carbon/10 dark:bg-white/10 text-carbon dark:text-white'
            }`}
          >
            {currentUser.role === 'ADMIN_DIRECTOR' ? 'Director [ROOT]' : 'Crew [RESTRICTED]'}
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {error && (
            <div className="p-2.5 bg-vermillion/10 border border-vermillion/40 text-vermillion flex items-center gap-2 text-[11px]">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
              Username
            </label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-3 text-bone-muted" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or roshan"
                required
                className="w-full pl-9 pr-3 py-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white focus:border-carbon dark:focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
              Secret Key / Password
            </label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-3 text-bone-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-9 pr-3 py-2 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white focus:border-carbon dark:focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold uppercase tracking-widest hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all text-xs"
          >
            Authenticate & Switch User
          </button>
        </form>
      </div>
    </div>
  );
};
