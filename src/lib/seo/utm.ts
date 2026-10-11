const MSP_HOSTS = new Set(["milnesepehle.in", "www.milnesepehle.in"]);

export const MSP_URL = "https://milnesepehle.in/";

export function isMspUrl(href: string): boolean {
  try {
    return MSP_HOSTS.has(new URL(href).hostname);
  } catch {
    return false;
  }
}

/** UTM convention from CLAUDE.md section 4. Overwrites any hand-written UTMs. */
export function withMspUtm(
  href: string,
  postSlug: string,
  placement: string,
): string {
  const url = new URL(href);
  url.searchParams.set("utm_source", "verifyrishta");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", postSlug);
  url.searchParams.set("utm_content", placement);
  return url.toString();
}
