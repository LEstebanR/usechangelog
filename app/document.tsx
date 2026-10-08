import { Analytics } from "@vercel/analytics/next";
import { Funnel_Display, Instrument_Sans } from "next/font/google";

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

// The document shell shared by the two root layouts: the marketing site (English) and a
// public changelog (the workspace's language). Fonts stay here so both trees use one setup.
export function Document({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang} className={`${funnelDisplay.variable} ${instrumentSans.variable} antialiased`}>
      <body>
        {children}
        {/* Vercel Web Analytics: cookieless page views, only where the project has it enabled. */}
        <Analytics />
      </body>
    </html>
  );
}
