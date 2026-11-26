import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Unmatched URLs have no single root layout (the marketing site and a changelog are separate
  // documents), so the global 404 owns the <html> tag, including lang.
  experimental: { globalNotFound: true },
  // The share image route reads its fonts from disk (#73); ship them with it.
  // The key is "/*/og", not "/[slug]/og": Turbopack reads it as a glob and can't match a
  // literal [slug], so that key silently matched nothing (#87). A slug has no "/", so
  // "/*/og" is only that route.
  outputFileTracingIncludes: { "/*/og": ["./assets/fonts/**"] },
  // next/og imports sharp only if it's there and otherwise renders with the resvg wasm Next ships.
  // sharp and libvips are ~20 MB of that function's ~25 MB, so leave them out (#87).
  outputFileTracingExcludes: { "/*/og": ["./node_modules/sharp/**", "./node_modules/@img/**"] },
  async redirects() {
    // The sign-up CTA (#9) points here; new and returning users share one magic link flow.
    return [{ source: "/signup", destination: "/sign-in", permanent: false }];
  },
};

export default nextConfig;
