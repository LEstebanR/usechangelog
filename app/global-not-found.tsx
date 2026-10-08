import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { Document } from "./document";
import NotFound from "./(site)/not-found";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Page not found — UseChangelog",
};

// Unmatched URLs skip the root layouts, so this document sets lang itself.
export default function GlobalNotFound() {
  return (
    <Document lang="en">
      <NotFound />
    </Document>
  );
}
