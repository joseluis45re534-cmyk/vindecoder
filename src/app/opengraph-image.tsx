import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// Intentionally NOT `runtime = "edge"`: keeping this static makes Next prerender
// the OG image to a PNG at build time, so the ~1.4 MB Satori/resvg WASM is a
// build-only dependency and never ships inside the Cloudflare Worker bundle
// (which must stay under the 3 MiB free-plan size limit).
export const dynamic = "force-static";
export const alt = `${SITE_NAME} — instant U.S. vehicle history reports by VIN`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          color: "white",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 36, opacity: 0.85, marginBottom: 24 }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1 }}>
          {SITE_TAGLINE}
        </div>
        <div style={{ fontSize: 32, opacity: 0.85, marginTop: 28 }}>
          Title brands · Salvage · Theft · Liens · Odometer — all 50 states
        </div>
      </div>
    ),
    { ...size }
  );
}
