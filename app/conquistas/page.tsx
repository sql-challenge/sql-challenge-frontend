"use client";

import { Header } from "@/_components/_organisms/header";
import { useUser } from "@/_context/userContext";
import Link from "next/link";

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
  const progress = (user as any)?.challenge_progress ?? [];
  const totalCaps = progress.reduce((acc: number, p: any) => acc + (p.capFinish ?? 0), 0);
  const totalXP = user?.xp ?? 0;
  const totalDesafios = progress.length;

  return [
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
    {
      id: "speedster",
      icon: "🚀",
      title: "Relâmpago",
      desc: "Conquiste o bônus Ouro 🥇 em qualquer capítulo.",
      rarity: "épico",
      unlocked: false, // sem data de tier por enquanto
    },
    {
      id: "no_hints",
      icon: "🦅",
      title: "Voo Solo",
      desc: "Complete um capítulo sem usar nenhuma dica.",
      rarity: "raro",
      unlocked: false,
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

export default function ConquistasPage() {
  const { user } = useUser();
  const achievements = buildAchievements(user);
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const pct = Math.round((unlocked / achievements.length) * 100);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <div className="text-5xl">🔒</div>
          <h2 className="text-2xl font-bold text-foreground">Acesso restrito</h2>
          <p className="text-muted-foreground">Faça login para ver suas conquistas.</p>
          <Link
            href="/auth/login"
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: "⚡", label: "XP Total", value: (user.xp ?? 0).toLocaleString() },
            { icon: "📋", label: "Casos Iniciados", value: ((user as any).challenge_progress?.length ?? 0) },
            { icon: "📖", label: "Caps Completos", value: (user as any).challenge_progress?.reduce((a: number, p: any) => a + (p.capFinish ?? 0), 0) ?? 0 },
            { icon: "🏅", label: "Posição", value: `#${user.rankingPosition || "—"}` },
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
  );
}
