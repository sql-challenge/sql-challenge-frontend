interface ProgressBarProps {
  current: number
  total: number
  label?: string
  showPercentage?: boolean
  size?: "sm" | "md" | "lg"
  color?: "primary" | "success" | "warning" | "accent"
}

export function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
  size = "md",
  color = "primary",
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((current / total) * 100), 100)

  const heightClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  }

  const colorClasses = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    accent: "bg-accent",
  }

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2 text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && <span className="font-semibold text-foreground">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-secondary rounded-full ${heightClasses[size]} overflow-hidden`}>
        <div
          className={`${colorClasses[color]} ${heightClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
