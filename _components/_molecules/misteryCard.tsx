import Link from "next/link";
import type { Mystery } from "@/_lib/types/mystery";

interface MysteryCardProps {
  mystery: Mystery;
}

export function MysteryCard({ mystery }: MysteryCardProps) {
  const isLocked = mystery.status === "locked";
  const isCompleted = mystery.status === "completed";

  const difficultyColors = {
    beginner: "bg-success/10 text-success border-success/20",
    intermediate: "bg-accent/10 text-accent border-accent/20",
    advanced: "bg-warning/10 text-warning border-warning/20",
    expert: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Link
      href={isLocked ? "#" : `/mystery/${mystery.id}`}
      className={`block group ${isLocked ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <div className="bg-card border border-border rounded-lg p-6 h-full hover:border-primary/50 transition-all hover:shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {/* <div className="text-4xl">{mystery.icon}</div> */}
          {isCompleted && (
            <div className="bg-success/10 text-success px-2 py-1 rounded-md text-xs font-medium">
              ✓ Completo
            </div>
          )}
          {isLocked && (
            <div className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-xs font-medium">
              🔒 Bloqueado
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {mystery.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {mystery.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${difficultyColors[mystery.difficulty]}`}>
            {mystery.difficulty}
          </span>
          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
            {mystery.category}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>⏱️ {mystery.estimatedTime}</span>
            <span>🎯 {mystery.completionRate}%</span>
          </div>
          <div className="text-sm font-semibold text-primary">
            +{mystery.xpReward} XP
          </div>
        </div>
      </div>
    </Link>
  );
}