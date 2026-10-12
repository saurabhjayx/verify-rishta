import type { Metadata } from "next";
import { SITE_NAME, absoluteUrl } from "./site";

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedAt?: Date;
  updatedAt?: Date;
  authorName?: string;
  /** Share image (JPEG or PNG; social apps do not all accept WebP). Defaults to the site card. */
  image?: { src: string; width: number; height: number; alt: string };
  noindex?: boolean;
};

const SITE_OG_IMAGE = {
  src: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME}`,
};

/** Every page's metadata goes through here: absolute canonical, OG, Twitter, en_IN. */
export function buildMetadata(input: MetadataInput): Metadata {
  const url = absoluteUrl(input.path);
  // A child's openGraph replaces the parent's, so every page sets its image explicitly.
  const image = input.image ?? SITE_OG_IMAGE;
  const images = {
    images: [
      {
        url: absoluteUrl(image.src),
        width: image.width,
        height: image.height,
        alt: image.alt,
      },
    ],
  };
  const common = {
    url,
    title: input.title,
    description: input.description,
    siteName: SITE_NAME,
    locale: "en_IN",
    ...images,
  };

  return {
    title: { absolute: input.title },
    description: input.description,
    alternates: { canonical: url },
    openGraph:
      input.type === "article"
        ? {
            ...common,
            type: "article",
            publishedTime: input.publishedAt?.toISOString(),
            modifiedTime: input.updatedAt?.toISOString(),
            authors: input.authorName ? [input.authorName] : undefined,
          }
        : { ...common, type: "website" },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      ...images,
    },
    // Explicit on every page. Links are always followed, even on noindex pages.
    robots: input.noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
