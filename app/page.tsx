"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import InboxSignalApp from "@/components/inbox-signal-app";

// ─── Rotating prompt suggestions ─────────────────────────────────────────────

const PROMPTS = [
  "Analyze this cold email...",
  "Why did this recruiter ignore me?",
  "Fix my outreach message",
  "Improve my follow-up email",
  "Why am I getting no replies?",
  "Diagnose my sales email",
];

function RotatingPlaceholder() {
  const [index, setIndex]   = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % PROMPTS.length);
        setVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      style={{
        color: "#475569",
        fontFamily: "'DM Mono', monospace",
        fontSize: "clamp(13px, 3vw, 15px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        display: "inline-block",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {PROMPTS[index]}
    </span>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div
      className="feature-card"
      style={{
        padding: "20px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "border-color 0.2s, background 0.2s",
      }}
    >
      <span style={{
        fontSize: 9,
        fontFamily: "'DM Mono', monospace",
        color: "#6366F1",
        letterSpacing: "0.14em",
        opacity: 0.8,
      }}>{n}</span>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", letterSpacing: "-0.02em" }}>{title}</div>
      <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
}

// ─── Social proof pill ────────────────────────────────────────────────────────

function SocialProof() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "6px 14px", borderRadius: 999,
      background: "rgba(99,102,241,0.08)",
      border: "1px solid rgba(99,102,241,0.18)",
      marginBottom: 28,
    }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 6px rgba(52,211,153,0.7)", flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#818CF8", letterSpacing: "0.06em" }}>
        AI-powered · Free to try · No card required
      </span>
    </div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────

