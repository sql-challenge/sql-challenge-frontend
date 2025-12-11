"use client"

import { Header } from "@/_components/_organisms/header"
import { StatCard } from "@/_components/_molecules/statCard"
import { ProgressBar } from "@/_components/_molecules/progressBar"
import { AchievementCard } from "@/_components/_molecules/achievementCard"
import { MysteryCategoryCard } from "@/_components/_molecules/mysteryCategoryCard"
import { ActivityItem } from "@/_components/_molecules/activityItem"
import { mockUserStats, mockAchievements, mockMysteryCategories, mockRecentActivity } from "@/_lib/mock/dashboard"
import { useUser } from "@/_context/userContext"

export default function DashboardPage() {
    const { user } = useUser()
    const stats = mockUserStats
    const achievements = mockAchievements
    const categories = mockMysteryCategories
    const activities = mockRecentActivity

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Bem-vindo de volta, {user?.username ?? "Detetive"}! 🔍</h1>
                    <p className="text-muted-foreground">
                        Continue sua jornada para dominar SQL através de mistérios envolventes
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                        label="XP Total"
                        value={stats.totalXP.toLocaleString()}
                        subtitle={`${stats.xpToNextLevel - stats.totalXP} XP para ${stats.nextLevel}`}
                        trend={{ value: "12%", positive: true }}
                    />

                    <StatCard
                        icon={
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                />
                            </svg>
                        }
                        label="Mistérios Resolvidos"
                        value={`${stats.mysteriesCompleted}/${stats.totalMysteries}`}
                        subtitle={`${Math.round((stats.mysteriesCompleted / stats.totalMysteries) * 100)}% completo`}
                    />

                    <StatCard
                        icon={
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        }
                        label="Ranking Global"
                        value={`#${stats.globalRank}`}
                        subtitle={`#${stats.weeklyRank} esta semana`}
                        trend={{ value: "3", positive: true }}
                    />

                    <StatCard
                        icon={
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                                />
                            </svg>
                        }
                        label="Sequência Atual"
                        value={`${stats.currentStreak} dias`}
                        subtitle="Continue assim!"
                    />
                </div>

                {/* Progress Section */}
                <div className="rounded-xl border border-border bg-card p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Progresso de Nível</h2>
                            <p className="text-sm text-muted-foreground">
                                {stats.currentLevel} → {stats.nextLevel}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{stats.totalXP} XP</div>
                            <div className="text-sm text-muted-foreground">de {stats.xpToNextLevel} XP</div>
                        </div>
                    </div>
                    <ProgressBar current={stats.totalXP} total={stats.xpToNextLevel} size="lg" showPercentage={false} />
                </div>

                {/* Mystery Categories */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Categorias de Mistérios</h2>
                            <p className="text-muted-foreground">Escolha uma categoria para começar sua investigação</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <MysteryCategoryCard key={category.id} category={category} />
                        ))}
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Atividade Recente</h2>
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Conquistas</h2>
                            <span className="text-sm text-muted-foreground">
                                {achievements.filter((a) => a.unlocked).length}/{achievements.length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {achievements.slice(0, 6).map((achievement) => (
                                <AchievementCard key={achievement.id} achievement={achievement} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
