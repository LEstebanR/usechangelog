import type { MetadataRoute } from "next";
import { siteDescription } from "./(site)/metadata";
import { brand } from "./(site)/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand,
    short_name: brand,
    description: siteDescription,
    start_url: "/",
    lang: "en",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
