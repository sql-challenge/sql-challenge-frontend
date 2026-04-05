import type { MysteryCategory } from "@/_lib/types/dashboard"
import { Badge, BadgeVariants } from "@/_components/_atoms/badge"
import { ProgressBar } from "@/_components/_molecules/progressBar"
import { Button } from "@/_components/_atoms/button"

interface MysteryCategoryCardProps {
  category: MysteryCategory
}

const difficultyColors:Record<string, BadgeVariants> = {
  beginner: "success" as const,
  intermediate: "primary" as const,
  advanced: "warning" as const,
  expert: "destructive" as const,
}

const difficultyLabels: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
  expert: "Expert",
}

export function MysteryCategoryCard({ category }: MysteryCategoryCardProps) {
  const isCompleted = category.completedChallenges === category.totalChallenges
  const isInProgress = category.completedChallenges > 0 && !isCompleted

  return (
    <div
      className={`rounded-xl border bg-card p-6 transition-all ${
        category.locked
          ? "border-border opacity-60"
          : "border-border hover:border-primary/50 hover:shadow-lg cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{category.icon}</div>
        <Badge variant={difficultyColors[category.difficulty]} className="text-xs">
          {difficultyLabels[category.difficulty]}
        </Badge>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2">{category.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{category.description}</p>

      <div className="space-y-3">
        <ProgressBar
          current={category.completedChallenges}
          total={category.totalChallenges}
          label={`${category.completedChallenges}/${category.totalChallenges} desafios`}
          showPercentage={false}
          color={isCompleted ? "success" : "primary"}
        />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Recompensa</span>
          <span className="font-semibold text-warning">+{category.xpReward} XP</span>
        </div>

        {category.locked ? (
          <Button variant="secondary" className="w-full" disabled>
            🔒 Bloqueado
          </Button>
        ) : isCompleted ? (
          <Button variant="outline" className="w-full bg-transparent">
            ✅ Completado
          </Button>
        ) : isInProgress ? (
          <Button variant="outline" className="w-full">
            Continuar
          </Button>
        ) : (
          <Button variant="primary" className="w-full">
            Começar
          </Button>
        )}
      </div>
    </div>
  )
}
