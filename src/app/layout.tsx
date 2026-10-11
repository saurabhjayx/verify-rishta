import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import { Analytics } from "@/components/analytics/Analytics";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { env } from "@/env";
import { SITE_NAME, absoluteUrl } from "@/lib/seo/site";
import "./globals.css";

// Every route must render to complete static HTML (CLAUDE.md rule 1). The build
// fails on uncached data or request-time APIs, and a URL not prerendered at build
// blocks on first request until the full page exists, instead of an empty shell.
export const ensureStatic = "navigation";

// Two families, both with matching Devanagari versions for the Hindi section
// (Noto Sans covers Devanagari itself; headings will pair with Noto Serif
// Devanagari). display:optional, not swap: a late swap repaints text and pushes
// LCP; the size-adjusted fallback keeps CLS at zero when the font misses.
const body = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "optional",
});
const heading = Noto_Serif({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-heading",
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  applicationName: SITE_NAME,
  alternates: { types: { "application/rss+xml": absoluteUrl("/feed.xml") } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#121414" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${body.variable} ${heading.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        {/* Never in `next dev`: no script, no banner, no hits. */}
        {process.env.NODE_ENV === "production" && (
          <Analytics
            gaId={env.NEXT_PUBLIC_GA_ID}
            host={new URL(env.SITE_URL).hostname}
          />
        )}
      </body>
    </html>
  );
}
