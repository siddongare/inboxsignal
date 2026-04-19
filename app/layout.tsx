import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  },
};

// Separate viewport export — required by Next.js 14+ for proper mobile rendering.
// This ensures `width=device-width, initial-scale=1` is always present.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,   // prevents unwanted iOS zoom on input focus
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ClerkProvider must wrap the entire tree including <html> to prevent
  // hydration mismatches. Placing it inside <body> causes SSR/client
  // divergence because Clerk injects context before the first render.
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>{children}</body>
      </html>
    </ClerkProvider>
  );
}
