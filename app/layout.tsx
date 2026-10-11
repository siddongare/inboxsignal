import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

// ─── SEO & Metadata ───────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "InboxSignal — AI Cold Email Diagnosis & Optimization",
    template: "%s | InboxSignal",
  },
  description:
    "Diagnose why your cold outreach gets ignored. Get benchmark-calibrated failure analysis across clarity, relevance, credibility, and CTA strength — plus conversion-focused rewrites.",
  openGraph: {
    title: "InboxSignal — AI Cold Email Diagnosis & Optimization",
    description:
      "Diagnose cold outreach failure points in seconds. Get signal score breakdown, actionable fixes, high-converting rewrite, and multi-touch follow-up sequence.",
    type: "website",
    url: "https://inboxsignal.vercel.app",
    siteName: "InboxSignal",
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
      "AI cold outreach diagnostic engine. Signal score, failure analysis, rewrite, and follow-up sequence.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/icon", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest",
  metadataBase: new URL("https://inboxsignal.vercel.app"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
          colorPrimary: "#D4FF00",
          colorBackground: "#060709",
          colorInputBackground: "#0D0F14",
          colorInputText: "#FAFAFA",
          colorText: "#FAFAFA",
          colorTextSecondary: "#94A3B8",
          colorNeutral: "#FAFAFA",
          colorDanger: "#FF2A55",
          fontFamily: "var(--font-sans), system-ui, -apple-system, sans-serif",
          borderRadius: "12px",
        },
        elements: {
          card: {
            background: "#0D0F14",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.9)",
          },
          formButtonPrimary: {
            background: "#D4FF00",
            color: "#000000",
            fontWeight: "700",
            letterSpacing: "0.01em",
          },
          formButtonPrimary__loading: {
            background: "rgba(212, 255, 0, 0.7)",
          },
          formFieldInput: {
            background: "#080A0D",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#FAFAFA",
          },
          formFieldInput__focus: {
            borderColor: "#D4FF00",
            boxShadow: "0 0 0 2px rgba(212, 255, 0, 0.25)",
          },
          formFieldLabel: {
            color: "#94A3B8",
          },
          socialButtonsBlockButton: {
            background: "#18181B",
            border: "1px solid #27272A",
            color: "#FAFAFA",
          },
          socialButtonsBlockButtonText: {
            color: "#FAFAFA",
          },
          dividerText: {
            color: "#71717A",
          },
          headerTitle: { color: "#FAFAFA" },
          headerSubtitle: { color: "#A1A1AA" },
          identityPreviewText: { color: "#FAFAFA" },
          userButtonPopoverCard: {
            background: "#111113",
            border: "1px solid #27272A",
          },
          userButtonPopoverActionButton: {
            color: "#D4D4D8",
          },
          userButtonPopoverActionButton__hover: {
            background: "#18181B",
          },
          footerActionLink: { color: "#60A5FA" },
          footerActionText: { color: "#71717A" },
        },
      }}
    >
      <html
        lang="en"
        suppressHydrationWarning
        className={`${plusJakartaSans.variable} ${geistMono.variable}`}
      >
        <body
          suppressHydrationWarning
          className="bg-[#09090B] text-[#FAFAFA] font-sans antialiased min-h-screen selection:bg-blue-500/20 selection:text-white"
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
