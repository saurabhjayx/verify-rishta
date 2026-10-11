import Image from "next/image";
import Link from "next/link";
import brandMark from "@/assets/brand-mark.webp";
import { MenuIcon } from "@/components/ui/icons";
import { SITE_NAME } from "@/lib/seo/site";

const NAV = [
  { href: "/marriage-verification-basics", label: "Verification basics" },
  { href: "/matrimonial-fraud", label: "Matrimonial fraud" },
  { href: "/for-parents", label: "For parents" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

// Mobile menu is a native <details>, not a client component: it opens and
// closes without any JavaScript, so it costs 0 KB and works before hydration.
export function Header() {
  return (
    <header className="border-b border-border bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link
          href="/"
          className="tap gap-2 font-serif text-xl font-semibold text-text"
        >
          {/* 96px WebP shown at 32px (3x screens). Pre-sized, so no optimizer needed. */}
          <Image
            src={brandMark}
            alt=""
            width={32}
            height={32}
            unoptimized
            loading="eager"
          />
          {SITE_NAME}
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="tap rounded-md px-3 text-base text-muted hover:bg-surface-2 hover:text-text"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <details className="group relative md:hidden">
          <summary className="tap cursor-pointer list-none gap-2 rounded-md border border-border px-3 text-base text-text [&::-webkit-details-marker]:hidden">
            <MenuIcon />
            Menu
          </summary>
          <nav
            aria-label="Main"
            className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-border bg-surface p-2 shadow-lg"
          >
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-12 items-center rounded-md px-3 text-text hover:bg-surface-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
