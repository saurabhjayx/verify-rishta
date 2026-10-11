// Operator, contact and resource details shared by the footer and legal pages.
// VerifyRishta is an independent venture. Never show a person's full name here.

export const OPERATOR = {
  name: "Verify Rishta Team",
  location: "Pune, Maharashtra, India",
} as const;

export const SUPPORT_EMAIL = "verifyrishta@gmail.com";

/** Shown on /privacy and /terms. Bump when either page changes. */
export const LEGAL_LAST_UPDATED = "11 October 2026";

type ResourceLink = { label: string; href: string };

/** Primary legal texts on India Code. */
export const LEGAL_RESOURCES: ResourceLink[] = [
  {
    label: "DPDP Act, 2023",
    href: "https://indiacode.gov.in/act/c058fa9f-eaf0-4ca3-98f1-3443b087bca9/sections",
  },
  {
    label: "Hindu Marriage Act, 1955",
    href: "https://indiacode.gov.in/act/33e4083a-e967-4091-b91f-915b4d3f95a8/sections",
  },
  {
    label: "Special Marriage Act, 1954",
    href: "https://indiacode.gov.in/act/6b55de27-1d75-4e3d-9613-7d189ab6091e/sections",
  },
  {
    label: "Dowry Prohibition Act, 1961",
    href: "https://indiacode.gov.in/act/8dc8e1b4-7147-45ea-9e82-5911aa3816d4/sections",
  },
  {
    label: "Bharatiya Nyaya Sanhita, 2023",
    href: "https://indiacode.gov.in/act/4bb3e636-ed67-4731-8fb1-7ebfd83e1584/sections",
  },
  {
    label: "Consumer Protection Act, 2019",
    href: "https://indiacode.gov.in/act/1b6c1754-47b1-411e-9607-1712a9caf368/sections",
  },
];

/** Official help (CONTENT_STYLE.md section 5). Re-check quarterly. */
export const HELP_RESOURCES: ResourceLink[] = [
  { label: "Cyber Crime Helpline 1930", href: "tel:1930" },
  {
    label: "National Cyber Crime Reporting Portal",
    href: "https://cybercrime.gov.in/",
  },
  { label: "National Commission for Women", href: "https://www.ncw.gov.in/" },
  {
    label: "MEA: marriages to overseas Indians",
    href: "https://www.mea.gov.in/miinmoi",
  },
  {
    label: "MADAD (help for Indians abroad)",
    href: "https://www.madad.gov.in/",
  },
];
