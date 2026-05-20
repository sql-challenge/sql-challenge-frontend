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
          "inline-flex items-center justify-center gap-2 font-medium transition-all active:translate-y-0.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          "border-2",
          variant === "primary" && "bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-pixel-primary",
          variant === "secondary" && "bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 shadow-pixel-sm",
          variant === "outline" && "border-border bg-transparent hover:bg-secondary shadow-pixel-sm",
          variant === "ghost" && "border-transparent hover:bg-secondary hover:text-foreground",
          variant === "destructive" && "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90 shadow-pixel-sm",
          size === "sm" && "h-9 px-3 text-xs",
          size === "md" && "h-11 px-5 text-sm",
          size === "lg" && "h-13 px-7 text-base",
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = "Button"

export { Button }
