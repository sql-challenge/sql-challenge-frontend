import Image from "next/image"
import { twMerge } from "tailwind-merge"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, size = "sm" }: LogoProps) {
  return (
    <div className={twMerge("flex items-center gap-3", className)}>
      <div
        className={twMerge("flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent",
           size === "sm" && "h-8 w-8",
           size === "md" && "h-10 w-10",
           size === "lg" && "h-12 w-12")}
      >
        {/* <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={twMerge("text-primary-foreground",
             size === "sm" && "h-4 w-4",
             size === "md" && "h-5 w-5",
             size === "lg" && "h-6 w-6",
          )}
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M8 7h8" />
          <path d="M8 11h8" />
          <path d="M8 15h6" />
        </svg> */}
        <Image className={
          twMerge("text-primary-foreground",
            //  size === "sm" && "h-4 w-4",
            //  size === "md" && "h-5 w-5",
            //  size === "lg" && "h-6 w-6",
          )
        } 
        width={80} height={80} src="/logo0.png" alt="Logo do sql challenger" />
      </div>
      <span
        className={twMerge("font-bold text-foreground",
          size === "sm" && "text-lg",
          size === "md" && "text-xl",
          size === "lg" && "text-2xl")}
      >
        SQL Challenger
      </span>
    </div>
  )
}
