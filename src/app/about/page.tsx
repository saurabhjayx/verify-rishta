import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/layout/StaticPage";
import { OPERATOR } from "@/lib/legal";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About VerifyRishta: an independent guide for families",
  description:
    "VerifyRishta explains marriage background verification in India in plain language. It is an independent site, free to read, with no sign-up.",
  path: "/about",
});

// TODO(Saurabh): review this copy before launch.
export default function AboutPage() {
  return (
    <StaticPage title="About VerifyRishta" path="/about">
      <p>
        VerifyRishta helps Indian families check that a rishta is what it claims
        to be, without hiring a detective or insulting the other family. We
        explain what can be verified, how to ask for it with consent, and what
        to do when something does not add up.
      </p>
      <h2>Who publishes this site</h2>
      <p>
        VerifyRishta is an independent venture run by the {OPERATOR.name}. It is
        free to read, with no sign-up and no paid placements. Read our{" "}
        <Link href="/disclosure">disclosure</Link> to see how we handle
        recommendations.
      </p>
      <h2>How we write</h2>
      <p>
        Every article shows who wrote it, when it was last updated, and links to
        its sources. When an article has been reviewed, we show the review date.
        Laws and official processes are checked against primary sources. Our{" "}
        <Link href="/editorial-policy">editorial policy</Link> explains the
        rules we follow.
      </p>
    </StaticPage>
  );
}
