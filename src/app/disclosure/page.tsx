import type { Metadata } from "next";
import { MSP_URL, withMspUtm } from "@/lib/seo/utm";
import { StaticPage } from "@/components/layout/StaticPage";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Disclosure: how VerifyRishta keeps recommendations fair",
  description:
    "How VerifyRishta handles recommendations and outbound links, including the one service its founder is connected to, and the rules we follow.",
  path: "/disclosure",
});

// TODO(Saurabh): review this copy before launch.
export default function DisclosurePage() {
  return (
    <StaticPage title="Disclosure" path="/disclosure">
      <p>
        VerifyRishta is an independent venture. Its founder also founded{" "}
        <a href={withMspUtm(MSP_URL, "site", "disclosure")}>Milne Se Pehle</a>,
        a consent-based verification service that some articles mention. We want
        you to know this before you read any recommendation on this site.
      </p>
      <h2>What this means for our articles</h2>
      <ul>
        <li>
          The first answer in every article is about your question, never about
          a service.
        </li>
        <li>
          When we mention a paid service, we also name the other options: doing
          the checks yourselves, a lawyer, official portals, or another
          verification service.
        </li>
        <li>An article links to Milne Se Pehle at most three times.</li>
        <li>
          Some outbound links carry tracking parameters, so we can see which
          articles help readers.
        </li>
        <li>
          Every article must be useful to a reader who never clicks through to
          any service.
        </li>
        <li>
          We say what self-verification cannot catch, and when a lawyer or the
          police is the right call.
        </li>
      </ul>
      <h2>What we do not do</h2>
      <p>
        We do not name and shame other agencies, platforms or people. We
        criticise practices, not entities. We do not publish fabricated reviews,
        testimonials or case studies.
      </p>
    </StaticPage>
  );
}
