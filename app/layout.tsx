import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Funnel_Display, Instrument_Sans } from "next/font/google";
import { siteUrl } from "@/lib/site";
import { siteDescription, siteOpenGraph, siteTitle } from "./metadata";
import "./globals.css";

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Production's domain (NEXT_PUBLIC_SITE_URL), or a preview's own URL (#13).
  metadataBase: new URL(siteUrl()),
  title: siteTitle,
  description: siteDescription,
  openGraph: siteOpenGraph,
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${funnelDisplay.variable} ${instrumentSans.variable} antialiased`}
    >
      <body>
        {children}
        {/* Vercel Web Analytics: cookieless page views, only where the project has it enabled. */}
        <Analytics />
      </body>
    </html>
  );
}
