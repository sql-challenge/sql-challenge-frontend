import type { ReactNode } from "react"

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    positive: boolean
  }
}

export function StatCard({ icon, label, value, subtitle, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded ${
              trend.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
    </div>
  )
}
