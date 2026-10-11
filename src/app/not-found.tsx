import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ArrowRight } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: { absolute: "Page not found | VerifyRishta" },
};

const TOPICS = [
  {
    href: "/marriage-verification-basics",
    label: "Marriage verification basics",
  },
  { href: "/matrimonial-fraud", label: "Matrimonial fraud" },
  { href: "/for-parents", label: "For parents" },
  { href: "/nri-marriages", label: "NRI marriages" },
];

export default function NotFound() {
  return (
    <Container>
      <section className="max-w-measure py-6 sm:py-12">
        <p className="text-sm font-semibold tracking-wide text-trust uppercase">
          Error 404
        </p>
        <h1 className="mt-3 text-[2rem] leading-tight sm:text-4xl">
          We could not find that page
        </h1>
        <p className="mt-4 text-muted">
          The link may be old or mistyped. The guide you want is probably in one
          of these topics.
        </p>
        <ul className="mt-6 divide-y divide-border rounded-lg border border-border bg-surface">
          {TOPICS.map((topic) => (
            <li key={topic.href}>
              <Link
                href={topic.href}
                className="flex min-h-12 items-center justify-between px-4 hover:bg-surface-2"
              >
                {topic.label}
                <ArrowRight className="text-trust" />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/" className="btn-primary mt-8 w-full sm:w-auto">
          Go to the home page
        </Link>
      </section>
    </Container>
  );
}
