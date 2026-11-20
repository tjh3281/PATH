import { ImageResponse } from "next/og";

import { LogoImage } from "@/components/brand/logo-image";

// Link preview card shown by WhatsApp, Telegram, Discord and similar apps for every page.
export const alt = "PathFinder FCSIT: find your best-fit FCSIT programme";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 64,
        padding: "0 96px",
        background:
          // Fade each glow to its own colour at zero alpha: "transparent" is transparent black
          // to the image renderer and would grey out the card.
          "radial-gradient(circle at 8% 0%, rgba(230, 201, 251, 1) 0%, rgba(230, 201, 251, 0) 55%), radial-gradient(circle at 100% 10%, rgba(207, 214, 255, 1) 0%, rgba(207, 214, 255, 0) 55%), #f4efff",
        color: "#24124a",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 280,
          height: 280,
          borderRadius: 64,
          background: "#ffffff",
          border: "2px solid #ece4ff",
          boxShadow: "0 30px 60px -20px rgba(108, 43, 217, 0.4)",
        }}
      >
        <LogoImage size={200} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>
          PathFinder
        </div>
        <div style={{ marginTop: 12, fontSize: 40, fontWeight: 600, color: "#6c2bd9" }}>
          FCSIT · Universiti Malaya
        </div>
        <div style={{ marginTop: 32, fontSize: 32, color: "#6b5a8e", maxWidth: 640 }}>
          Explore the six bachelor programmes and find the one that fits you.
        </div>
      </div>
    </div>,
    size,
  );
}
