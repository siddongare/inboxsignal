<div align="center">

# ⚡ InboxSignal

### High-Precision AI Cold Outreach Diagnostic Engine & Rewrite System

Turn cold emails into replies. Diagnose why your B2B sales outreach gets ignored before hitting Send.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk_v7-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.com/)
[![Groq](https://img.shields.io/badge/Inference-Groq_Llama_3.3_70B-F55036?style=for-the-badge)](https://groq.com/)
[![Vercel KV](https://img.shields.io/badge/Database-Vercel_KV_Redis-000000?style=for-the-badge&logo=vercel)](https://vercel.com/storage/kv)

[Live Demo](https://inboxsignal.vercel.app) · [Report Bug](https://github.com/siddongare/inboxsignal/issues) · [Request Feature](https://github.com/siddongare/inboxsignal/issues)

</div>

---

## 🎯 The Problem

Most cold emails don't fail because of spam filters — they fail because of **subtle friction points**:
1. **Unfocused Value Propositions:** Pitching features instead of solving the prospect's acute bottleneck.
2. **Surface-Level Personalization:** Quoting a college or LinkedIn title without proving relevance.
3. **High-Commitment CTAs:** Demanding 30 minutes on an executive's calendar with zero trust established.
4. **Generic AI Hallucinations:** Using vanilla ChatGPT prompts that output robotic, hype-filled templates.

**InboxSignal** replaces guesswork with a calibrated diagnostic engine. It benchmarks your outreach across 4 core signal dimensions, identifies failure mechanisms ranked by severity, and generates an optimized copy rewrite plus an automated 2-touch follow-up cadence.

---

## ✨ Core Features

### 1. 📊 4-Dimensional Signal Scoring (0–100)
Every draft is mathematically evaluated against rigorous B2B outreach rubrics:
- **Clarity (0–100):** Cognitive load, scannability, structure, and brevity.
- **Relevance (0–100):** Prospect pain alignment and trigger-event specificity.
- **Credibility (0–100):** Social proof, metrics, and genuine trust signals.
- **CTA Strength (0–100):** Friction level and simplicity of the immediate next step.

### 2. 🚨 Impact-Ranked Failure Diagnosis
Identifies exact failure mechanisms ranked from **Critical** down to **Low**:
- Visual severity badging (`Critical`, `High`, `Medium`, `Low`).
- **Why It Matters:** Explains the psychological failure mechanism in the prospect's mind.
- **Actionable Correction:** Step-by-step guidance on how to fix each flaw.

### 3. ✍️ Conversion-Focused Copy Rewrite & Subject Variations
- **Side-by-Side Comparison:** Instant toggle between Original Draft and Optimized Rewrite.
- **4 Distinct Subject Lines:** Hook variants (Direct, Curiosity, Benefit, Trigger) with a designated **Top Pick**.
- **Signal Rationale:** Transparent breakdown explaining why the rewritten angle increases reply probability.

### 4. 🔁 Continuous "Iterate V2" Workflow
- One-click **Iterate V2** transfers the generated rewrite directly into the editor.
- Re-run audits to observe score deltas and iteratively eliminate friction points.

### 5. 📅 Multi-Touch Follow-Up Cadence
- **Day 3 (Soft Bump):** Low-friction context check adding a fresh angle without generic "checking in" filler.
- **Day 7 (Breakup / Pivot):** Strategic takeaway angle designed to elicit high-intent responses.

### 6. 📈 Velocity Tracking & Audit History
- Persistent storage powered by **Vercel KV (Redis)**.
- Historical score delta visualization (`+Delta` tracking improvement over time).
- One-click audit restore, rename, and deletion.

---

## 🏗️ System Architecture

```
                                      ┌──────────────────────┐
                                      │   Next.js 16 App     │
                                      │  (React 19 Frontend) │
                                      └──────────┬───────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
             ┌─────────────────────┐                           ┌─────────────────────┐
             │    Clerk Auth v7    │                           │  Next.js 16 Proxy   │
             │ (Session / Tokens)  │                           │   (Route Shield)    │
             └──────────┬──────────┘                           └──────────┬──────────┘
                        │                                                 │
                        └────────────────────────┬────────────────────────┘
                                                 │
                                                 ▼
                                    ┌────────────────────────┐
                                    │      Next.js API       │
                                    │ (/api/audit & history) │
                                    └────────────┬───────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
             ┌─────────────────────┐                           ┌─────────────────────┐
             │      Groq SDK       │                           │      Vercel KV      │
             │ (Llama 3.3 70B JSON)│                           │ (Atomic Daily Usage │
             │  Diagnostic Engine  │                           │  & History Store)   │
             └─────────────────────┘                           └─────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | Next.js 16.2.4 (App Router, Turbopack) | Latest Next.js with Proxy middleware convention |
| **UI Library** | React 19.2.4 | Modern concurrent React primitives |
| **Styling** | Tailwind CSS v4 | Cutting-edge high-performance CSS engine |
| **Typography** | Plus Jakarta Sans & Geist Mono | Humanist sans-serif body with technical monospace data accents |
| **Animations** | Framer Motion v12 | Fluid transitions, radial score indicators, layout morphs |
| **Authentication** | Clerk (`@clerk/nextjs` v7) | Production-ready auth with dark-mode theme customization |
| **AI Inference** | Groq SDK (`llama-3.3-70b-versatile`) | Sub-second structured JSON diagnostic completions |
| **Storage / Cache** | Vercel KV (`@vercel/kv`) | Redis-backed usage metering and analysis history |
| **Icons** | Lucide React | Crisp, accessible iconography |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm, pnpm, or yarn
- Accounts with [Clerk](https://clerk.com), [Groq](https://groq.com), and [Vercel](https://vercel.com)

### 1. Clone the Repository
```bash
git clone https://github.com/siddongare/inboxsignal.git
cd inboxsignal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Groq API
GROQ_API_KEY=gsk_...

# Vercel KV / Redis (Optional for local dev, in-memory fallback enabled)
KV_REST_API_URL=https://...kv.vercel-storage.com
KV_REST_API_TOKEN=...
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Repository Structure

```
inboxsignal/
├── app/
│   ├── api/
│   │   ├── audit/route.ts       # AI diagnosis and scoring endpoint
│   │   └── history/route.ts     # CRUD endpoints for saved audits
│   ├── globals.css              # Linear/Stripe design tokens and theme variables
│   ├── layout.tsx               # Root layout with typography and Clerk provider
│   ├── opengraph-image.tsx      # Dynamic edge OpenGraph social card
│   ├── page.tsx                 # Server page controller with auth & usage prefetching
│   └── sitemap.ts               # Automated XML sitemap generator
├── components/
│   ├── inbox-signal/
│   │   ├── composer.tsx         # Responsive email & prospect composer card
│   │   ├── history-panel.tsx    # Saved audit history panel with semantic badges
│   │   ├── metric.tsx           # Reusable metric card primitive
│   │   ├── progress-panel.tsx   # Progress velocity chart and delta tracker
│   │   ├── result-panel.tsx     # Full diagnostic report with V2 iteration action
│   │   └── utils.ts            # Formatting helpers and sample templates
│   └── inbox-signal-shell.tsx   # Main responsive view state orchestrator
├── lib/
│   ├── analysis-normalizer.ts   # Defensive JSON parser and schema normalizer
│   ├── analysis-types.ts        # TypeScript data contracts and score calculators
│   ├── history.ts               # Storage service for Vercel KV / in-memory fallback
│   └── usage.ts                 # Atomic daily rate limit reservation logic
├── proxy.ts                     # Next.js 16 route shield middleware
├── package.json
└── README.md
```

---

## 🔒 Security & Rate Limiting

- **Route Shielding:** Sensitive API endpoints (`/api/audit`, `/api/history`) are protected at both proxy and handler layers.
- **Atomic Quota Reservation:** Daily quotas (5 analyses/day per user) use atomic Redis `INCR` operations with automated UTC midnight expirations to prevent race conditions.
- **Defensive LLM Normalization:** Malformed AI payloads are caught, coerced, and validated prior to database persistence or client delivery.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with precision by <strong>Siddharth Dongare</strong></sub>
</div>
