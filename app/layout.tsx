import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata, Viewport } from "next";
import "./globals.css";

// ─── SEO & Metadata ──────────────────────────────────────────────────────────
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
  },
  twitter: {
    card: "summary_large_image",
    title: "InboxSignal",
    description: "Turn cold emails into replies with AI diagnostics.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents annoying zoom on iPhone when tapping inputs
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
          colorPrimary: "#ffffff", // Makes buttons sharp white in the auth modal
          colorBackground: "#0a0a0a", // Matches your deep black aesthetic
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className="bg-black text-white">
        <body
          suppressHydrationWarning
          className="bg-black antialiased selection:bg-white/20"
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}