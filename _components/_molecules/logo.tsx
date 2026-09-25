import Link from "next/link"
import { twMerge } from "tailwind-merge"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

// 18x18 pixel bitmap — a magnifying glass inspecting a database.
// . empty   r ring   d database   c scanning band (blinks)   h handle
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
]

const FILL: Record<string, { color: string; opacity?: number; className?: string }> = {
  r: { color: "var(--primary)" },
  d: { color: "var(--foreground)", opacity: 0.5 },
  c: { color: "var(--accent)", className: "animate-blink-pixel" },
  h: { color: "var(--accent)" },
}

function LogoIcon({ size }: { size: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? 34 : size === "md" ? 44 : 56

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 18 18"
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {BITMAP.flatMap((row, y) =>
        row.split("").map((cell, x) => {
          const spec = FILL[cell]
          if (!spec) return null
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={spec.color}
              opacity={spec.opacity}
              className={spec.className}
            />
          )
        }),
      )}
    </svg>
  )
}

export function Logo({ className, size = "sm" }: LogoProps) {
  return (
    <Link href="/" className={twMerge("flex items-center gap-2.5 group", className)}>
      <LogoIcon size={size} />
      <span
        className={twMerge(
          "font-display tracking-tight text-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-xl",
        )}
      >
        SQL<span className="text-primary">CHALLENGE</span>
        <span className="ml-0.5 inline-block w-[0.6em] text-accent animate-blink-pixel">_</span>
      </span>
    </Link>
  )
}
