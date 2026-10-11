import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/layout/StaticPage";
import { OPERATOR, LEGAL_LAST_UPDATED, SUPPORT_EMAIL } from "@/lib/legal";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Terms of use for the VerifyRishta website",
  description:
    "The terms for using VerifyRishta: articles are general information, not legal advice, plus our rules on content reuse, outside links and liability.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <StaticPage title="Terms of use" path="/terms">
      <p>
        <strong>Last updated:</strong> {LEGAL_LAST_UPDATED}
      </p>
      <p>
        These terms apply when you use verifyrishta.com
        (&quot;VerifyRishta&quot;), operated by the {OPERATOR.name}{" "}
        (&quot;we&quot;, &quot;us&quot;). By using the site you agree to them.
        If you do not agree, please do not use the site.
      </p>

      <h2>1. Information, not legal advice</h2>
      <p>
        Everything on VerifyRishta is general information about marriage
        background verification in India. It is not legal, financial or
        professional advice, and reading it does not create a lawyer and client
        relationship. Laws and official processes change, and every
        family&apos;s situation is different. For decisions that matter, speak
        to a qualified lawyer. If you face fraud, threats or violence, contact
        the police or the official helplines listed in our footer.
      </p>

      <h2>2. Accuracy</h2>
      <p>
        We check laws and official processes against primary sources and show a
        &quot;last reviewed&quot; date on each article (see our{" "}
        <Link href="/editorial-policy">editorial policy</Link>). Even so, we
        cannot promise that every article is complete, current or right for your
        situation. You use the information at your own judgement.
      </p>
      <p>
        Stories marked &quot;composite example&quot; are illustrations built
        from common patterns. They do not describe real people.
      </p>

      <h2>3. Verifying other people</h2>
      <p>
        Our articles explain consent-based verification. You are responsible for
        following the law when you collect or check anyone&apos;s personal
        information, including the Digital Personal Data Protection Act, 2023.
        Do not use anything on this site to harass, stalk, defame or
        discriminate against anyone.
      </p>

      <h2>4. Outside links</h2>
      <p>
        Some articles link to other websites, including government portals and
        verification services (see our{" "}
        <Link href="/disclosure">disclosure</Link>). Those websites have their
        own terms and privacy policies, and we are not responsible for them. Any
        service you buy from another website is governed by that website&apos;s
        terms, not these terms.
      </p>

      <h2>5. Using our content</h2>
      <p>
        The articles, design and graphics on VerifyRishta belong to the{" "}
        {OPERATOR.name}. You are welcome to share links and to quote short
        extracts with a link back to the article. Please do not republish full
        articles, or present our content as your own, without written
        permission.
      </p>

      <h2>6. Acceptable use</h2>
      <p>
        Do not try to disrupt the site, get around its security, or use it for
        anything unlawful. Search engines and AI crawlers may index the site as
        described in our robots.txt file.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        VerifyRishta is a free information service provided &quot;as is&quot;.
        To the extent the law allows, we are not liable for any loss or damage
        arising from your use of the site or from decisions you make based on
        it, including indirect or consequential loss. Nothing in these terms
        limits liability that cannot be limited under Indian law.
      </p>

      <h2>8. Privacy</h2>
      <p>
        Our <Link href="/privacy">privacy policy</Link> explains what data is
        processed when you use the site and your rights.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update these terms. The date at the top shows when they last
        changed. Continuing to use the site after a change means you accept the
        updated terms.
      </p>

      <h2>10. Governing law and disputes</h2>
      <p>
        These terms are governed by the laws of India. Courts in Pune,
        Maharashtra have exclusive jurisdiction over any dispute arising from
        them.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions or grievances about these terms: the {OPERATOR.name} at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </StaticPage>
  );
}
