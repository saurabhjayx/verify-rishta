import Link from "next/link";

export type Crumb = { name: string; path: string };

/**
 * Last crumb is the current page. On phones it is hidden (the H1 right below
 * says the same), so the trail never wraps into a stray separator.
 * The full list still feeds BreadcrumbList JSON-LD.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li
              key={item.path}
              className={
                isLast
                  ? "hidden min-w-0 items-center sm:flex"
                  : "flex items-center"
              }
            >
              {i > 0 && (
                <span aria-hidden="true" className="px-1.5">
                  /
                </span>
              )}
              {isLast ? (
                <span aria-current="page" className="truncate">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="tap hover:text-text hover:underline"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
