"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Client island: the only way to reveal more cards as the reader scrolls is an
// IntersectionObserver in the browser. The cards themselves are server-rendered
// and passed in as nodes, so this ships just the observer and a counter.
export function InfiniteList({
  items,
  pageSize = 12,
}: {
  items: ReactNode[];
  pageSize?: number;
}) {
  const [count, setCount] = useState(pageSize);
  const sentinel = useRef<HTMLDivElement>(null);
  const done = count >= items.length;

  useEffect(() => {
    const el = sentinel.current;
    if (done || !el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting))
          setCount((c) => c + pageSize);
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [done, pageSize]);

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, count).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      {!done && <div ref={sentinel} aria-hidden className="h-px" />}
    </>
  );
}
