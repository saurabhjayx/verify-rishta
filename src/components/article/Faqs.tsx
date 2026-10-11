import { ChevronDown } from "@/components/ui/icons";
import type { Post } from "@/content/posts";

/** Accordion on native <details>: no JS. Answers stay in the HTML for crawlers. */
export function Faqs({ faqs }: { faqs: Post["faqs"] }) {
  if (faqs.length === 0) return null;
  return (
    <section aria-labelledby="faqs" className="mt-12">
      <h2 id="faqs" className="text-2xl leading-snug sm:text-[1.75rem]">
        Frequently asked questions
      </h2>
      <div className="mt-5 divide-y divide-border rounded-lg border border-border bg-surface">
        {faqs.map((faq) => (
          <details key={faq.q} className="group px-4">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
              <h3 className="font-sans text-lg leading-snug font-semibold">
                {faq.q}
              </h3>
              <ChevronDown className="shrink-0 text-muted motion-safe:transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-4">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
