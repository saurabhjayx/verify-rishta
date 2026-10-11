const ENDPOINT = "https://api.indexnow.org/indexnow";

/** IndexNow body. The key file must be served at keyLocation (public/<key>.txt). */
export function indexNowPayload(urls: string[], key: string, siteUrl: string) {
  return {
    host: new URL(siteUrl).host,
    key,
    keyLocation: `${siteUrl}/${key}.txt`,
    urlList: urls,
  };
}

/** Pings Bing/Yandex (via IndexNow) about changed URLs. Google relies on the sitemap. */
export async function pingIndexNow(
  urls: string[],
  key: string,
  siteUrl: string,
): Promise<void> {
  if (urls.length === 0) return;
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(indexNowPayload(urls, key, siteUrl)),
  });
  // 200 OK and 202 Accepted are both success.
  if (!res.ok) throw new Error(`IndexNow ${res.status}: ${await res.text()}`);
}
