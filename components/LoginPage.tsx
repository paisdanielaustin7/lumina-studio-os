'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  KeyRound,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react';
import { UserAccount } from '@/types';
import Link from 'next/link';

interface LoginPageProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const foundUser = users.find(
        (u) =>
          u.username.trim().toLowerCase() === username.trim().toLowerCase() &&
          u.password === password
      );

      if (foundUser) {
        setIsLoading(false);
        onLoginSuccess(foundUser);
      } else {
        setIsLoading(false);
        setFailedAttempts((prev) => prev + 1);
        setError('Authentication denied. Invalid studio username or password.');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen w-screen bg-[#0a0a0a] text-white flex flex-col justify-between selection:bg-vermillion selection:text-white relative overflow-hidden font-mono">
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute left-12 top-0 bottom-0 w-px bg-white/30 hidden md:block" />
        <div className="absolute right-12 top-0 bottom-0 w-px bg-white/30 hidden md:block" />
        <div className="absolute left-0 right-0 top-16 h-px bg-white/30" />
        <div className="absolute left-0 right-0 bottom-16 h-px bg-white/30" />
      </div>

      {/* Top Telemetry Header */}
      <header className="relative z-10 px-6 md:px-16 py-4 flex items-center justify-between border-b border-white/10 text-[11px] uppercase tracking-widest text-white/60">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-vermillion animate-pulse" />
          <span className="font-bold tracking-[0.25em] text-white">LUMINA // STUDIO OS</span>
          <span className="hidden sm:inline text-white/40">// MANGALORE COASTAL ATELIER</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="hidden md:flex items-center gap-1.5 text-white/50">
            <Clock size={12} />
            <span>{currentTime || '10:30:00 AM IST'}</span>
          </span>
          <Link
            href="/about"
            className="flex items-center gap-1.5 text-white hover:text-vermillion transition-colors font-bold"
          >
            <span>Public Deck</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </header>

      {/* Main Authentication Monolith */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 my-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg bg-[#111111] border-2 border-white/20 shadow-2xl p-8 md:p-10 space-y-8"
        >
          {/* Identity Header */}
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-vermillion font-bold">
              <KeyRound size={13} />
              <span>Restricted Directorial Terminal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight uppercase text-white">
              Studio Sign In
            </h1>
            <p className="text-xs text-white/50 leading-relaxed">
              Enter verified studio credentials to access quotations, production call sheets, and financial vaults.
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-vermillion/10 border-l-4 border-vermillion text-vermillion flex items-center gap-2 text-xs"
              >
                <ShieldAlert size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5 text-xs">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-1.5">
                Operator Username
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-3.5 text-white/40" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  autoFocus
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#181818] border border-white/20 text-white font-mono placeholder:text-white/30 focus:border-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] uppercase tracking-widest text-white/60">
                  Access Key / Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] uppercase text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                >
                  {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                  <span>{showPassword ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-3.5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-[#181818] border border-white/20 text-white font-mono placeholder:text-white/30 focus:border-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-vermillion hover:text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Engine'}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Security Assurance Badge */}
          <div className="flex items-center justify-between text-[10px] uppercase text-white/40 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <Shield size={12} className="text-green-500" />
              <span>TLS 1.3 // 256-Bit Engine</span>
            </span>
            <span>MANGALORE HQ GATEWAY</span>
          </div>
        </motion.div>
      </main>

      {/* Footer Terminal Telemetry */}
      <footer className="relative z-10 px-6 md:px-16 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-white/10 text-[10px] uppercase tracking-widest text-white/40 gap-2">
        <div className="flex items-center gap-2">
          <MapPin size={11} className="text-vermillion" />
          <span>LUMINA ATELIER STUDIOS // DAKSHINA KANNADA, KARNATAKA</span>
        </div>
        <span>UNAUTHORIZED TELEMETRY LOGGED & RESTRICTED</span>
      </footer>
    </div>
  );
};
