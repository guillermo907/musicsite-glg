import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/content";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default async function Image() {
  const content = await getSiteContent();

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "flex-end",
          background: `radial-gradient(circle at 20% 20%, ${content.theme.accent}66, transparent 340px), linear-gradient(135deg, ${content.theme.background}, #060504)`,
          color: "#fff7ea",
          display: "flex",
          height: "100%",
          padding: 70,
          width: "100%"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ color: content.theme.accent, fontSize: 30, letterSpacing: 6, textTransform: "uppercase" }}>
            Jazz / Blues / Rock Guitar
          </div>
          <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -5, lineHeight: 0.9 }}>
            {content.siteTitle}
          </div>
          <div style={{ color: "#c9bda8", fontSize: 42, maxWidth: 900 }}>{content.subtitle}</div>
        </div>
      </div>
    ),
    size
  );
}
