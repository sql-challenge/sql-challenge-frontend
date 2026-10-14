import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const [pressStart2P, pixelifySans] = await Promise.all([
    fetch(new URL("https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM4.woff2")).then((r) => r.arrayBuffer()),
    fetch(new URL("https://fonts.gstatic.com/s/pixelifysans/v3/CHylV-3HFUT7aC4iv1TxGDR9Jn0Ei0tSaJ0.woff2")).then((r) => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #07070d 0%, #12101e 50%, #07070d 100%)",
          fontFamily: '"Press Start 2P"',
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0, 229, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Scanlines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.15) 2px, rgba(0, 0, 0, 0.15) 4px)",
          }}
        />

        {/* Magenta glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255, 0, 255, 0.10), transparent 70%)",
          }}
        />

        {/* Cyan glow bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0, 229, 255, 0.08), transparent 70%)",
          }}
        />

        {/* Magnifying glass icon (SVG) */}
        <svg
          style={{
            position: "absolute",
            right: 80,
            top: 120,
            opacity: 0.12,
          }}
          width="320"
          height="320"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="19"
            cy="19"
            r="13.5"
            stroke="#00e5ff"
            strokeWidth="2.5"
            fill="none"
          />
          <line
            x1="29.5"
            y1="29.5"
            x2="39"
            y2="39"
            stroke="#ff00ff"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>

        {/* Database icon (SVG) bottom-right */}
        <svg
          style={{
            position: "absolute",
            left: 80,
            bottom: 100,
            opacity: 0.08,
          }}
          width="200"
          height="200"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="12" cy="6" rx="10" ry="3" stroke="#00e5ff" strokeWidth="1.5" fill="none" />
          <path d="M2 6v4c0 1.66 4.48 3 10 3s10-1.34 10-3V6" stroke="#00e5ff" strokeWidth="1.5" fill="none" />
          <path d="M2 10v4c0 1.66 4.48 3 10 3s10-1.34 10-3v-4" stroke="#00e5ff" strokeWidth="1.5" fill="none" />
          <path d="M2 14v4c0 1.66 4.48 3 10 3s10-1.34 10-3v-4" stroke="#00e5ff" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
            paddingLeft: 48,
            paddingRight: 48,
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 400,
              letterSpacing: 4,
              color: "#00e5ff",
              textAlign: "center",
              lineHeight: 1.15,
              textShadow: "0 0 40px rgba(0, 229, 255, 0.3)",
              marginBottom: 8,
            }}
          >
            SQL CHALLENGE
          </div>

          <div
            style={{
              fontSize: 24,
              fontFamily: "Pixelify Sans",
              color: "#888899",
              letterSpacing: 6,
              textAlign: "center",
              marginTop: 8,
              textTransform: "uppercase",
            }}
          >
            Mistérios & Desafios SQL
          </div>

          <div
            style={{
              width: 160,
              height: 2,
              background: "linear-gradient(90deg, transparent, #ff00ff, #00e5ff, transparent)",
              marginTop: 24,
              marginBottom: 20,
            }}
          />

          <div
            style={{
              fontSize: 16,
              fontFamily: "Pixelify Sans",
              color: "#888899",
              letterSpacing: 2,
              textAlign: "center",
            }}
          >
            Aprenda SQL resolvendo casos detectivescos
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #ff00ff, #00e5ff)",
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #00e5ff, #ff00ff)",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Press Start 2P",
          data: pressStart2P,
          style: "normal",
          weight: 400,
        },
        {
          name: "Pixelify Sans",
          data: pixelifySans,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
