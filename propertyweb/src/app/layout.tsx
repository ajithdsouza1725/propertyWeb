import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { ScrollAnimateObserver } from "@/components/ui/scroll-animate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MangaloreHomes — Buy & List Property in Mangalore",
    template: "%s — MangaloreHomes",
  },
  description:
    "Discover verified properties across Kadri, Bejai, Kottara, Attavar and more. Buy, list and manage enquiries — all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        {children}
        <ScrollAnimateObserver />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
