"use client"

import { Header } from "@/_components/_organisms/header"
import { StatCard } from "@/_components/_molecules/statCard"
import { ProgressBar } from "@/_components/_molecules/progressBar"
import { AchievementCard } from "@/_components/_molecules/achievementCard"
import { useUser } from "@/_context/userContext"
import Link from "next/link"

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

// ── Conquistas rápidas (mesmo critério da página de conquistas) ──
function buildQuickAchievements(user: ReturnType<typeof useUser>["user"]) {
  const progress = user?.challenge_progress ?? []
  const totalCaps    = progress.reduce((a, p) => a + (p.capFinish ?? 0), 0)
  const totalXP      = user?.xp ?? 0
  const totalDesafios = progress.length
  const totalQueries = progress.reduce((a, p) => a + (p.totalQueries ?? 0), 0)
  const awarded: string[] = (user as any)?.awardedAchievements ?? []

  return [
    { id: "first_blood", icon: "🩸", title: "Primeira Gota de Sangue", unlocked: totalCaps >= 1 },
    { id: "xp_500",      icon: "⚡", title: "Faísca de Gênio",         unlocked: totalXP >= 500 },
    { id: "xp_2000",     icon: "🔥", title: "Detetive em Ascensão",    unlocked: totalXP >= 2000 },
    { id: "xp_5000",     icon: "💎", title: "Elite da Investigação",   unlocked: totalXP >= 5000 },
    { id: "multi_case",  icon: "🗂️", title: "Detetive Polivalente",    unlocked: totalDesafios >= 3 },
    { id: "queries_10",  icon: "⌨️", title: "Digitador Curioso",       unlocked: totalQueries >= 10 },
  ].map(a => ({ ...a, description: "", xpReward: 0 }))
}

export default function DashboardPage() {
  const { user } = useUser()

  const xp       = user?.xp ?? 0
  const progress = user?.challenge_progress ?? []
  const level    = getLevel(xp)
  const totalCaps = progress.reduce((a, p) => a + (p.capFinish ?? 0), 0)
  const totalMins = Math.floor(progress.reduce((a, p) => a + (p.totalSeconds ?? 0), 0) / 60)
  const quickAchievements = buildQuickAchievements(user)
  const unlockedCount = quickAchievements.filter(a => a.unlocked).length

  // Atividade recente a partir do progresso real
  const recentActivity = [...progress]
    .sort((a, b) => 0) // Firestore não retorna updatedAt aqui; manter ordem
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo de volta, {user?.nick || user?.username || "Detetive"}! 🔍
          </h1>
          <p className="text-muted-foreground">
            Continue sua jornada para dominar SQL através de mistérios envolventes
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            label="XP Total"
            value={xp.toLocaleString()}
            subtitle={level.next !== "Máximo" ? `${(level.nextMin - xp).toLocaleString()} XP para ${level.next}` : "Nível máximo!"}
          />

          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
            label="Capítulos Completos"
            value={`${totalCaps}`}
            subtitle={`Em ${progress.length} caso${progress.length !== 1 ? "s" : ""}`}
          />

          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            label="Ranking Global"
            value={user?.rankingPosition ? `#${user.rankingPosition}` : "—"}
            subtitle="Posição no ranking de XP"
          />

          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Tempo Jogado"
            value={totalMins < 60 ? `${totalMins}min` : `${Math.floor(totalMins / 60)}h ${totalMins % 60}min`}
            subtitle="Tempo total de investigação"
          />
        </div>

        {/* Progresso de Nível */}
        <div className="rounded-xl border border-border bg-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Nível: {level.current}</h2>
              <p className="text-sm text-muted-foreground">
                {level.next !== "Máximo" ? `Próximo: ${level.next} (${level.nextMin.toLocaleString()} XP)` : "Você atingiu o nível máximo!"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{xp.toLocaleString()} XP</div>
              {level.next !== "Máximo" && (
                <div className="text-sm text-muted-foreground">de {level.nextMin.toLocaleString()} XP</div>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Casos Iniciados</h2>
              <Link href="/mystery" className="text-sm text-primary hover:underline font-medium">
                Ver todos →
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-foreground">Nenhum caso iniciado</p>
                <p className="text-sm mt-1">Comece um mistério para ver seu progresso aqui</p>
                <Link href="/mystery" className="mt-4 inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Explorar mistérios
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0">
                      🕵️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{p.nameChallange}</p>
                      <p className="text-xs text-muted-foreground">{p.capFinish ?? 0} cap{(p.capFinish ?? 0) !== 1 ? "ítulos" : "ítulo"} · {(p.xpObtido ?? 0).toLocaleString()} XP obtido</p>
                    </div>
                    <span className="text-xs font-bold text-primary shrink-0">+{(p.xpObtido ?? 0)} XP</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conquistas */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Conquistas</h2>
              <Link href="/conquistas" className="text-sm text-primary hover:underline font-medium">
                {unlockedCount}/6 →
              </Link>
            </div>
            <div className="space-y-3">
              {quickAchievements.map((a) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                    a.unlocked
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-card opacity-50 grayscale"
                  }`}
                >
                  <span className="text-xl">{a.unlocked ? a.icon : "🔒"}</span>
                  <p className="text-sm font-semibold text-foreground">{a.title}</p>
                  {a.unlocked && <span className="ml-auto text-emerald-400 text-xs font-bold">✓</span>}
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
  )
}
