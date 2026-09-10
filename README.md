# LUMINA // Avant-Garde Photography Studio OS & CRM

> Bespoke creative operating engine and client relationship system for elite fashion, architectural, and commercial photographers.

---

## 🏛️ Architecture & File Breakdown (Plain English)

- **`app/`**: Next.js 14 App Router directory.
  - `app/layout.tsx`: Root HTML shell with anti-flicker theme script, metadata, and font styles.
  - `app/globals.css`: Editorial styling tokens, brutalist borders, grain overlays, and custom scrollbars.
  - `app/page.tsx`: Studio OS terminal shell connecting the Sidebar with active modules (Overview, Calendar, Ledger, Invoices, Settings, Access Control).
  - `app/about/page.tsx`: The public-facing client deck and portfolio manifesto with large typography, client roster, hardware vault, and "Book a Session" inquiry trigger.
- **`components/`**: Reusable interface building blocks.
  - `Sidebar.tsx`: Smooth collapsible navigation rail with Dark/Light toggle, role switcher, and quick-launch button to the public deck.
  - `DashboardView.tsx`: Executive overview with KPI metrics, "Next Up on Set" call-sheet card, and live dual ledger feed.
  - `CalendarView.tsx`: Month matrix with shoot category tags and slide-in dossier drawer.
  - `LedgerView.tsx`: Dual accounting ledger tracking client receivables against production/gear costs.
  - `InvoicesView.tsx`: Commercial invoice and retainer settlement tracker.
  - `ThemeContext.tsx`: Client-side theme provider supporting Obsidian Dark mode and Bone Ivory Light mode.
- **`lib/`**:
  - `lib/mockData.ts`: Realistic haute-couture and commercial campaigns (Margiela, Boucheron, Singer 911, Architectural Digest).
- **`types.ts`**: TypeScript definitions for clients, shoots, invoices, and ledger entries.
- **`schema.sql`**: Production-ready Supabase PostgreSQL schema with Row-Level Security (RLS) policies and performance indexes.

---

## ⚡ Quick Start (Local Run)

```bash
# 1. Install dependencies (already installed in this directory)
npm install

# 2. Run local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Visit [http://localhost:3000/about](http://localhost:3000/about) to view the public editorial deck.

---

## 🚀 Deploy to GitHub & Vercel

```bash
# Initialize git & commit
git init
git add .
git commit -m "feat: initial commit of LUMINA Studio OS"
git branch -M main

# Link to your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/lumina-studio-os.git
git push -u origin main
```

Deploying on Vercel:
1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **"Add New..."** > **"Project"**.
3. Select your `lumina-studio-os` repository and click **Deploy**.
