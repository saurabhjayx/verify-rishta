import { Scale } from "@/components/ui/icons";
import type { Post } from "@/content/posts";

export function Sources({ sources }: { sources: Post["sources"] }) {
  return (
    <section
      aria-labelledby="sources"
      className="mt-12 border-t border-border pt-8"
    >
      {sources.length > 0 && (
        <>
          <h2 id="sources" className="text-xl leading-snug">
            Sources and further reading
          </h2>
          <ol className="mt-4 list-decimal pl-6 text-base">
            {sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  rel="noopener"
                  className="inline-flex min-h-11 items-center text-trust underline underline-offset-2"
                >
                  {source.title}
                </a>
                <span className="text-muted">
                  , {source.publisher} (accessed {source.accessed})
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
      <p className="mt-6 flex items-start gap-2 rounded-lg bg-surface-2 p-4 text-base text-muted">
        <Scale className="mt-1 shrink-0" />
        This is general information, not legal advice. For your own situation,
        speak to a lawyer.
      </p>
    </section>
  );
}
