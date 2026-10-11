import { ImageResponse } from "next/og";
import { LOGO_FULL_DATA_URL } from "@/assets/brand-images";
import { OG_COLORS, OG_SIZE } from "@/components/seo/OgCard";

export const alt =
  "VerifyRishta: marriage background verification guides for Indian families";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Site-wide share card: full logo on a white panel, headline beside it. */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 56,
        padding: 64,
        background: OG_COLORS.bg,
        color: OG_COLORS.text,
        borderBottom: `16px solid ${OG_COLORS.trust}`,
      }}
    >
      <div
        style={{
          display: "flex",
          background: "#ffffff",
          borderRadius: 24,
          border: `2px solid ${OG_COLORS.border}`,
          padding: 20,
        }}
      >
        <img src={LOGO_FULL_DATA_URL} width={400} height={400} alt="" />
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.12 }}>
          Check a rishta with confidence, not suspicion
        </div>
        <div style={{ fontSize: 30, color: OG_COLORS.muted, lineHeight: 1.4 }}>
          Plain-language guides on marriage background verification in India.
        </div>
      </div>
    </div>,
    size,
  );
}
