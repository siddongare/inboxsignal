import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "InboxSignal — Cognitive Outbound Forensics & Conversion Diagnostic Engine";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#060709",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "70px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            background: "radial-gradient(ellipse 600px 300px at 50% 30%, rgba(212, 255, 0, 0.14), transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Top Header / Brand Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Mikalai Geometric Icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "#0D0F14",
                border: "1.5px solid rgba(212, 255, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 25px rgba(212, 255, 0, 0.2)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
              >
                <polygon
                  points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"
                  stroke="#D4FF00"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3.2" fill="#D4FF00" />
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.04em" }}>
                InboxSignal
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "#D4FF00",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "3px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(212, 255, 0, 0.3)",
                  background: "rgba(212, 255, 0, 0.08)",
                }}
              >
                Lab
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 24,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.03)",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#D4FF00" }} />
            <span style={{ fontSize: 13, color: "#94A3B8", fontFamily: "monospace", letterSpacing: "0.04em" }}>
              inboxsignal.vercel.app
            </span>
          </div>
        </div>

        {/* Center Headline Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: 960,
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              marginBottom: 18,
            }}
          >
            Eliminate cold outreach blind spots.
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#94A3B8",
              maxWidth: 720,
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
            }}
          >
            Objective B2B failure analysis, 4-vector deterministic scoring, and executive reply synthesis.
          </div>
        </div>

        {/* Bottom Bento Metric Capsules */}
        <div
          style={{
            display: "flex",
            gap: 20,
            width: "100%",
            zIndex: 10,
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "20px 24px",
              borderRadius: 20,
              background: "#0D0F14",
              border: "1px solid rgba(212, 255, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, color: "#D4FF00", fontFamily: "monospace" }}>
              0–100
            </span>
            <span style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace" }}>
              Signal Index
            </span>
          </div>

          <div
            style={{
              flex: 1,
              padding: "20px 24px",
              borderRadius: 20,
              background: "#0D0F14",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, color: "#F43F5E", fontFamily: "monospace" }}>
              4 Vectors
            </span>
            <span style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace" }}>
              Failure Traps
            </span>
          </div>

          <div
            style={{
              flex: 1,
              padding: "20px 24px",
              borderRadius: 20,
              background: "#0D0F14",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, color: "#10B981", fontFamily: "monospace" }}>
              AI Synthesis
            </span>
            <span style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace" }}>
              Conversion Rewrite
            </span>
          </div>

          <div
            style={{
              flex: 1,
              padding: "20px 24px",
              borderRadius: 20,
              background: "#0D0F14",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B", fontFamily: "monospace" }}>
              Day 3 + 7
            </span>
            <span style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace" }}>
              Follow-Up Cadence
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
