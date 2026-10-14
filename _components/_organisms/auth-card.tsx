import type { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

interface AuthCardProps {
  children: ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div className={twMerge("w-full max-w-md border-2 border-border bg-card p-8 shadow-pixel", className)}>
      {children}
    </div>
  )
}
