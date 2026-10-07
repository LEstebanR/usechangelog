import type { Metadata, Viewport } from "next";
import { Funnel_Display, Instrument_Sans } from "next/font/google";
import { brand, hero } from "./content";
import "./globals.css";

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const title = `${brand} — ${hero.headline.replace(/\.$/, "")}`;
const description =
  "A public changelog and an in-app widget for indie hackers and small product teams.";

export const metadata: Metadata = {
  // The production domain; usechangelog.com redirects here.
  metadataBase: new URL("https://www.usechangelog.com"),
  title,
  description,
  openGraph: {
    type: "website",
    siteName: brand,
    title,
    description,
  },
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
      <body>{children}</body>
    </html>
  );
}
