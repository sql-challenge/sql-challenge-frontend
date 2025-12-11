import type { RecentActivity } from "@/_lib/types/dashboard"

interface ActivityItemProps {
  activity: RecentActivity
}

const colorClasses:Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  accent: "bg-accent/10 text-accent",
  destructive: "bg-destructive/10 text-destructive",
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const timeAgo = getTimeAgo(activity.timestamp)

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClasses[activity.color] ?? ""}`}>
        <span className="text-lg">{activity.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">{activity.title}</p>
        <p className="text-sm text-muted-foreground">{activity.description}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          {activity.xpGained && <span className="text-xs font-semibold text-warning">+{activity.xpGained} XP</span>}
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return "agora mesmo"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d atrás`
  return past.toLocaleDateString("pt-BR")
}
