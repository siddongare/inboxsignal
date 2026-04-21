import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata, Viewport } from "next";
import "./globals.css";

// ─── SEO & Metadata ───────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "InboxSignal — Turn cold emails into replies",
    template: "%s | InboxSignal",
  },
  description:
    "AI-powered cold email diagnosis. Find out exactly why your outreach isn't getting replies — and get a rewrite that fixes it.",
  openGraph: {
    title: "InboxSignal — Turn cold emails into replies",
    description:
      "Diagnose your cold email in seconds. Signal score, failure analysis, rewrite, and follow-up sequence.",
    type: "website",
    url: "https://inboxsignal.vercel.app",
    siteName: "InboxSignal",
    // OG image served from app/opengraph-image.tsx (next/og)
    // Create: app/opengraph-image.tsx with ImageResponse
    // Design direction: pure black card, Geist Mono font, large "InboxSignal"
    // wordmark top-left, the tagline "Turn cold emails into replies." center,
    // and a subtle monochrome signal-strength bar graphic bottom-right.
    // Keep the entire image #000 bg / white type to match the app aesthetic.
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "InboxSignal — Turn cold emails into replies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InboxSignal — Turn cold emails into replies",
    description:
      "AI cold email diagnosis. Score, rewrite, and follow-up sequence — free.",
    images: ["/opengraph-image"],
  },
  metadataBase: new URL("https://inboxsignal.vercel.app"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevent iOS zoom-on-focus
};

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          // Core palette — everything is white-on-black
          colorPrimary: "#ffffff",
          colorBackground: "#080808",
          colorInputBackground: "#111111",
          colorInputText: "#f0f0f0",
          colorText: "#ededed",
          colorTextSecondary: "rgba(255,255,255,0.45)",
          colorNeutral: "#ffffff",
          colorDanger: "#ff6b6b",
          // Typography
          fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
          borderRadius: "8px",
        },
        elements: {
          // Card / modal container
          card: {
            background: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
          },
          // All button text, input labels, form labels → full white
          formButtonPrimary: {
            background: "rgba(255,255,255,0.92)",
            color: "#000000",
            fontWeight: "700",
            letterSpacing: "0.04em",
          },
          formButtonPrimary__loading: {
            background: "rgba(255,255,255,0.6)",
          },
          // Input fields
          formFieldInput: {
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#f0f0f0",
          },
          formFieldInput__focus: {
            borderColor: "rgba(255,255,255,0.4)",
            boxShadow: "0 0 0 2px rgba(255,255,255,0.08)",
          },
          formFieldLabel: {
            color: "rgba(255,255,255,0.6)",
          },
          // Social auth buttons (Google, GitHub etc.)
          socialButtonsBlockButton: {
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "#ededed",
          },
          socialButtonsBlockButtonText: {
            color: "#ededed",
          },
          // Divider text "or"
          dividerText: {
            color: "rgba(255,255,255,0.28)",
          },
          // Header / footer links
          headerTitle: { color: "#ededed" },
          headerSubtitle: { color: "rgba(255,255,255,0.42)" },
          identityPreviewText: { color: "#ededed" },
          identityPreviewEditButtonIcon: { color: "rgba(255,255,255,0.45)" },
          // Navbar / user button popup
          userButtonPopoverCard: {
            background: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.09)",
          },
          userButtonPopoverActionButton: {
            color: "rgba(255,255,255,0.7)",
          },
          userButtonPopoverActionButton__hover: {
            background: "rgba(255,255,255,0.04)",
          },
          // Footer
          footerActionLink: { color: "rgba(255,255,255,0.45)" },
          footerActionText: { color: "rgba(255,255,255,0.28)" },
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning className="bg-black antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
