"use client"

import { Header } from "@/_components/_organisms/header"
import { StatCard } from "@/_components/_molecules/statCard"
import { ProgressBar } from "@/_components/_molecules/progressBar"
import { ProtectedRoute } from "@/_components/_organisms/protectedRoute"
import { useUser } from "@/_context/userContext"
import { getQuickAchievements } from "@/_lib/achievements"
import Link from "next/link"
import { Search, Lock, Check, Zap, CheckCircle, Award, Clock } from "feather-icons-react"

// ── Sistema de níveis ─────────────────────────────────────
const XP_LEVELS = [
  { name: "Novato",          min: 0      },
  { name: "Investigador",    min: 500    },
  { name: "Detetive",        min: 2000   },
  { name: "Detetive Sênior", min: 5000   },
  { name: "Mestre SQL",      min: 10000  },
]

function getLevel(xp: number) {
  let idx = 0
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i].min) idx = i
    else break
  }
  const current = XP_LEVELS[idx]
  const next = XP_LEVELS[idx + 1] ?? null
  return { current: current.name, next: next?.name ?? "Máximo", nextMin: next?.min ?? current.min }
}

export default function DashboardPage() {
  const { user } = useUser()

  const xp       = user?.xp ?? 0
  const progress = user?.challenge_progress ?? []
  const level    = getLevel(xp)
  const totalCaps = progress.reduce((a, p) => a + (p.capFinish ?? 0), 0)
  const totalMins = Math.floor(progress.reduce((a, p) => a + (p.totalSeconds ?? 0), 0) / 60)
  const quickAchievements = getQuickAchievements(user)
  const unlockedCount = quickAchievements.filter(a => a.unlocked).length

  // Atividade recente a partir do progresso real
  const recentActivity = [...progress]
    .sort((a, b) => 0) // Firestore não retorna updatedAt aqui; manter ordem
    .slice(0, 5)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-lg sm:text-2xl font-display tracking-wide text-foreground mb-2">
              Bem-vindo de volta, {user?.nick || user?.username || "Detetive"}
            </h1>
            <p className="text-xs sm:text-base text-muted-foreground">
              Continue sua jornada para dominar SQL através de mistérios envolventes
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Zap className="w-6 h-6" />}
              label="XP Total"
              value={xp.toLocaleString()}
              subtitle={level.next !== "Máximo" ? `${(level.nextMin - xp).toLocaleString()} XP para ${level.next}` : "Nível máximo!"}
            />

            <StatCard
              icon={<CheckCircle className="w-6 h-6" />}
              label="Capítulos Completos"
              value={`${totalCaps}`}
              subtitle={`Em ${progress.length} caso${progress.length !== 1 ? "s" : ""}`}
            />

            <StatCard
              icon={<Award className="w-6 h-6" />}
              label="Ranking Global"
              value={user?.rankingPosition ? `#${user.rankingPosition}` : "—"}
              subtitle="Posição no ranking de XP"
            />

            <StatCard
              icon={<Clock className="w-6 h-6" />}
              label="Tempo Jogado"
              value={totalMins < 60 ? `${totalMins}min` : `${Math.floor(totalMins / 60)}h ${totalMins % 60}min`}
              subtitle="Tempo total de investigação"
            />
          </div>

          {/* Progresso de Nível */}
          <div className="pixel-panel p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-display tracking-wide text-foreground truncate">Nível: {level.current}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground truncate mt-1">
                  {level.next !== "Máximo" ? `Próximo: ${level.next} (${level.nextMin.toLocaleString()} XP)` : "Você atingiu o nível máximo!"}
                </p>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="font-mono text-lg sm:text-2xl font-bold text-primary tabular-nums">{xp.toLocaleString()} XP</div>
                {level.next !== "Máximo" && (
                  <div className="text-xs sm:text-sm text-muted-foreground">de {level.nextMin.toLocaleString()} XP</div>
                )}
              </div>
            </div>
            {level.next !== "Máximo" && (
              <ProgressBar current={xp} total={level.nextMin} size="lg" showPercentage={false} />
            )}
          </div>

          {/* Dois painéis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Atividade Recente */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-xl font-display tracking-wide text-foreground">Casos Iniciados</h2>
                <Link href="/mystery" className="text-xs sm:text-sm text-primary hover:underline font-medium">
                  Ver todos →
                </Link>
              </div>

              {recentActivity.length === 0 ? (
                <div className="pixel-panel p-8 text-center text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-semibold text-foreground">Nenhum caso em andamento</p>
                  <p className="text-sm mt-1">Um arquivo vazio espera por um detetive. Pronto para começar?</p>
                  <Link href="/mystery" className="pixel-press mt-4 inline-block border-2 border-primary bg-primary px-4 py-2 text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-pixel-sm">
                    Explorar mistérios
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((p, i) => (
                    <div key={i} className="pixel-panel flex items-center gap-4 px-4 py-3">
                      <div className="w-10 h-10 border-2 border-primary/30 bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Search className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{p.nameChallenge}</p>
                        <p className="text-xs text-muted-foreground">{p.capFinish ?? 0} cap{(p.capFinish ?? 0) !== 1 ? "ítulos" : "ítulo"} · {(p.xpObtido ?? 0).toLocaleString()} XP obtido</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-primary shrink-0 tabular-nums">+{(p.xpObtido ?? 0)} XP</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Conquistas */}
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-xl font-display tracking-wide text-foreground">Conquistas</h2>
                <Link href="/conquistas" className="text-xs sm:text-sm text-primary hover:underline font-medium">
                  {unlockedCount}/6 →
                </Link>
              </div>
              <div className="space-y-3">
                {quickAchievements.map((a) => (
                  <div
                    key={a.id}
                    className={`flex items-center gap-3 border-2 px-3 py-2.5 transition-all ${
                      a.unlocked
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card opacity-50 grayscale"
                    }`}
                  >
                    <span className="text-xl">{a.unlocked ? a.icon : <Lock className="w-5 h-5 text-muted-foreground" />}</span>
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    {a.unlocked && <Check className="ml-auto w-4 h-4 text-success" />}
                  </div>
                ))}
                <Link href="/conquistas" className="block text-center text-xs text-primary hover:underline mt-1">
                  Ver todas as conquistas →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
