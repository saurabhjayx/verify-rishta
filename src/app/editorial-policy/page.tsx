import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { SUPPORT_EMAIL } from "@/lib/legal";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Editorial policy: how VerifyRishta writes and checks",
  description:
    "How VerifyRishta articles are written, sourced, reviewed and corrected, and the rules we follow for statistics, laws and composite examples.",
  path: "/editorial-policy",
});

// TODO(Saurabh): review this copy before launch.
export default function EditorialPolicyPage() {
  return (
    <StaticPage title="Editorial policy" path="/editorial-policy">
      <p>These are the rules every article on VerifyRishta follows.</p>
      <h2>Authors, updates and review dates</h2>
      <p>
        Every article shows who wrote it, with an author page, and when it was
        last updated. When an article has been reviewed, we show the review
        date, and the reviewer&apos;s name when there is one.
      </p>
      <h2>Sources</h2>
      <p>
        Every statistic links to its source, or is clearly marked as first-hand
        data with where it came from. Laws and official processes are checked
        against primary sources such as India Code and government portals.
      </p>
      <h2>Examples and experience</h2>
      <p>
        We never invent cases, quotes or testimonials. Illustrative stories are
        labelled as composite examples. First-hand insights are based on real
        verifications and are labelled as such.
      </p>
      <h2>Independence</h2>
      <p>
        VerifyRishta is independent, and our disclosure explains the one service
        our founder is connected to. That makes fairness our job, not an
        afterthought. We recommend what fits the reader: often that is doing the
        checks yourselves, sometimes a lawyer, the police or an official portal,
        and sometimes a paid service. Comparisons list real trade-offs,
        including what any service we mention does not do. If an article would
        only make sense as an advert, we do not publish it.
      </p>
      <h2>Not legal advice</h2>
      <p>
        Our articles are general information, not legal advice. For your own
        situation, speak to a lawyer.
      </p>
      <h2>Updates</h2>
      <p>
        We review our most read articles regularly, update them when facts
        change, and show the new review date. Spotted an error? Email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </StaticPage>
  );
}
