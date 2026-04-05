export interface UserStats {
  totalXP: number
  currentLevel: string
  nextLevel: string
  xpToNextLevel: number
  xpProgress: number
  globalRank: number
  weeklyRank: number
  mysteriesCompleted: number
  totalMysteries: number
  averageTime: string
  accuracy: number
  currentStreak: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  unlocked: boolean
  unlockedAt?: string
}

export interface MysteryCategory {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
  totalChallenges: number
  completedChallenges: number
  xpReward: number
  icon: string
  locked: boolean
}

export interface RecentActivity {
  id: string
  type: "mystery_completed" | "achievement_unlocked" | "level_up" | "rank_improved"
  title: string
  description: string
  xpGained?: number
  timestamp: string
  icon: string
  color: string
}

export interface CompletedMystery {
  id: string
  title: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
  completedAt: string
  timeSpent: string
  xpGained: number
  accuracy: number
}
