import { BRAND_MARK_DATA_URL } from "@/assets/brand-images";
import { SITE_NAME } from "@/lib/seo/site";

export const OG_SIZE = { width: 1200, height: 630 };

// Light theme tokens from globals.css (share cards are always light).
export const OG_COLORS = {
  bg: "#faf9f6",
  text: "#27272a",
  muted: "#57534e",
  trust: "#0f5f5a",
  border: "#e4e0d8",
};

/** Article share card (next/og supports a CSS subset; every multi-child div needs display:flex). */
export function OgCard({ title, kicker }: { title: string; kicker: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: OG_COLORS.bg,
        color: OG_COLORS.text,
        borderBottom: `16px solid ${OG_COLORS.trust}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> */}
        <img src={BRAND_MARK_DATA_URL} width={72} height={72} alt="" />
        <div style={{ fontSize: 36, fontWeight: 700 }}>{SITE_NAME}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 30, color: OG_COLORS.trust, fontWeight: 700 }}>
          {kicker}
        </div>
        <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.15 }}>
          {title}
        </div>
      </div>
      <div style={{ fontSize: 26, color: OG_COLORS.muted }}>
        verifyrishta.com · marriage verification guides
      </div>
    </div>
  );
}
