import type React from "react"
import { forwardRef } from "react"
import { twMerge } from "tailwind-merge"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg"
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
    }

    return (
      <div
        ref={ref}
        className={twMerge("relative flex shrink-0 overflow-hidden rounded-full bg-secondary", sizeClasses[size], className)}
        {...props}
      >
        {src ? (
          <img
            src={src || "/placeholder.svg"}
            alt={alt || "Avatar"}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-medium">
            {fallback || "U"}
          </div>
        )}
      </div>
    )
  },
)

Avatar.displayName = "Avatar"

export { Avatar }
