import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Unmatched URLs have no single root layout (the marketing site and a changelog are separate
  // documents), so the global 404 owns the <html> tag, including lang.
  experimental: { globalNotFound: true },
  // The share image route reads its fonts from disk (#73); ship them with it.
  outputFileTracingIncludes: { "/[slug]/og": ["./assets/fonts/**"] },
  async redirects() {
    // The sign-up CTA (#9) points here; new and returning users share one magic link flow.
    return [{ source: "/signup", destination: "/sign-in", permanent: false }];
  },
};

export default nextConfig;
