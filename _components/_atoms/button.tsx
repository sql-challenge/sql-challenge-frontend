import type React from "react"
import { forwardRef } from "react"
import { twMerge } from "tailwind-merge"

export type ButtoVariants =  "primary" | "secondary" | "outline" | "ghost" | "destructive";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtoVariants
  size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === "outline" && "border border-border bg-transparent hover:bg-secondary",
          variant === "ghost" && "hover:bg-secondary hover:text-foreground",
          variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-11 px-5 text-base",
          size === "lg" && "h-13 px-7 text-lg",
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = "Button"

export { Button }
