import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
  title: {
    default: "InboxSignal",
    template: "%s | InboxSignal",
  },
  description: "AI-powered email audit tool to boost replies.",
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
