import Link from "next/link"
import { twMerge } from "tailwind-merge"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

function LogoIcon({ size }: { size: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? 32 : size === "md" ? 40 : 52

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradiente do círculo da lupa */}
        <radialGradient id="lensGrad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#4f46e5" />
        </radialGradient>

        {/* Gradiente do cabo */}
        <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>

        {/* Brilho suave */}
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Brilho forte para o cabo */}
        <filter id="glowHandle" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Clip para conteúdo dentro da lupa */}
        <clipPath id="lensClip">
          <circle cx="19" cy="19" r="12.5" />
        </clipPath>
      </defs>

      {/* Fundo escuro da lupa */}
      <circle cx="19" cy="19" r="13.5" fill="#0f0f1a" />

      {/* Grade do banco de dados (linhas de tabela) dentro da lupa */}
      <g clipPath="url(#lensClip)" opacity="0.85">
        {/* Linhas horizontais — simula rows de uma tabela */}
        <rect x="9"  y="12" width="20" height="2.2" rx="1" fill="#7c3aed" opacity="0.5" />
        <rect x="9"  y="16.2" width="20" height="2.2" rx="1" fill="#6d28d9" opacity="0.4" />
        <rect x="9"  y="20.4" width="20" height="2.2" rx="1" fill="#5b21b6" opacity="0.35" />
        <rect x="9"  y="24.6" width="14" height="2.2" rx="1" fill="#4c1d95" opacity="0.3" />

        {/* Separador de coluna vertical */}
        <rect x="16.5" y="11" width="1" height="17" fill="#a78bfa" opacity="0.25" />

        {/* Cursor piscando / ponteiro de query */}
        <rect x="10" y="12.2" width="3.5" height="1.8" rx="0.5" fill="#e879f9" opacity="0.9" />
      </g>

      {/* Anel externo da lupa com gradiente e brilho */}
      <circle
        cx="19" cy="19" r="13.5"
        stroke="url(#lensGrad)"
        strokeWidth="2.5"
        fill="none"
        filter="url(#glow)"
      />

      {/* Reflexo interno — destaque de luz */}
      <ellipse
        cx="15" cy="14"
        rx="4" ry="2.5"
        fill="white"
        opacity="0.07"
        transform="rotate(-20 15 14)"
      />

      {/* Cabo da lupa — grosso e com brilho */}
      <line
        x1="29.5" y1="29.5"
        x2="39"   y2="39"
        stroke="url(#handleGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        filter="url(#glowHandle)"
      />

      {/* Ponto de brilho no cabo */}
      <circle cx="32" cy="32" r="1.2" fill="#c084fc" opacity="0.6" />
    </svg>
  )
}

export function Logo({ className, size = "sm" }: LogoProps) {
  return (
    <Link href="/" className={twMerge("flex items-center gap-2.5", className)}>
      <LogoIcon size={size} />
      <span
        className={twMerge(
          "font-extrabold tracking-tight",
          size === "sm" && "text-base",
          size === "md" && "text-lg",
          size === "lg" && "text-2xl",
        )}
        style={{
          background: "linear-gradient(135deg, #c084fc 0%, #818cf8 60%, #6366f1 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        SQL CHALLENGER
      </span>
    </Link>
  )
}
