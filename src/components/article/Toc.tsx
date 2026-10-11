import { ChevronDown } from "@/components/ui/icons";
import type { Post } from "@/content/posts";

type Toc = Post["toc"];

const Links = ({ toc }: { toc: Toc }) => (
  <ul>
    {toc.map((entry) => (
      <li key={entry.id} className={entry.level === 3 ? "pl-4" : undefined}>
        <a
          href={`#${entry.id}`}
          className="flex min-h-11 items-center py-1 text-base leading-snug text-text hover:text-trust hover:underline"
        >
          {entry.text}
        </a>
      </li>
    ))}
  </ul>
);

/** Phones and tablets: collapsed by default, native <details>, no JS. */
export function TocMobile({ toc }: { toc: Toc }) {
  if (toc.length < 3) return null;
  return (
    <details className="group mb-8 rounded-lg border border-border bg-surface lg:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-semibold [&::-webkit-details-marker]:hidden">
        On this page
        <ChevronDown className="text-muted motion-safe:transition-transform group-open:rotate-180" />
      </summary>
      <nav
        aria-label="On this page"
        className="border-t border-border px-4 pb-2"
      >
        <Links toc={toc} />
      </nav>
    </details>
  );
}

/** Desktop: sticky in the side column. */
export function TocDesktop({ toc }: { toc: Toc }) {
  if (toc.length < 3) return null;
  return (
    <nav aria-label="On this page" className="sticky top-6">
      <p className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">
        On this page
      </p>
      <div className="border-l-2 border-border pl-4">
        <Links toc={toc} />
      </div>
    </nav>
  );
}
