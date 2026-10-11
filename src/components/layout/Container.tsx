import type { ReactNode } from "react";

/** Page gutter and max width shared by every page. */
export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      {children}
    </div>
  );
}
