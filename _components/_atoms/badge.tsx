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
        "inline-flex items-center px-2.5 py-1 text-xs font-semibold transition-colors border-2",
        variant === "default" && "bg-secondary text-secondary-foreground border-secondary",
        variant === "primary" && "bg-primary text-primary-foreground border-primary",
        variant === "success" && "bg-success text-success-foreground border-success",
        variant === "warning" && "bg-warning text-warning-foreground border-warning",
        variant === "destructive" && "bg-destructive text-destructive-foreground border-destructive",
        variant === "outline" && "border-border bg-transparent",
        className,
      )}
      {...props}
    />
  )
})

Badge.displayName = "Badge"

export { Badge }
