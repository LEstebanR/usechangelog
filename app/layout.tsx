import type { Metadata, Viewport } from "next";
import { Funnel_Display, Instrument_Sans } from "next/font/google";
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
  title: "UseChangelog — Tell your users what shipped",
  description:
    "A public changelog and an in-app widget for indie hackers and small product teams.",
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
