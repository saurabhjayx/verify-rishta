import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/layout/StaticPage";
import {
  OPERATOR,
  LEGAL_LAST_UPDATED,
  LEGAL_RESOURCES,
  SUPPORT_EMAIL,
} from "@/lib/legal";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy policy for VerifyRishta readers",
  description:
    "What data VerifyRishta collects when you read the site, why, who processes it, how long it is kept, and your rights under India's DPDP Act, 2023.",
  path: "/privacy",
});

const DPDP_ACT = LEGAL_RESOURCES.find((r) => r.label.startsWith("DPDP"))?.href;

// Must describe what the site actually does. Update it (and LEGAL_LAST_UPDATED)
// before adding forms, a newsletter, new analytics or ad pixels.
export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy policy" path="/privacy">
      <p>
        <strong>Last updated:</strong> {LEGAL_LAST_UPDATED}
      </p>
      <p>
        VerifyRishta (verifyrishta.com) is an information website. You can read
        every page without creating an account or telling us who you are. This
        policy explains the small amount of data that is still processed when
        you visit, and your rights under the{" "}
        <a href={DPDP_ACT} rel="noopener">
          Digital Personal Data Protection Act, 2023
        </a>{" "}
        (DPDP Act).
      </p>

      <h2>Who we are</h2>
      <p>
        VerifyRishta is an independent website run by the {OPERATOR.name},{" "}
        {OPERATOR.location}. In this policy, &quot;we&quot; and &quot;us&quot;
        mean the {OPERATOR.name}, the Data Fiduciary for the personal data
        described here.
      </p>
      <p>
        This policy covers verifyrishta.com only. Websites we link to have their
        own privacy policies, which apply if you use them.
      </p>

      <h2>What we collect</h2>
      <h3>Data you choose to send us</h3>
      <p>
        The site has no sign-up, comment or contact forms. If you email us, we
        receive your email address and whatever you write, and we use it only to
        reply to you.
      </p>
      <h3>Technical data sent by your browser</h3>
      <p>
        Like every website, our hosting and content delivery providers receive
        standard request data when a page loads: your IP address, browser and
        device type, the page requested, the referring page, and the time. This
        is used to deliver pages, keep the site secure and fix errors.
      </p>
      <h3>Analytics</h3>
      <p>
        We use Google Analytics 4 to understand which articles are useful, but
        only if you click &quot;Allow&quot; in the cookie banner. Until then it
        is not loaded and sets no cookies. Once allowed, it uses cookies to
        record pages viewed, time on page, approximate location (city level),
        device type, how you arrived, and clicks on links to other websites. We
        do not use it to identify you, and we do not combine it with other data
        about you.
      </p>
      <h3>Links to other websites</h3>
      <p>
        Some links from our articles to other websites carry tracking parameters
        (for example, utm_source=verifyrishta). They tell that website which
        article you came from. They contain no personal data about you.
      </p>
      <p>
        We do not use advertising pixels, sell personal data, or build profiles
        of individual readers.
      </p>

      <h2>Why we process it</h2>
      <ul>
        <li>To show you the website and keep it working and secure.</li>
        <li>To measure which articles help readers, so we can improve them.</li>
        <li>To reply when you contact us.</li>
        <li>
          To meet legal obligations, such as responding to lawful requests from
          authorities.
        </li>
      </ul>

      <h2>Who processes it for us</h2>
      <p>
        We use service providers to host the site, deliver pages and measure
        traffic. Today these are our hosting and content delivery providers and
        Google (for Google Analytics). They process data on our instructions.
        Some of them may process data outside India, which the DPDP Act permits
        except for countries the Government of India restricts. We do not share
        personal data with anyone else unless the law requires it.
      </p>

      <h2>Cookies and your choices</h2>
      <p>
        Only Google Analytics sets cookies on this site, and only after you
        allow it. Your choice is saved in your browser&apos;s local storage, not
        in a cookie. You can change or withdraw it at any time with &quot;Cookie
        settings&quot; at the bottom of every page; withdrawing deletes the
        Google Analytics cookies. You can also block or delete cookies in your
        browser settings, or install Google&apos;s{" "}
        <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener">
          Analytics opt-out browser add-on
        </a>
        . The site works normally without them.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>
          Analytics data: up to 14 months, then deleted by Google Analytics.
        </li>
        <li>
          Server and security logs: kept by our providers for a short period,
          usually a few weeks.
        </li>
        <li>
          Emails you send us: as long as needed to deal with your request.
        </li>
      </ul>

      <h2>Your rights</h2>
      <p>Under the DPDP Act you can:</p>
      <ul>
        <li>ask what personal data we hold about you and how we use it;</li>
        <li>ask us to correct, complete or update it;</li>
        <li>
          ask us to erase it, where we no longer need it or the law allows;
        </li>
        <li>
          withdraw consent you have given, as easily as you gave it (for
          analytics, use &quot;Cookie settings&quot; in the footer);
        </li>
        <li>
          nominate someone to exercise these rights if you die or cannot act;
        </li>
        <li>
          raise a grievance with us, and then with the Data Protection Board of
          India if you are not satisfied.
        </li>
      </ul>
      <p>
        Because we do not ask readers for their identity, we may need a little
        information from you to find data that relates to you. We follow the
        Digital Personal Data Protection Rules, 2025 as their provisions come
        into force.
      </p>

      <h2>Children</h2>
      <p>
        This site is written for adults planning a marriage and their families.
        It is not directed at children under 18, and we do not knowingly process
        their personal data.
      </p>

      <h2>Security</h2>
      <p>
        The site is served only over HTTPS with modern security headers. Access
        to our systems is limited to the people who need it. No system is
        perfectly secure, but we will act promptly and notify you and the
        authorities where the law requires if a breach affects your data.
      </p>

      <h2>Grievance Officer and contact</h2>
      <p>
        For any question, request or complaint about your personal data, contact
        the Grievance Officer of the {OPERATOR.name} at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We use the same
        address for every other question.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we change how we handle data, for example by adding a newsletter, we
        will update this page and the date at the top before the change takes
        effect.
      </p>

      <h2>Governing law</h2>
      <p>
        This policy is governed by the laws of India. Courts in Pune,
        Maharashtra have exclusive jurisdiction over disputes arising from it.
        See also our <Link href="/terms">terms of use</Link>.
      </p>
    </StaticPage>
  );
}
