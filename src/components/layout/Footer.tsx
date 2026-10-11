import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import logoFull from "@/assets/logo-full.webp";
import { HELP_RESOURCES, LEGAL_RESOURCES } from "@/lib/legal";
import { SITE_NAME } from "@/lib/seo/site";

const SITE_LINKS = [
  { href: "/about", label: "About" },
  { href: "/editorial-policy", label: "Editorial policy" },
  { href: "/disclosure", label: "Disclosure" },
  { href: "/feed.xml", label: "RSS" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of use" },
];

type LinkItem = { label: string; href: string };

const linkClass = "flex min-h-11 items-center hover:text-text hover:underline";

// <p>, not <h2>: footer labels must not enter the page's heading outline.
function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold tracking-wide text-text uppercase">
        {title}
      </p>
      <ul>{children}</ul>
    </div>
  );
}

const external = (items: LinkItem[]) =>
  items.map((item) => (
    <li key={item.href}>
      <a href={item.href} rel="noopener" className={linkClass}>
        {item.label}
      </a>
    </li>
  ));

const internal = (items: LinkItem[]) =>
  items.map((item) => (
    <li key={item.href}>
      <Link href={item.href} className={linkClass}>
        {item.label}
      </Link>
    </li>
  ));

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface-2">
      <div className="mx-auto max-w-6xl px-4 py-10 text-base text-muted sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* The logo has dark text on white, so it sits on a white tile in both themes. */}
          <Link
            href="/"
            className="shrink-0 self-start rounded-lg bg-white p-3"
          >
            {/* 480px WebP shown at 160px (3x screens). Pre-sized, so no optimizer needed. */}
            <Image
              src={logoFull}
              alt={`${SITE_NAME}: trust builds stronger rishtas`}
              width={160}
              height={130}
              unoptimized
            />
          </Link>
          <p className="max-w-measure text-text">
            {SITE_NAME} is an independent guide to marriage background
            verification in India. Articles are general information, not legal
            advice.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Column title="VerifyRishta">{internal(SITE_LINKS)}</Column>
          <Column title="Legal">
            {internal(LEGAL_LINKS)}
            {/* Shown by the consent script (production host only); reopens the banner. */}
            <li>
              <button
                type="button"
                data-consent-open
                hidden
                className={`${linkClass} cursor-pointer`}
              >
                Cookie settings
              </button>
            </li>
          </Column>
          <Column title="Legal resources">{external(LEGAL_RESOURCES)}</Column>
          <Column title="Get help">{external(HELP_RESOURCES)}</Column>
        </div>
        <p className="mt-8 border-t border-border pt-6 text-sm">
          © {SITE_NAME} | All rights reserved.
        </p>
      </div>
    </footer>
  );
}
