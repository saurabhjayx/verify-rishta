import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";

// Served at /manifest.webmanifest and linked from every page by Next.
// Colours match the light theme tokens in globals.css (--bg).
const ICON_192 = {
  src: "/icons/icon-192.png",
  sizes: "192x192",
  type: "image/png",
};

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE_NAME}: marriage background verification guides`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: "en-IN",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    background_color: "#faf9f6",
    theme_color: "#faf9f6",
    categories: ["education", "lifestyle", "books"],
    prefer_related_applications: false,
    icons: [
      { ...ICON_192, purpose: "any" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Mark padded into the central safe zone so Android launchers can crop to any shape.
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Marriage verification basics",
        short_name: "Basics",
        description:
          "What marriage background verification checks and how to do it with consent.",
        url: "/marriage-verification-basics",
        icons: [ICON_192],
      },
      {
        name: "Matrimonial fraud",
        short_name: "Fraud",
        description:
          "Red flags in a profile and what to do if you have been cheated.",
        url: "/matrimonial-fraud",
        icons: [ICON_192],
      },
      {
        name: "For parents",
        short_name: "Parents",
        description:
          "How to check a rishta respectfully and ask the other family for documents.",
        url: "/for-parents",
        icons: [ICON_192],
      },
    ],
  };
}
