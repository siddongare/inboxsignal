```
 ⌜                                                                             ⌝
   INBOXSIGNAL // 受信箱のシグナル                                       ISSUE 04
   A FORENSIC AUTOPSY INSTRUMENT FOR COLD OUTREACH               VOL. 2026 / ED. B2B
 ⌞                                                                             ⌟
```

# INBOXSIGNAL // THE OUTREACH AUTOPSY

> **"98% of cold outreach doesn't die in spam filters. It dies in the preview line."**
> A brutalist diagnostic engine designed to dissect, benchmark, and rewrite B2B sales outreach before it burns pipeline.

```
+-------------------------------------------------------------------------------+
|  STATUS: [CLASSIFIED FIELD MANUAL]      SPEC: 4-VECTOR DIAGNOSTIC ENGINE     |
|  INSPECTION: [VERIFIED CALIBRATION]     STACK: NEXT.JS 16 // GROQ 70B // KV   |
+-------------------------------------------------------------------------------+
```

---

### [MANIFESTO // 01] · WHY MOST COLD EMAILS ARE DEAD ON ARRIVAL

Most founders and SDRs write cold emails like corporate pitch decks:
1. **The Ego Hook:** Starting with *"My name is X and we are the leading platform for Y..."* — immediate archive.
2. **The 30-Minute Trap:** Demanding calendar commitments before earning 30 seconds of cognitive trust.
3. **The Template Echo Chamber:** Relying on generic AI prompts that churn out robotic, hyper-polished corporate drivel.

**InboxSignal is not an AI email writer.** It is a forensic autopsy instrument. You feed it your cold draft and your prospect context; it runs a calibrated diagnosis across 4 failure vectors, stamps the fatal flaws, and issues an optimized revision plus an automated follow-up cadence.

---

### [DIAGNOSTIC MATRIX // 02] · THE 4 SIGNAL VECTORS

```
[VEC.01] CLARITY (0–100)        --> Cognitive friction, reading cadence, brevity.
[VEC.02] RELEVANCE (0–100)      --> Pain-point alignment & company trigger events.
[VEC.03] CREDIBILITY (0–100)    --> Proof points, tangible metrics, zero hype.
[VEC.04] CTA STRENGTH (0–100)   --> Frictionless next steps vs. calendar demands.
```

```
           [00 - 45]               [46 - 69]               [70 - 100]
     +-------------------+   +-------------------+   +-------------------+
     |  FATAL / ARCHIVE  |   | SUBOPTIMAL SIGNAL |   | CONVERSION CLEARED|
     |  High spam & burn |   | Friction in body  |   | Ready for dispatch|
     +-------------------+   +-------------------+   +-------------------+
```

---

### [TACTILE SPEC // 03] · WHAT THE ENGINE OUTPUTS

* **Forensic Failure Diagnosis:** Every weakness tagged by severity (`[CRITICAL]`, `[HIGH]`, `[MEDIUM]`, `[LOW]`) with the psychological failure mechanism exposed.
* **Conversion Rewrite:** An edited draft stripping filler phrases, anchored on verified customer outcomes.
* **4 Distinct Subject Line Angles:**
  * `[HOOK A]` — Direct / Question hook
  * `[HOOK B]` — Hiring / Funding trigger
  * `[HOOK C]` — Contrarian observation
  * `[HOOK D]` — Peer benchmark
* **Iterate V2 Loop:** One-click feedback loop that loads the generated rewrite back into the editor to test and measure score deltas.
* **Multi-Touch Cadence:**
  * `TOUCH 02 // DAY 3:` Soft context bump (no *"just bumping this"* filler).
  * `TOUCH 03 // DAY 7:` Value takeaway & respectful breakup angle.

---

### [SYSTEM BLUEPRINT // 04] · ARCHITECTURE & SPEC

```
 ┌────────────────────────────────────────────────────────┐
 │                   NEXT.JS 16 RUNTIME                   │
 │       (React 19 Concurrent / Turbopack / App Router)   │
 └───────────────────────────┬────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
 ┌──────────────────────┐          ┌──────────────────────┐
 │    CLERK AUTH V7     │          │    NEXT.JS PROXY     │
 │  (Session & Tokens)  │          │   (Route Shield)     │
 └──────────┬───────────┘          └──────────┬───────────┘
            │                                 │
            └────────────────┬────────────────┘
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │           POST /api/audit  &  /api/history             │
 └───────────────────────────┬────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
 ┌──────────────────────┐          ┌──────────────────────┐
 │       GROQ SDK       │          │      VERCEL KV       │
 │ (Llama 3.3 70B JSON) │          │(Atomic Daily Quotas) │
 │ Forensic Diagnostic  │          │(Case History Store)  │
 └──────────────────────┘          └──────────────────────┘
```

---

### [RUNBOOK // 05] · LOCAL INSTALLATION

#### 1. Clone the Specimen Repo
```bash
git clone https://github.com/siddongare/inboxsignal.git
cd inboxsignal
```

#### 2. Provision Dependencies
```bash
npm install
```

#### 3. Configure Environmental Keys
Create `.env.local` at repository root:
```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Groq Diagnostic Engine Key
GROQ_API_KEY=gsk_...

# Vercel KV / Redis (Optional in local dev, in-memory fallback enabled)
KV_REST_API_URL=https://...kv.vercel-storage.com
KV_REST_API_TOKEN=...
```

#### 4. Ignite Local Laboratory
```bash
npm run dev
```
Navigate to `http://localhost:3000` to review the autopsy deck.

#### 5. Verify Production Build
```bash
npm run build
```

---

### [DIRECTORY TAXONOMY // 06]

```
inboxsignal/
├── app/
│   ├── api/
│   │   ├── audit/route.ts          # Forensic AI diagnostic engine (Groq)
│   │   └── history/route.ts        # Archival CRUD endpoints
│   ├── globals.css                 # Print brutalist tokens & micro-dot textures
│   ├── layout.tsx                  # Font loading (Plus Jakarta Sans & Geist Mono)
│   ├── opengraph-image.tsx         # Edge-rendered social dossier card
│   ├── page.tsx                    # Page controller & telemetry prefetch
│   └── sitemap.ts                  # Production XML sitemap generator
├── components/
│   ├── inbox-signal/
│   │   ├── composer.tsx            # Tactile dossier composer & word/char metrics
│   │   ├── history-panel.tsx       # Case file history with status stamps
│   │   ├── progress-panel.tsx      # Signal progression histogram & delta velocity
│   │   ├── result-panel.tsx        # Forensic autopsy readout & V2 iteration action
│   │   ├── tactile-audio.ts        # Web Audio API mechanical clicks & stamp thuds
│   │   ├── tactile-elements.tsx    # Rubber stamps, masking tape, sticky critique note
│   │   └── utils.ts                # Formatting & sample case data
│   └── inbox-signal-shell.tsx      # Primary view orchestrator & zine layout
├── proxy.ts                        # Next.js 16 route shield proxy
├── package.json
└── README.md
```

---

```
 ⌜                                                                             ⌝
   INBOXSIGNAL // EDITED & COMPILED BY SIDDHARTH DONGARE
   ALL RIGHTS RESERVED // DISTRIBUTED UNDER MIT LICENSE
 ⌞                                                                             ⌟
```
