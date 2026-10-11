<div align="center">

# InboxSignal

**AI-Powered Outreach Diagnostic Engine & Conversion Optimizer**

*Objective B2B cold email failure analysis, multi-vector signal scoring, and conversion-focused copy rewrites.*

[Explore Live Demo](https://inboxsignal.vercel.app) · [Report Issue](https://github.com/siddongare/inboxsignal/issues)

</div>

---

## Overview

Most sales emails fail not because of deliverability or spam filters, but because of **subtle cognitive friction** in the copy:
- **Generic Value Propositions:** Pitching product features rather than solving acute executive pain.
- **Surface-Level Personalization:** Quoting LinkedIn profile headlines without contextual relevance.
- **High-Friction Calls-to-Action:** Demanding 30 minutes on an executive's calendar before establishing value.

**InboxSignal** is a diagnostic engine for sales leaders, founders, and SDRs. Built with a minimalist, human-centric design approach inspired by high-end modern SaaS interfaces (such as Luma by Arounda), it provides an immediate radial health readout, Pinpointed Failure Diagnostics, and an actionable revision workflow.

---

## Key Capabilities

### 1. Radial Signal Scoring (0–100)
A quick-scan composite meter evaluating drafts across four foundational dimensions:
- **Clarity:** Structural cadence, brevity, and cognitive load.
- **Relevance:** Pain-point alignment and buyer triggers.
- **Credibility:** Concrete metrics and authentic trust proof.
- **CTA Friction:** Ease and commitment level of the next step.

### 2. Forensic Failure Diagnostics
Actionable failure analysis ranked by severity (`Critical`, `High`, `Medium`, `Low`):
- **Failure Mechanism:** Explains why an executive buyer ignores or deletes the message.
- **Actionable Correction:** Direct guidance to eliminate the identified flaw.

### 3. Conversion-Focused Copy Rewrite
- **Side-by-Side Review:** Instant toggle between Original Draft and Optimized Rewrite.
- **4 Subject Line Hooks:** Direct, curiosity, trigger-based, and benchmark hooks.
- **Iterate V2 Workflow:** One-click transfer of the generated rewrite back into the editor to re-analyze and track score progression.

### 4. 2-Touch Follow-Up Cadence
- **Day 3 Soft Bump:** Low-friction context touch that adds a fresh angle without generic filler.
- **Day 7 Breakup Angle:** Courteous takeaway closing the loop while preserving pipeline opportunity.

### 5. Historical Velocity Tracking
- Real-time delta visualization (`+Score Delta`) comparing successive iterations.
- Persistent analysis timeline powered by Vercel KV Redis.

---

## Tech Stack & Architecture

- **Framework:** Next.js 16.2.4 (App Router, Turbopack)
- **UI & Animation:** React 19.2.4, Tailwind CSS v4, Framer Motion v12
- **Typography:** Plus Jakarta Sans & Geist Mono
- **Authentication:** Clerk (`@clerk/nextjs` v7)
- **AI Diagnostics:** Groq SDK (`llama-3.3-70b-versatile` structured JSON)
- **Database / Cache:** Vercel KV (`@vercel/kv` Redis)

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 16 App                       │
│        (React 19 Frontend & Luma-Style Bento UI)       │
└───────────────────────────┬────────────────────────────┘
                            │
           ┌────────────────┴────────────────┐
           ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────┐
│    Clerk Auth v7     │          │    Next.js Proxy     │
│  (Session Tokens)    │          │  (Route Protection)  │
└──────────┬───────────┘          └──────────┬───────────┘
           │                                 │
           └────────────────┬────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│          Next.js Route Handlers (/api/audit)           │
└───────────────────────────┬────────────────────────────┘
                            │
           ┌────────────────┴────────────────┐
           ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────┐
│       Groq SDK       │          │      Vercel KV       │
│ (Llama 3.3 70B JSON) │          │ (Atomic Daily Quota  │
│  Diagnostic Engine   │          │  & Analysis Store)   │
└──────────────────────┘          └──────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- Clerk, Groq, and Vercel KV accounts

### 1. Clone & Install
```bash
git clone https://github.com/siddongare/inboxsignal.git
cd inboxsignal
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the project root:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Groq API Key
GROQ_API_KEY=gsk_...

# Vercel KV Redis (Optional for local dev, in-memory fallback enabled)
KV_REST_API_URL=https://...kv.vercel-storage.com
KV_REST_API_TOKEN=...
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## Design Standards & Methodology

This project incorporates the design principles of **[Impeccable](https://impeccable.style/)** and **[Taste Skill](https://github.com/Leonxlnx/taste-skill)**:
- **No Template Slop:** Avoids generic AI purple gradients, redundant cards-in-cards, and status-chip soup.
- **Intentional Contrast:** Deep obsidian background tinted with slate/blue ambient glow, clean 1px borders (`border-white/[0.08]`), and luminous semantic accents.
- **Human-Centric Clarity:** Radial health visualization delivering actionable clarity in under 4 seconds.

---

## License

Distributed under the [MIT License](LICENSE).
