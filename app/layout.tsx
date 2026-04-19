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
  return (
    <html lang="en">
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
