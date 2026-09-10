'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Camera,
  Compass,
  Layers,
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
  Shield,
  Zap,
  Mail,
  CheckCircle,
  X,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

export default function PublicEditorialAbout() {
  const { theme, toggleTheme } = useTheme();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Client roster
  const clientCredits = [
    { name: 'Maison Margiela Artisanal', category: 'Haute Couture', city: 'Paris' },
    { name: 'Architectural Digest', category: 'Editorial Architecture', city: 'New York / Milan' },
    { name: 'Boucheron Haute Joaillerie', category: 'High Jewelry', city: 'Place Vendôme' },
    { name: 'Singer Vehicle Design', category: 'Automotive Restomod', city: 'California' },
    { name: 'Acne Studios', category: 'Avant-Garde Ready-To-Wear', city: 'Stockholm' },
    { name: 'Bottega Veneta', category: 'Leather Craft Studies', city: 'Milan' },
    { name: 'Wallpaper* Magazine', category: 'Design Features', city: 'London' },
    { name: 'Leica Camera AG', category: 'Monochrom Fine Art', city: 'Wetzlar' },
  ];

  // Gear rack breakdown
  const gearRack = [
    {
      category: 'Digital Medium Format & Backs',
      items: [
        'Phase One IQ4 150MP Achromatic & Trichromatic Backs',
        'Hasselblad H6D-100c Medium Format System',
        'Hasselblad X2D 100C Mirrorless Field Body',
        'Cambo WRS-1600 Technical Shift Camera',
      ],
    },
    {
      category: 'Specialist Optical Glass',
      items: [
        'Rodenstock HR Digaron-W 32mm f/4 & 70mm f/5.6',
        'Hasselblad HC 100mm f/2.2 & 28mm f/4 Ultra-Wide',
        'Cooke Full Frame Plus Prime Cine T2.1 Set',
        'Schneider Kreuznach 120mm LS f/4 Macro Focus Stack',
      ],
    },
    {
      category: 'Editorial Light & Atmospheric Rigging',
      items: [
        'Briese Focus 220cm Parabolic Reflector & Tungsten/Flash Generator',
        'Profoto Pro-11 2400W AirX Studio Packs (x4)',
        'Broncolor Scoro 3200 S WiFi RFS 2 Precision Generators',
        'Arri Orbiter & SkyPanel S60-C Tunable LED Fresnels',
      ],
    },
    {
      category: 'Digital Imaging Tether & Color Pipeline',
      items: [
        'Inovativ Scout 37 Digi-Plate Carbon Workstation',
        'Eizo ColorEdge Prominence CG3146 HDR Reference 4K',
        'Thunderbolt 4 Fibre-Optic 30m Realtime Tether Line',
        'Triple NVMe RAID 0 High-Speed On-Set Backup System',
      ],
    },
  ];

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
  };

  return (
    <div className="min-h-screen bg-bone dark:bg-obsidian text-carbon dark:text-white transition-colors selection:bg-vermillion selection:text-white">
      {/* Top Editorial Nav */}
      <header className="sticky top-0 z-40 bg-bone/90 dark:bg-obsidian/90 backdrop-blur border-b border-bone-border dark:border-obsidian-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 flex items-center justify-center bg-carbon text-bone dark:bg-white dark:text-obsidian font-serif font-black text-base tracking-widest transition-transform group-hover:scale-105">
                L
              </div>
              <span className="font-serif font-black tracking-[0.3em] uppercase text-sm">
                LUMINA
              </span>
            </Link>
            <span className="hidden md:inline-block text-[11px] font-mono text-bone-muted dark:text-obsidian-muted uppercase tracking-[0.2em] border-l border-bone-border dark:border-obsidian-border pl-6">
              Studio Manifesto & Public Dossier
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white transition-colors"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={14} className="text-vermillion" /> : <Moon size={14} className="text-editorial-gold" />}
            </button>

            {/* Back to Studio OS */}
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 border border-bone-border dark:border-obsidian-border hover:border-carbon dark:hover:border-white transition-colors tracking-wider uppercase text-[11px]"
            >
              <Camera size={12} />
              <span>Studio OS Login</span>
            </Link>

            {/* Inquiry Trigger */}
            <button
              onClick={() => {
                setInquirySubmitted(false);
                setIsInquiryOpen(true);
              }}
              className="px-4 py-2 bg-carbon text-bone dark:bg-white dark:text-carbon font-bold uppercase tracking-widest hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all text-[11px]"
            >
              Commission Session
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section with Massive Editorial Typography */}
      <section className="border-b border-bone-border dark:border-obsidian-border pt-16 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-vermillion font-bold">
            <span className="w-3 h-px bg-vermillion" />
            <span>Monochrome Precision // Medium Format Architecture</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-serif font-black tracking-tight leading-[0.88] uppercase text-carbon dark:text-white">
            Form. Shadow.
            <br />
            <span className="italic font-normal">Permanence.</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-end">
            <div className="lg:col-span-7">
              <p className="text-lg md:text-2xl font-serif text-carbon/90 dark:text-bone/90 leading-relaxed font-light">
                LUMINA is an independent, Paris-based digital art direction studio and photographic atelier. We orchestrate architectural commissions, haute couture editorials, and commercial campaigns with technical cameras, raw daylight, and brutalist restraint.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border">
              <div className="font-mono text-xs space-y-1">
                <span className="text-[10px] uppercase text-bone-muted dark:text-obsidian-muted block tracking-widest">
                  Current Headquarters
                </span>
                <p className="font-bold text-carbon dark:text-white">
                  Pavillon de l’Arsenal, 4e Paris
                </p>
                <p className="text-bone-muted dark:text-obsidian-muted">
                  48.8519° N, 2.3619° E
                </p>
              </div>

              <button
                onClick={() => setIsInquiryOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-carbon text-bone dark:bg-white dark:text-carbon text-xs font-mono uppercase tracking-widest hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <span>Inquire</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto / Studio Philosophy */}
      <section className="border-b border-bone-border dark:border-obsidian-border py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-vermillion font-bold block mb-2">
              Chapter 01 // Manifesto
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold uppercase text-carbon dark:text-white">
              The Antidote to the Ephemeral
            </h2>
          </div>

          <div className="lg:col-span-8 space-y-6 text-sm md:text-base text-carbon/80 dark:text-bone/80 leading-relaxed font-sans">
            <p>
              In an epoch drowned in disposable content and synthetic rendering, we practice photographic permanence. Every frame captured by LUMINA begins with optical physics: 150-megapixel medium-format sensors, precision Rodenstock technical shift lenses, and sculpted architectural light.
            </p>
            <p>
              We reject the plastic veneer of over-smoothed digital post-production. Instead, we preserve organic film grain, micro-textures of wool and cast concrete, diamond refractive indices, and the stark geometries of European brutalism.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-bone-border dark:border-obsidian-border font-mono text-xs">
              <div>
                <span className="text-vermillion font-bold block mb-1">01 / RESOLUTION</span>
                <p className="text-bone-muted dark:text-obsidian-muted">
                  150-Megapixel Achromatic & Trichromatic sensor capture with optical parity.
                </p>
              </div>
              <div>
                <span className="text-vermillion font-bold block mb-1">02 / RIGOR</span>
                <p className="text-bone-muted dark:text-obsidian-muted">
                  Strict mechanical perspective correction in-camera prior to exposure.
                </p>
              </div>
              <div>
                <span className="text-vermillion font-bold block mb-1">03 / CALIBRATION</span>
                <p className="text-bone-muted dark:text-obsidian-muted">
                  Bespoke 16-bit ProPhoto color profiles calibrated per project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Roster & Editorial Credits */}
      <section className="border-b border-bone-border dark:border-obsidian-border py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-vermillion font-bold block mb-2">
              Chapter 02 // Commissions
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold uppercase text-carbon dark:text-white">
              Client Roster & Select Credits
            </h2>
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted">
            Global Archive 2022 — 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-bone-border dark:bg-obsidian-border border border-bone-border dark:border-obsidian-border">
          {clientCredits.map((client, i) => (
            <div
              key={i}
              className="p-6 bg-bone dark:bg-obsidian hover:bg-bone-surface dark:hover:bg-obsidian-card transition-colors flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-vermillion block mb-1">
                  {client.category}
                </span>
                <h3 className="font-serif font-bold text-lg text-carbon dark:text-white group-hover:text-vermillion transition-colors">
                  {client.name}
                </h3>
              </div>
              <div className="mt-8 pt-4 border-t border-bone-border dark:border-obsidian-border flex items-center justify-between text-[11px] font-mono text-bone-muted dark:text-obsidian-muted">
                <span>{client.city}</span>
                <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Gear Rack Breakdown */}
      <section className="border-b border-bone-border dark:border-obsidian-border py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-vermillion font-bold block mb-2">
              Chapter 03 // Hardware Inventory
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold uppercase text-carbon dark:text-white">
              The Gear Rack & Optical Vault
            </h2>
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-bone-muted dark:text-obsidian-muted">
            All Hardware Studio-Owned & Calibrated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gearRack.map((rack, idx) => (
            <div
              key={idx}
              className="p-6 bg-bone-card dark:bg-obsidian-card border border-bone-border dark:border-obsidian-border space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-bone-border dark:border-obsidian-border pb-3">
                <span className="w-2 h-2 bg-vermillion" />
                <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-carbon dark:text-white">
                  {rack.category}
                </h3>
              </div>
              <ul className="space-y-2 text-xs font-mono">
                {rack.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-carbon/90 dark:text-white/90">
                    <span className="text-vermillion font-bold select-none">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Big Footer CTA */}
      <footer className="py-24 px-6 lg:px-12 max-w-7xl mx-auto text-center space-y-8">
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-vermillion font-bold block">
          Inquire For Q4 2026 Commissions
        </span>
        <h2 className="text-4xl sm:text-6xl font-serif font-black uppercase text-carbon dark:text-white max-w-3xl mx-auto leading-tight">
          Let us discuss your next editorial milestone.
        </h2>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              setInquirySubmitted(false);
              setIsInquiryOpen(true);
            }}
            className="px-8 py-4 bg-carbon text-bone dark:bg-white dark:text-carbon font-mono font-bold text-xs uppercase tracking-widest hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all flex items-center gap-2"
          >
            <span>Launch Commission Inquiry</span>
            <ArrowRight size={14} />
          </button>
          <Link
            href="/"
            className="px-8 py-4 border border-bone-border dark:border-obsidian-border text-xs font-mono uppercase tracking-widest hover:border-carbon dark:hover:border-white transition-colors"
          >
            Return to Studio OS
          </Link>
        </div>

        <div className="pt-16 border-t border-bone-border dark:border-obsidian-border flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-bone-muted dark:text-obsidian-muted">
          <span>© 2026 LUMINA ATELIER & STUDIO OS. ALL RIGHTS RESERVED.</span>
          <span>PARIS // LAKE COMO // LOS ANGELES</span>
        </div>
      </footer>

      {/* Commission Inquiry Modal */}
      <AnimatePresence>
        {isInquiryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInquiryOpen(false)}
              className="absolute inset-0 bg-carbon/70 dark:bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-bone-card dark:bg-obsidian-card border-2 border-carbon dark:border-white p-6 sm:p-8 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-bone-border dark:border-obsidian-border mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-vermillion font-bold block mb-0.5">
                    LUMINA STUDIO // CLIENT INTAKE
                  </span>
                  <h3 className="font-serif text-2xl font-bold uppercase text-carbon dark:text-white">
                    Book a Production Session
                  </h3>
                </div>
                <button
                  onClick={() => setIsInquiryOpen(false)}
                  className="p-1 rounded border border-bone-border dark:border-obsidian-border text-bone-muted hover:text-carbon dark:hover:text-white"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              {inquirySubmitted ? (
                <div className="py-8 text-center space-y-4 font-mono">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 border border-green-500/40 flex items-center justify-center mx-auto">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="font-serif text-xl font-bold uppercase text-carbon dark:text-white">
                    Inquiry Transmitted
                  </h4>
                  <p className="text-xs text-bone-muted dark:text-obsidian-muted max-w-sm mx-auto">
                    Your production brief has entered the direct queue of Studio Director Dan Aurel. Our studio manager will confirm date availability within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsInquiryOpen(false)}
                    className="mt-4 px-6 py-2.5 bg-carbon text-bone dark:bg-white dark:text-carbon uppercase text-xs tracking-widest hover:bg-vermillion transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                        Your Name / Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Aurelia Vance"
                        className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                        Brand / Publication
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Maison Margiela"
                        className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                        Corporate Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="a.vance@margiela.com"
                        className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                        Production Format
                      </label>
                      <select
                        className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none"
                      >
                        <option>Haute Couture Editorial</option>
                        <option>Architectural Digest Feature</option>
                        <option>High Jewelry Macro Lookbook</option>
                        <option>Commercial Brand Campaign</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-bone-muted dark:text-obsidian-muted mb-1">
                      Creative Brief & Estimated Production Dates
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Outline target shoot dates, location requirements (Paris, Lake Como, Mojave), shot list count, and timeline..."
                      className="w-full p-2.5 bg-bone-surface dark:bg-obsidian-surface border border-bone-border dark:border-obsidian-border text-carbon dark:text-white outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-carbon text-bone dark:bg-white dark:text-carbon uppercase tracking-widest font-bold hover:bg-vermillion dark:hover:bg-vermillion dark:hover:text-white transition-all"
                    >
                      Transmit Brief to Studio
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInquiryOpen(false)}
                      className="px-4 py-3 border border-bone-border dark:border-obsidian-border uppercase tracking-widest hover:border-carbon dark:hover:border-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