function LandingPage({ onLaunchApp }: { onLaunchApp: (email?: string) => void }) {
  const [inputValue, setInputValue]   = useState("");
  const [isFocused,  setIsFocused]    = useState(false);
  const [mounted,    setMounted]      = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Stagger-in the hero on mount
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleAnalyze = () => {
    onLaunchApp(inputValue || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleAnalyze();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>

      {/* ── Hero ── */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px 40px",
        textAlign: "center",
      }}>

        {/* Social proof */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
          transitionDelay: "0ms",
        }}>
          <SocialProof />
        </div>

        {/* Headline */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.65s ease, transform 0.65s ease",
          transitionDelay: "80ms",
        }}>
          <h1 style={{
            fontSize: "clamp(32px, 8vw, 68px)",
            fontWeight: 800,
            color: "#F1F5F9",
            letterSpacing: "-0.04em",
            lineHeight: 1.08,
            margin: "0 0 18px",
            fontFamily: "'Syne', system-ui, sans-serif",
            maxWidth: 720,
          }}>
            Turn cold emails{" "}
            <span style={{
              background: "linear-gradient(135deg, #818CF8 0%, #6366F1 50%, #A78BFA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              into replies.
            </span>
          </h1>
        </div>

        {/* Sub-headline */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.65s ease, transform 0.65s ease",
          transitionDelay: "150ms",
        }}>
          <p style={{
            fontSize: "clamp(14px, 2.5vw, 18px)",
            color: "#64748B",
            lineHeight: 1.7,
            maxWidth: 520,
            margin: "0 auto 44px",
          }}>
            InboxSignal analyzes your outreach and tells you exactly why you&apos;re
            getting ignored — and how to fix it.
          </p>
        </div>

        {/* ── Prompt input box ── */}
        <div style={{
          width: "100%",
          maxWidth: 640,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.65s ease, transform 0.65s ease",
          transitionDelay: "220ms",
        }}>
          <div style={{
            position: "relative",
            background: "rgba(255,255,255,0.025)",
            border: `1px solid ${isFocused ? "rgba(99,102,241,0.55)" : "rgba(255,255,255,0.09)"}`,
            borderRadius: 16,
            boxShadow: isFocused
              ? "0 0 0 3px rgba(99,102,241,0.10), 0 0 40px rgba(99,102,241,0.08)"
              : "0 0 40px rgba(0,0,0,0.15)",
            transition: "border-color 0.2s, box-shadow 0.2s",
            overflow: "hidden",
          }}>
            {/* Animated placeholder — only shown when input is empty & not focused */}
            {!inputValue && !isFocused && (
              <div style={{
                position: "absolute",
                top: 18, left: 20,
                pointerEvents: "none",
                zIndex: 1,
              }}>
                <RotatingPlaceholder />
              </div>
            )}

            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              rows={4}
              placeholder=""
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                padding: "18px 20px 64px",
                color: "#CBD5E1",
                fontSize: 15,
                lineHeight: 1.7,
                fontFamily: "'DM Mono', monospace",
                resize: "none",
                display: "block",
                caretColor: "#818CF8",
                // iOS zoom prevention
              } as React.CSSProperties}
            />

            {/* Bottom bar: hint + CTA */}
            <div style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(6,9,14,0.5)",
            }}>
              <span style={{
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
                color: "#1E293B",
                letterSpacing: "0.06em",
              }}>
                {inputValue.length > 0 ? `${inputValue.length} chars · ` : ""}
                Paste email + describe prospect
              </span>
              <button
                className="analyze-btn"
                onClick={handleAnalyze}
                style={{
                  padding: "8px 20px",
                  background: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Syne', system-ui, sans-serif",
                  letterSpacing: "-0.01em",
                  cursor: "pointer",
                  minHeight: 36,
                  transition: "filter 0.15s, transform 0.12s, box-shadow 0.15s",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Analyze →
              </button>
            </div>
          </div>

          <p style={{ fontSize: 11, color: "#1E293B", fontFamily: "'DM Mono', monospace", marginTop: 10, letterSpacing: "0.05em" }}>
            ⌘ / CTRL + ENTER · Free, 5 analyses per day
          </p>
        </div>

        {/* ── Feature grid ── */}
        <div style={{
          width: "100%", maxWidth: 720,
          marginTop: 52,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 0.65s ease, transform 0.65s ease",
          transitionDelay: "320ms",
        }}>
          <div className="feature-grid">
            <FeatureCard
              n="01"
              title="Signal Score"
              desc="0–100 composite score across clarity, relevance, credibility, and CTA strength."
            />
            <FeatureCard
              n="02"
              title="Failure Diagnosis"
              desc="Every weak point ranked by severity — Critical, High, Medium, Low."
            />
            <FeatureCard
              n="03"
              title="Optimized Rewrite"
              desc="A better email with 4 subject line variants, ready to copy and send."
            />
            <FeatureCard
              n="04"
              title="Follow-Up Sequence"
              desc="Day 3 and Day 7 follow-ups that add a new angle, not just a nudge."
            />
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        padding: "20px",
        textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <span style={{ fontSize: 11, color: "#1E293B", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>
          InboxSignal · Built for founders & operators
        </span>
      </footer>
    </div>
  );
}

// ─── Root page ────────────────────────────────────────────────────────────────
// Handles three states:
//   1. Not signed in → show landing page; clicking Analyze opens Clerk modal
//   2. Signed in, in landing mode → show landing; clicking Analyze launches app
//   3. App mode → render InboxSignalApp directly

const DAILY_LIMIT = 5;

export default function Page() {
  const { isSignedIn, isLoaded } = useAuth();
  const [appMode, setAppMode] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState("");

  // Once we know the user is signed in, surface the app immediately
  // if they were mid-flow (e.g. just completed sign-in from modal)
  useEffect(() => {
    if (isLoaded && isSignedIn && appMode) {
      // Already flagged — stay in app mode
    }
  }, [isLoaded, isSignedIn, appMode]);

  const handleLaunch = (emailText?: string) => {
    if (emailText) setPrefillEmail(emailText);
    setAppMode(true);
  };

  // Show app directly if signed in and in app mode
  if (isLoaded && isSignedIn && appMode) {
    return (
      <InboxSignalApp
        initialLimit={DAILY_LIMIT}
        initialRemaining={DAILY_LIMIT}
        prefillEmail={prefillEmail}
      />
    );
  }

  // Show landing page for everyone else
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        html, body { overflow-x: hidden; margin: 0; }
        body {
          background: #06090E;
          font-family: 'Syne', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          color: #F1F5F9;
        }

        ::selection { background: rgba(99,102,241,0.28); color: #E0E7FF; }

        textarea:focus { outline: none; }

        .analyze-btn:hover { filter: brightness(1.15); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99,102,241,0.30); }
        .analyze-btn:active { transform: scale(0.97); }

        .feature-card:hover {
          background: rgba(99,102,241,0.04) !important;
          border-color: rgba(99,102,241,0.18) !important;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 480px) {
          .feature-grid { grid-template-columns: 1fr; }
        }

        /* Auth nav buttons */
        .auth-btn-secondary {
          padding: 7px 16px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.10);
          color: #94A3B8;
          border-radius: 8px;
          font-size: 13px;
          font-family: 'Syne', system-ui, sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          min-height: 36px;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .auth-btn-secondary:hover { background: rgba(255,255,255,0.05); color: #E2E8F0; border-color: rgba(255,255,255,0.18); }

        .auth-btn-primary {
          padding: 7px 16px;
          background: linear-gradient(135deg, #6366F1 0%, #4338CA 100%);
          border: none;
          color: #fff;
          border-radius: 8px;
          font-size: 13px;
          font-family: 'Syne', system-ui, sans-serif;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          min-height: 36px;
          letter-spacing: -0.01em;
          white-space: nowrap;
          box-shadow: 0 2px 12px rgba(99,102,241,0.25);
        }
        .auth-btn-primary:hover { filter: brightness(1.12); transform: translateY(-1px); }

        /* Noise texture */
        .noise-bg::after {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0; opacity: 0.45;
        }
      `}</style>

      <div className="noise-bg" style={{ minHeight: "100vh", background: "#06090E", color: "#F1F5F9", fontFamily: "'Syne', system-ui, sans-serif", position: "relative" }}>

        {/* Ambient glows */}
        <div style={{ position: "fixed", top: "-20%", left: "30%", width: 700, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: "-10%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

        {/* ── Navbar ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          height: 54,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 clamp(16px, 4vw, 32px)",
          background: "rgba(6,9,14,0.90)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
              background: "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 100%)",
              border: "1px solid rgba(99,102,241,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 12px rgba(99,102,241,0.18)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 40% 35%, rgba(139,92,246,0.4) 0%, transparent 65%)" }} />
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none" style={{ position: "relative", zIndex: 1 }}>
                <circle cx="6" cy="6" r="1.5" fill="#818CF8" />
                <circle cx="6" cy="6" r="3.5" stroke="rgba(129,140,248,0.5)" strokeWidth="0.8" fill="none" />
                <circle cx="6" cy="6" r="5.2" stroke="rgba(129,140,248,0.2)" strokeWidth="0.6" fill="none" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: "clamp(13px, 3.5vw, 15px)", color: "#E2E8F0", letterSpacing: "-0.02em", fontFamily: "'Syne', system-ui, sans-serif" }}>
              Inbox<span style={{ color: "#818CF8" }}>Signal</span>
            </span>
          </div>

          {/* Auth nav — right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!isLoaded ? (
              // Skeleton while Clerk loads — prevents layout shift
              <div style={{ width: 120, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)" }} />
            ) : isSignedIn ? (
              // Signed in: show UserButton + "Open App" if not already in app mode
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {!appMode && (
                  <button
                    className="auth-btn-primary"
                    onClick={() => setAppMode(true)}
                  >
                    Open App →
                  </button>
                )}
                <UserButton />
              </div>
            ) : (
              // Signed out: Login + Sign Up
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SignInButton mode="modal" forceRedirectUrl="/">
                  <button className="auth-btn-secondary">Login</button>
                </SignInButton>
                <SignUpButton mode="modal" forceRedirectUrl="/">
                  <button className="auth-btn-primary">Sign Up</button>
                </SignUpButton>
              </div>
            )}
          </div>
        </header>

        {/* ── Landing content ── */}
        {/* If signed in and user clicks Analyze → go to app directly.
            If NOT signed in and user clicks Analyze → trigger Clerk modal.
            We achieve this by wrapping the analyze action in SignInButton when needed. */}
        {isSignedIn ? (
          // Signed in: "Analyze" button launches the app
          <LandingPage onLaunchApp={handleLaunch} />
        ) : (
          // Not signed in: wrap the analyze trigger with Clerk SignInButton modal
          // We pass a custom trigger component into LandingPage via a render-prop pattern
          <LandingPageWithAuth onPostSignIn={handleLaunch} />
        )}
      </div>
    </>
  );
}

// ─── LandingPageWithAuth — unauthenticated variant ────────────────────────────
// Same landing page, but the "Analyze" click opens Clerk sign-in modal.
// After sign-in, Clerk redirects to / which re-renders with isSignedIn=true.

function LandingPageWithAuth({ onPostSignIn }: { onPostSignIn: (email?: string) => void }) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused,  setIsFocused]  = useState(false);
  const [mounted,    setMounted]    = useState(false);
  // We stash the email in sessionStorage so it survives the Clerk redirect
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    // Restore prefill from session storage if user just signed in
    const stashed = sessionStorage.getItem("inboxsignal_prefill");
    if (stashed) {
      sessionStorage.removeItem("inboxsignal_prefill");
      onPostSignIn(stashed);
    }
    return () => clearTimeout(t);
  }, [onPostSignIn]);

  const stashAndSignIn = () => {
    if (inputValue.trim()) {
      sessionStorage.setItem("inboxsignal_prefill", inputValue.trim());
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px 40px", textAlign: "center" }}>

        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
          <SocialProof />
        </div>

        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.65s ease, transform 0.65s ease", transitionDelay: "80ms" }}>
          <h1 style={{ fontSize: "clamp(32px, 8vw, 68px)", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.04em", lineHeight: 1.08, margin: "0 0 18px", fontFamily: "'Syne', system-ui, sans-serif", maxWidth: 720 }}>
            Turn cold emails{" "}
            <span style={{ background: "linear-gradient(135deg, #818CF8 0%, #6366F1 50%, #A78BFA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              into replies.
            </span>
          </h1>
        </div>

        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.65s ease, transform 0.65s ease", transitionDelay: "150ms" }}>
          <p style={{ fontSize: "clamp(14px, 2.5vw, 18px)", color: "#64748B", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 44px" }}>
            InboxSignal analyzes your outreach and tells you exactly why you&apos;re getting ignored — and how to fix it.
          </p>
        </div>

        {/* Input box — Analyze button opens Clerk modal */}
        <div style={{ width: "100%", maxWidth: 640, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.65s ease, transform 0.65s ease", transitionDelay: "220ms" }}>
          <div style={{
            position: "relative",
            background: "rgba(255,255,255,0.025)",
            border: `1px solid ${isFocused ? "rgba(99,102,241,0.55)" : "rgba(255,255,255,0.09)"}`,
            borderRadius: 16,
            boxShadow: isFocused ? "0 0 0 3px rgba(99,102,241,0.10), 0 0 40px rgba(99,102,241,0.08)" : "0 0 40px rgba(0,0,0,0.15)",
            transition: "border-color 0.2s, box-shadow 0.2s",
            overflow: "hidden",
          }}>
            {!inputValue && !isFocused && (
              <div style={{ position: "absolute", top: 18, left: 20, pointerEvents: "none", zIndex: 1 }}>
                <RotatingPlaceholder />
              </div>
            )}

            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows={4}
              placeholder=""
              style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                padding: "18px 20px 64px", color: "#CBD5E1",
                lineHeight: 1.7, fontFamily: "'DM Mono', monospace",
                resize: "none", display: "block", caretColor: "#818CF8",
                fontSize: "16px",
              } as React.CSSProperties}
            />

            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(6,9,14,0.5)",
            }}>
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1E293B", letterSpacing: "0.06em" }}>
                {inputValue.length > 0 ? `${inputValue.length} chars · ` : ""}Sign in to analyze
              </span>
              {/* SignInButton wraps the Analyze button — clicking it opens Clerk modal */}
              <SignInButton mode="modal" forceRedirectUrl="/">
                <button
                  className="analyze-btn"
                  onClick={stashAndSignIn}
                  style={{
                    padding: "8px 20px",
                    background: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
                    color: "#fff", border: "none", borderRadius: 9,
                    fontSize: 13, fontWeight: 700,
                    fontFamily: "'Syne', system-ui, sans-serif",
                    letterSpacing: "-0.01em", cursor: "pointer",
                    minHeight: 36, transition: "filter 0.15s, transform 0.12s",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  Analyze →
                </button>
              </SignInButton>
            </div>
          </div>

          <p style={{ fontSize: 11, color: "#1E293B", fontFamily: "'DM Mono', monospace", marginTop: 10, letterSpacing: "0.05em" }}>
            Free account · 5 analyses per day · No card needed
          </p>
        </div>

        {/* Feature grid */}
        <div style={{ width: "100%", maxWidth: 720, marginTop: 52, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(32px)", transition: "opacity 0.65s ease, transform 0.65s ease", transitionDelay: "320ms" }}>
          <div className="feature-grid">
            <FeatureCard n="01" title="Signal Score" desc="0–100 composite score across clarity, relevance, credibility, and CTA strength." />
            <FeatureCard n="02" title="Failure Diagnosis" desc="Every weak point ranked by severity — Critical, High, Medium, Low." />
            <FeatureCard n="03" title="Optimized Rewrite" desc="A better email with 4 subject line variants, ready to copy and send." />
            <FeatureCard n="04" title="Follow-Up Sequence" desc="Day 3 and Day 7 follow-ups that add a new angle, not just a nudge." />
          </div>
        </div>
      </main>

      <footer style={{ padding: "20px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <span style={{ fontSize: 11, color: "#1E293B", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>
          InboxSignal · Built for founders & operators
        </span>
      </footer>
    </div>
  );
}
