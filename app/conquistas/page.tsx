"use client";

import { useEffect, useState } from "react";
import { Header } from "@/_components/_organisms/header";
import { ProtectedRoute } from "@/_components/_organisms/protectedRoute";
import { useUser } from "@/_context/userContext";
import { api } from "@/_lib/api";

interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
  rarity: "comum" | "raro" | "épico" | "lendário";
  unlockedAt?: string;
}

const RARITY_STYLE = {
  comum:    { label: "Comum",    border: "border-slate-500/30",  bg: "bg-slate-500/5",  badge: "bg-slate-500/10 text-slate-400  border-slate-500/30"  },
  raro:     { label: "Raro",     border: "border-blue-500/40",   bg: "bg-blue-500/5",   badge: "bg-blue-500/10  text-blue-400   border-blue-500/30"   },
  épico:    { label: "Épico",    border: "border-purple-500/40", bg: "bg-purple-500/5", badge: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  lendário: { label: "Lendário", border: "border-yellow-500/40", bg: "bg-yellow-500/5", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
};

function buildAchievements(user: ReturnType<typeof useUser>["user"]): Achievement[] {
  const progress = user?.challenge_progress ?? [];
  const totalCaps    = progress.reduce((acc, p) => acc + (p.capFinish    ?? 0), 0);
  const totalXP      = user?.xp ?? 0;
  const totalDesafios = progress.length;
  const totalQueries = progress.reduce((acc, p) => acc + (p.totalQueries ?? 0), 0);
  const totalMinutes = Math.floor(progress.reduce((acc, p) => acc + (p.totalSeconds ?? 0), 0) / 60);
  const totalHints   = progress.reduce((acc, p) => acc + (p.totalHints   ?? 0), 0);

  return [
    // ── Capítulos ──────────────────────────────────────────────
    {
      id: "first_blood",
      icon: "🩸",
      title: "Primeira Gota de Sangue",
      desc: "Complete o seu primeiro capítulo.",
      rarity: "comum",
      unlocked: totalCaps >= 1,
    },
    {
      id: "3_chapters",
      icon: "📖",
      title: "Aprendiz do Método",
      desc: "Complete 3 capítulos no total.",
      rarity: "comum",
      unlocked: totalCaps >= 3,
    },
    {
      id: "10_chapters",
      icon: "🔬",
      title: "Investigador Dedicado",
      desc: "Complete 10 capítulos no total.",
      rarity: "raro",
      unlocked: totalCaps >= 10,
    },
    // ── XP ────────────────────────────────────────────────────
    {
      id: "xp_500",
      icon: "⚡",
      title: "Faísca de Gênio",
      desc: "Acumule 500 XP.",
      rarity: "comum",
      unlocked: totalXP >= 500,
    },
    {
      id: "xp_2000",
      icon: "🔥",
      title: "Detetive em Ascensão",
      desc: "Acumule 2.000 XP.",
      rarity: "raro",
      unlocked: totalXP >= 2000,
    },
    {
      id: "xp_5000",
      icon: "💎",
      title: "Elite da Investigação",
      desc: "Acumule 5.000 XP.",
      rarity: "épico",
      unlocked: totalXP >= 5000,
    },
    {
      id: "xp_10000",
      icon: "👑",
      title: "Mestre SQL",
      desc: "Acumule 10.000 XP. O topo do mundo mágico.",
      rarity: "lendário",
      unlocked: totalXP >= 10000,
    },
    // ── Casos ────────────────────────────────────────────────
    {
      id: "multi_case",
      icon: "🗂️",
      title: "Detetive Polivalente",
      desc: "Inicie 3 casos diferentes.",
      rarity: "raro",
      unlocked: totalDesafios >= 3,
    },
    {
      id: "5_cases",
      icon: "🌐",
      title: "Lenda do Arquivo",
      desc: "Complete pelo menos 1 capítulo em 5 casos diferentes.",
      rarity: "épico",
      unlocked: totalDesafios >= 5,
    },
    // ── Queries ──────────────────────────────────────────────
    {
      id: "queries_10",
      icon: "⌨️",
      title: "Digitador Curioso",
      desc: "Execute 10 queries.",
      rarity: "comum",
      unlocked: totalQueries >= 10,
    },
    {
      id: "queries_100",
      icon: "🖥️",
      title: "Analista de Dados",
      desc: "Execute 100 queries.",
      rarity: "raro",
      unlocked: totalQueries >= 100,
    },
    {
      id: "queries_500",
      icon: "🤖",
      title: "Máquina de Consultas",
      desc: "Execute 500 queries.",
      rarity: "épico",
      unlocked: totalQueries >= 500,
    },
    // ── Tempo ────────────────────────────────────────────────
    {
      id: "time_30",
      icon: "⏱️",
      title: "Detetive Dedicado",
      desc: "Jogue por 30 minutos no total.",
      rarity: "comum",
      unlocked: totalMinutes >= 30,
    },
    {
      id: "time_120",
      icon: "🕵️",
      title: "Mergulho Profundo",
      desc: "Jogue por 2 horas no total.",
      rarity: "raro",
      unlocked: totalMinutes >= 120,
    },
    {
      id: "time_600",
      icon: "🏛️",
      title: "Guardião do Arquivo",
      desc: "Jogue por 10 horas no total.",
      rarity: "épico",
      unlocked: totalMinutes >= 600,
    },
    // ── Habilidade ───────────────────────────────────────────
    {
      id: "no_hints",
      icon: "🦅",
      title: "Voo Solo",
      desc: "Complete um capítulo sem usar nenhuma dica.",
      rarity: "raro",
      unlocked: progress.some((p) => (p.totalHints ?? 0) === 0 && (p.capFinish ?? 0) > 0),
    },
    {
      id: "hints_0_total",
      icon: "🧠",
      title: "Mente Pura",
      desc: "Complete 5 capítulos sem usar nenhuma dica.",
      rarity: "épico",
      unlocked: totalHints === 0 && totalCaps >= 5,
    },
    {
      id: "sql_master",
      icon: "🧙",
      title: "Arcano do SQL",
      desc: "Complete todos os casos disponíveis.",
      rarity: "lendário",
      unlocked: false,
    },
  ];
}

const RARITY_XP: Record<string, number> = {
  comum: 50, raro: 150, épico: 300, lendário: 500,
};

export default function ConquistasPage() {
  const { user, updateUser } = useUser();
  const achievements = buildAchievements(user);
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const pct = Math.round((unlocked / achievements.length) * 100);
  const [xpNotice, setXpNotice] = useState<string | null>(null);

  // Detecta novas conquistas e concede XP bônus
  useEffect(() => {
    if (!user) return;
    const awarded: string[] = (user as any).awardedAchievements ?? [];
    const newOnes = achievements.filter(a => a.unlocked && !awarded.includes(a.id));
    if (newOnes.length === 0) return;

    let totalXpBonus = 0;
    const promises = newOnes.map(a => {
      const xp = RARITY_XP[a.rarity] ?? 50;
      totalXpBonus += xp;
      return api.post(`/api/user/${user.uid}/achievements/award`, { achievementId: a.id, xpBonus: xp })
        .catch(() => {});
    });

    Promise.all(promises).then(() => {
      if (totalXpBonus > 0) {
        updateUser({
          xp: (user.xp ?? 0) + totalXpBonus,
          awardedAchievements: [...awarded, ...newOnes.map(a => a.id)],
        } as any);
        setXpNotice(`+${totalXpBonus} XP por ${newOnes.length} nova(s) conquista(s)!`);
        setTimeout(() => setXpNotice(null), 4000);
      }
    });
  }, [user?.uid]);

  const progress = user?.challenge_progress ?? [];
  const totalQueries = progress.reduce((acc, p) => acc + (p.totalQueries ?? 0), 0);
  const totalMinutes = Math.floor(progress.reduce((acc, p) => acc + (p.totalSeconds ?? 0), 0) / 60);
  const totalHints   = progress.reduce((acc, p) => acc + (p.totalHints   ?? 0), 0);
  const totalCaps    = progress.reduce((acc, p) => acc + (p.capFinish    ?? 0), 0);

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins}min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}min`;
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <Header />

      {/* XP Bonus Toast */}
      {xpNotice && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-3 text-yellow-400 font-bold shadow-lg">
          ⚡ {xpNotice}
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="text-4xl mb-2">🎖️</div>
            <h1 className="text-3xl font-extrabold text-foreground">Conquistas</h1>
            <p className="text-muted-foreground mt-1">Sua jornada como detetive SQL</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-primary">{unlocked}<span className="text-xl text-muted-foreground">/{achievements.length}</span></p>
            <p className="text-sm text-muted-foreground">conquistadas</p>
            <div className="mt-2 h-2 w-40 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{pct}% completo</p>
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { icon: "⚡", label: "XP Total",        value: (user?.xp ?? 0).toLocaleString() },
            { icon: "📖", label: "Caps Completos",  value: totalCaps },
            { icon: "📋", label: "Casos Iniciados", value: progress.length },
            { icon: "⌨️", label: "Queries",         value: totalQueries.toLocaleString() },
            { icon: "⏱️", label: "Tempo Jogado",    value: formatTime(totalMinutes) },
            { icon: "💡", label: "Dicas Usadas",    value: totalHints },
          ].map(({ icon, label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-card px-4 py-3 text-center">
              <div className="text-xl mb-1">{icon}</div>
              <p className="text-lg font-black text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Achievement grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements
            .sort((a, b) => (b.unlocked ? 1 : 0) - (a.unlocked ? 1 : 0))
            .map((ach) => {
              const style = RARITY_STYLE[ach.rarity];
              return (
                <div
                  key={ach.id}
                  className={`flex items-start gap-4 rounded-xl border p-4 transition-all duration-300 ${
                    ach.unlocked
                      ? `${style.border} ${style.bg}`
                      : "border-border bg-card opacity-50 grayscale"
                  }`}
                >
                  <div className={`text-3xl shrink-0 w-12 h-12 flex items-center justify-center rounded-xl ${ach.unlocked ? style.bg : "bg-muted"} border ${ach.unlocked ? style.border : "border-border"}`}>
                    {ach.unlocked ? ach.icon : "🔒"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-foreground">{ach.title}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ach.desc}</p>
                    {ach.unlocked && (
                      <p className="text-xs text-emerald-400 mt-1 font-semibold">✓ Conquistada</p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
