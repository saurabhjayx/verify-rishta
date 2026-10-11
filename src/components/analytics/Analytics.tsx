import Link from "next/link";
import Script from "next/script";

/**
 * Cookie consent + GA4 + the `msp_click` event, with no React client component
 * and no cost to page speed:
 * - Nothing loads and no cookie is set until the reader clicks "Allow".
 * - The banner is static HTML, revealed by the inline script on the reader's
 *   first interaction (scroll, tap, key, mouse move). Tracking needs consent
 *   anyway, so there is nothing to gain from showing it earlier, and lab tools
 *   (Lighthouse, PageSpeed) never interact: no LCP candidate, no layout shift.
 * - The choice lives in localStorage ("vr-consent"), not a cookie. "Cookie
 *   settings" in the footer reopens the banner; withdrawing deletes the _ga
 *   cookies and reloads so gtag.js stops.
 * - Runs only on the production host: localhost, previews and CI send no hits.
 * The msp_click listener reads placement and post slug from the UTMs the
 * markdown pipeline puts on every milnesepehle.in link.
 */
export function Analytics({ gaId, host }: { gaId?: string; host: string }) {
  if (!gaId) return null;
  // Both values are validated in src/env.ts; JSON.stringify keeps them inert.
  const id = JSON.stringify(gaId);
  return (
    <>
      {/* Thin strip fixed to the bottom edge: overlays nothing important and
          never moves page content. Buttons keep a 44px tap height. */}
      <div
        id="consent-banner"
        hidden
        role="region"
        aria-label="Cookie consent"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgb(0_0_0/0.06)]"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-1 text-sm sm:px-6">
          <p className="min-w-0 flex-1 leading-snug text-text">
            Analytics cookies only if you allow.{" "}
            <Link
              href="/privacy"
              className="text-trust underline underline-offset-2"
            >
              Privacy
            </Link>
          </p>
          {/* Equal weight on purpose: rejecting must be as easy as allowing. */}
          <button
            type="button"
            data-consent="denied"
            className="tap shrink-0 rounded-md px-3 font-semibold text-trust hover:bg-surface-2"
          >
            Reject
          </button>
          <button
            type="button"
            data-consent="granted"
            className="tap shrink-0 rounded-md px-3 font-semibold text-trust hover:bg-surface-2"
          >
            Allow
          </button>
        </div>
      </div>
      <Script id="ga-init" strategy="afterInteractive">{`
(function () {
  if (location.hostname !== ${JSON.stringify(host)}) return;
  var KEY = "vr-consent";
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  var banner = document.getElementById("consent-banner");
  if (!banner) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  var loaded = false;
  function loadGa() {
    if (loaded) return;
    loaded = true;
    gtag("js", new Date());
    gtag("config", ${id});
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + ${id};
    document.head.appendChild(s);
  }

  function clearGaCookies() {
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (!/^_ga/.test(name)) return;
      ["", "; domain=" + location.hostname, "; domain=." + location.hostname].forEach(function (d) {
        document.cookie = name + "=; Max-Age=0; path=/" + d;
      });
    });
  }
  if (get() === "denied") clearGaCookies(); // leftovers from before a withdrawal

  var events = ["pointerdown", "keydown", "scroll", "touchstart", "mousemove"];
  function onFirstInteraction() {
    events.forEach(function (e) { removeEventListener(e, onFirstInteraction); });
    var choice = get();
    if (choice === "granted") loadGa();
    else if (choice !== "denied") banner.hidden = false;
  }
  events.forEach(function (e) { addEventListener(e, onFirstInteraction, { passive: true }); });

  function choose(value) {
    var previous = get();
    set(value);
    banner.hidden = true;
    if (value === "granted") return loadGa();
    if (previous === "granted") {
      // Stop gtag.js first: it rewrites its cookie on page hide otherwise.
      window["ga-disable-" + ${id}] = true;
      gtag("consent", "update", { analytics_storage: "denied" });
      clearGaCookies();
      location.reload();
    }
  }
  banner.querySelectorAll("[data-consent]").forEach(function (b) {
    b.addEventListener("click", function () { choose(b.getAttribute("data-consent")); });
  });
  document.querySelectorAll("[data-consent-open]").forEach(function (b) {
    b.hidden = false;
    b.addEventListener("click", function () {
      banner.hidden = false;
      var first = banner.querySelector("button");
      if (first) first.focus();
    });
  });

  document.addEventListener("click", function (e) {
    if (!loaded) return;
    var a = e.target instanceof Element && e.target.closest('a[href*="milnesepehle.in"]');
    if (!a) return;
    var u = new URL(a.href);
    gtag("event", "msp_click", {
      placement: u.searchParams.get("utm_content") || "other",
      post_slug: u.searchParams.get("utm_campaign") || location.pathname,
      transport_type: "beacon"
    });
  });
})();`}</Script>
    </>
  );
}
