import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a14",
          borderRadius: 36,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 48 48" fill="none">
          <circle cx="19" cy="19" r="13.5" stroke="#c084fc" strokeWidth="2.5" fill="none" />
          <rect x="9" y="12" width="20" height="2.2" rx="1" fill="#7c3aed" opacity="0.5" />
          <rect x="9" y="16.2" width="20" height="2.2" rx="1" fill="#6d28d9" opacity="0.4" />
          <rect x="9" y="20.4" width="20" height="2.2" rx="1" fill="#5b21b6" opacity="0.35" />
          <rect x="16.5" y="11" width="1" height="17" fill="#a78bfa" opacity="0.25" />
          <rect x="10" y="12.2" width="3.5" height="1.8" rx="0.5" fill="#e879f9" opacity="0.9" />
          <line x1="29.5" y1="29.5" x2="39" y2="39" stroke="#a855f7" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
