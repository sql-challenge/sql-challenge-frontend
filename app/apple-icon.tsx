import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const BITMAP = [
  ".......rrrr.......",
  "....rr......rr....",
  "...r..........r...",
  "..r............r..",
  "..r...dddddd...r..",
  "..r..d......d..r..",
  "..r.dddddddddd.r..",
  "..r..d......d..r..",
  "..r.cccccccccc.r..",
  "..r..d......d..r..",
  "..r.dddddddddd.r..",
  "...r.d......d.r...",
  "....rrddddddrr....",
  ".......rrrr..hh...",
  "............hh....",
  ".............hh...",
  "..............hh..",
  "...............hh.",
];

const COLORS: Record<string, string> = {
  r: "#00e5ff",
  d: "rgba(232,232,232,0.5)",
  c: "#ff00ff",
  h: "#ff00ff",
};

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
          background: "#07070d",
          borderRadius: 36,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 126,
            height: 126,
          }}
        >
          {BITMAP.map((row, y) => (
            <div key={y} style={{ display: "flex", flexDirection: "row", height: 7 }}>
              {row.split("").map((cell, x) => (
                <div
                  key={x}
                  style={{
                    width: 7,
                    height: 7,
                    background: COLORS[cell] ?? "transparent",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
