import type React from "react"
import { forwardRef } from "react"
import { twMerge } from "tailwind-merge"


export type BadgeVariants = "default" | "primary" | "success" | "warning" | "destructive" | "outline"
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariants
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={twMerge(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
        variant === "default" && "bg-secondary text-secondary-foreground",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "success" && "bg-success text-success-foreground",
        variant === "warning" && "bg-warning text-warning-foreground",
        variant === "destructive" && "bg-destructive text-destructive-foreground",
        variant === "outline" && "border border-border bg-transparent",
        className,
      )}
      {...props}
    />
  )
})

Badge.displayName = "Badge"

export { Badge }
