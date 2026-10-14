import type { Achievement } from "@/_lib/types/dashboard"
import { Badge } from "@/_components/_atoms/badge"

interface AchievementCardProps {
  achievement: Achievement
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div
      className={`pixel-panel p-4 transition-all ${
        achievement.unlocked
          ? "border-primary/50 bg-primary/5 hover:border-primary hover:shadow-pixel hover:-translate-y-0.5 cursor-pointer"
          : "border-border opacity-60"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-3xl">{achievement.icon}</div>
        <Badge variant={achievement.unlocked ? "success" : "default"} className="text-xs">
          {achievement.unlocked ? "Desbloqueada" : "Bloqueada"}
        </Badge>
      </div>
      <h4 className="font-bold text-foreground mb-1">{achievement.title}</h4>
      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-warning font-semibold">+{achievement.xpReward} XP</span>
        {achievement.unlockedAt && (
          <span className="text-muted-foreground">{new Date(achievement.unlockedAt).toLocaleDateString("pt-BR")}</span>
        )}
      </div>
    </div>
  )
}
