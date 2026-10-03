import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The sign-up CTA (#9) points here; new and returning users share one magic link flow.
    return [{ source: "/signup", destination: "/sign-in", permanent: false }];
  },
};

export default nextConfig;
