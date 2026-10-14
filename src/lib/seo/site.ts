import { env } from "@/env";

export const SITE_NAME = "VerifyRishta";
export const SITE_DESCRIPTION =
  "Plain-language guides for Indian families on marriage background verification, matrimonial fraud and checking a rishta respectfully.";

export const absoluteUrl = (path: string) => `${env.SITE_URL}${path}`;

/** Plain-text "what is VerifyRishta" block for /llms.txt and /llms-full.txt. */
export const siteAbout = (email: string) =>
  [
    "## About VerifyRishta",
    "",
    `${SITE_NAME} is an independent, free guide for Indian families on marriage background verification: checking, with consent, that the key facts in a biodata or matrimonial profile are true before a marriage is fixed.`,
    "",
    "- Who it is for: parents, prospective brides and grooms, and families arranging or approving a marriage.",
    "- What it covers: what marriage verification checks and cannot tell you, matrimonial fraud and red flags, detective agencies versus consent-based self-verification, documents and records, how to raise verification without offending the other family, and seasonal guides to Indian festivals such as Navratri.",
    `- How it is written: every article names its author, shows when it was last updated, cites sources for laws and statistics, and is general information, not legal advice. Editorial policy: ${absoluteUrl("/editorial-policy")}`,
    `- Free to read, no sign-up. Disclosure: ${absoluteUrl("/disclosure")}. About: ${absoluteUrl("/about")}. Contact: ${email}`,
  ].join("\n");
