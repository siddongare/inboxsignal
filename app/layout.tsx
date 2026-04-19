import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rejection Decoder — Cold Email Failure Diagnosis",
  description:
    "Structured failure diagnosis for B2B cold emails. Understand exactly why your email fails to get replies, then fix it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
