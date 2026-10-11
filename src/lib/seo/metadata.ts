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
  image?: { src: string; width: number; height: number; alt: string };
  /** The route has its own opengraph-image file; do not set images here. */
  hasOgImageFile?: boolean;
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
  // A child's openGraph replaces the parent's, so pages without their own image
  // route get the site image explicitly. Routes with an opengraph-image file must
  // omit the key entirely: even `images: undefined` overrides the file.
  const image =
    input.image ?? (input.hasOgImageFile ? undefined : SITE_OG_IMAGE);
  const images = image
    ? {
        images: [
          {
            url: absoluteUrl(image.src),
            width: image.width,
            height: image.height,
            alt: image.alt,
          },
        ],
      }
    : {};
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
