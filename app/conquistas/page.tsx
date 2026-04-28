"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity, Award, BookOpen, CheckCircle, Clipboard, Clock, Compass,
  Cpu, Droplet, Feather, Folder, Globe, HelpCircle, Lock, Monitor,
  Search, Server, Shield, Star, Terminal, TrendingUp, X, Zap,
} from "feather-icons-react";
import { Header } from "@/_components/_organisms/header";
import { ProtectedRoute } from "@/_components/_organisms/protectedRoute";
import { useUser } from "@/_context/userContext";
import { api } from "@/_lib/api";
import type { User } from "@/_lib/types/user";

// ── Icon map ───────────────────────────────────────────────────────────────
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  first_blood:   Droplet,
  "3_chapters":  BookOpen,
  "10_chapters": Search,
  xp_500:        Zap,
  xp_2000:       TrendingUp,
  xp_5000:       Star,
  xp_10000:      Award,
  multi_case:    Folder,
  "5_cases":     Globe,
  queries_10:    Terminal,
  queries_100:   Monitor,
  queries_500:   Cpu,
  time_30:       Clock,
  time_120:      Shield,
  time_600:      Server,
  no_hints:      Feather,
  hints_0_total: Activity,
  sql_master:    Compass,
};

// ── Types ──────────────────────────────────────────────────────────────────
interface Achievement {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  rarity: "comum" | "raro" | "épico" | "lendário";
}

// ── Styles ─────────────────────────────────────────────────────────────────
const RARITY_STYLE = {
  comum:    { label: "Comum",    border: "border-slate-500/30",  bg: "bg-slate-500/5",  badge: "bg-slate-500/10  text-slate-400  border-slate-500/30",  icon: "text-slate-400"  },
  raro:     { label: "Raro",     border: "border-blue-500/40",   bg: "bg-blue-500/5",   badge: "bg-blue-500/10   text-blue-400   border-blue-500/30",   icon: "text-blue-400"   },
  épico:    { label: "Épico",    border: "border-purple-500/40", bg: "bg-purple-500/5", badge: "bg-purple-500/10 text-purple-400 border-purple-500/30", icon: "text-purple-400" },
  lendário: { label: "Lendário", border: "border-yellow-500/40", bg: "bg-yellow-500/5", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: "text-yellow-400" },
};

const RARITY_XP: Record<string, number> = {
  comum: 50, raro: 150, épico: 300, lendário: 500,
};

// ── Achievement definitions ────────────────────────────────────────────────
function buildAchievements(user: User | null): Achievement[] {
  const progress     = user?.challenge_progress ?? [];
  const totalCaps    = progress.reduce((acc, p) => acc + (p.capFinish    ?? 0), 0);
  const totalXP      = user?.xp ?? 0;
  const totalDesafios = progress.length;
  const totalQueries = progress.reduce((acc, p) => acc + (p.totalQueries ?? 0), 0);
  const totalMinutes = Math.floor(progress.reduce((acc, p) => acc + (p.totalSeconds ?? 0), 0) / 60);
  const totalHints   = progress.reduce((acc, p) => acc + (p.totalHints   ?? 0), 0);

  return [
    // Capítulos
    { id: "first_blood",   title: "Primeira Gota de Sangue", desc: "Complete o seu primeiro capítulo.",                        rarity: "comum",    unlocked: totalCaps >= 1 },
    { id: "3_chapters",    title: "Aprendiz do Método",      desc: "Complete 3 capítulos no total.",                           rarity: "comum",    unlocked: totalCaps >= 3 },
    { id: "10_chapters",   title: "Investigador Dedicado",   desc: "Complete 10 capítulos no total.",                          rarity: "raro",     unlocked: totalCaps >= 10 },
    // XP
    { id: "xp_500",        title: "Faísca de Gênio",         desc: "Acumule 500 XP.",                                          rarity: "comum",    unlocked: totalXP >= 500 },
    { id: "xp_2000",       title: "Detetive em Ascensão",    desc: "Acumule 2.000 XP.",                                        rarity: "raro",     unlocked: totalXP >= 2000 },
    { id: "xp_5000",       title: "Elite da Investigação",   desc: "Acumule 5.000 XP.",                                        rarity: "épico",    unlocked: totalXP >= 5000 },
    { id: "xp_10000",      title: "Mestre SQL",              desc: "Acumule 10.000 XP. O topo do mundo mágico.",               rarity: "lendário", unlocked: totalXP >= 10000 },
    // Casos
    { id: "multi_case",    title: "Detetive Polivalente",    desc: "Inicie 3 casos diferentes.",                               rarity: "raro",     unlocked: totalDesafios >= 3 },
    { id: "5_cases",       title: "Lenda do Arquivo",        desc: "Complete pelo menos 1 capítulo em 5 casos diferentes.",    rarity: "épico",    unlocked: totalDesafios >= 5 },
    // Queries
    { id: "queries_10",    title: "Digitador Curioso",       desc: "Execute 10 queries.",                                      rarity: "comum",    unlocked: totalQueries >= 10 },
    { id: "queries_100",   title: "Analista de Dados",       desc: "Execute 100 queries.",                                     rarity: "raro",     unlocked: totalQueries >= 100 },
    { id: "queries_500",   title: "Máquina de Consultas",    desc: "Execute 500 queries.",                                     rarity: "épico",    unlocked: totalQueries >= 500 },
    // Tempo
    { id: "time_30",       title: "Detetive Dedicado",       desc: "Jogue por 30 minutos no total.",                           rarity: "comum",    unlocked: totalMinutes >= 30 },
    { id: "time_120",      title: "Mergulho Profundo",       desc: "Jogue por 2 horas no total.",                              rarity: "raro",     unlocked: totalMinutes >= 120 },
    { id: "time_600",      title: "Guardião do Arquivo",     desc: "Jogue por 10 horas no total.",                             rarity: "épico",    unlocked: totalMinutes >= 600 },
    // Habilidade
    { id: "no_hints",      title: "Voo Solo",                desc: "Complete um capítulo sem usar nenhuma dica.",              rarity: "raro",     unlocked: progress.some((p) => (p.totalHints ?? 0) === 0 && (p.capFinish ?? 0) > 0) },
    { id: "hints_0_total", title: "Mente Pura",              desc: "Complete 5 capítulos sem usar nenhuma dica.",              rarity: "épico",    unlocked: totalHints === 0 && totalCaps >= 5 },
    { id: "sql_master",    title: "Arcano do SQL",           desc: "Complete todos os casos disponíveis.",                     rarity: "lendário", unlocked: false },
  ];
}

const formatTime = (mins: number) => {
  if (mins < 60) return `${mins}min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
};

// ── Page ───────────────────────────────────────────────────────────────────
export default function ConquistasPage() {
  const { user, updateUserLocal } = useUser();
  const hasLoaded = useRef(false);

  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  // Busca dados frescos do Firestore e detecta conquistas novas numa única passagem
  useEffect(() => {
    if (!user?.uid || hasLoaded.current) return;
    hasLoaded.current = true;
    const fetchUserByUid = async (uid: string): Promise<User> => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/uid/${uid}`);
      if (!response.ok) throw new Error("Falha ao buscar usuário");
      const payload = await response.json();
      return (payload?.data ?? payload) as User;
    };

    const localXpSnapshot = user.xp ?? 0;
    fetchUserByUid(user.uid)
      .then(async (fresh) => {
        if (!fresh?.uid) return;

        let syncedUser = fresh;
        if (localXpSnapshot > (fresh.xp ?? 0)) {
          await api.put("/api/user/", { uid: fresh.uid, xp: localXpSnapshot }).catch(() => {});
          syncedUser = { ...fresh, xp: localXpSnapshot };
        }
        updateUserLocal(syncedUser);

        const achievements = buildAchievements(syncedUser);
        const awarded: string[] = syncedUser.awardedAchievements ?? [];
        const newOnes = achievements.filter((a) => a.unlocked && !awarded.includes(a.id));
        if (newOnes.length === 0) return;

        const promises = newOnes.map(async (a) => {
          const xp = RARITY_XP[a.rarity] ?? 50;
          try {
            const resp = await api.post<{ awarded: boolean }>(
              `/api/user/${syncedUser.uid}/achievements/award`,
              { achievementId: a.id, xpBonus: xp }
            );
            return resp?.awarded ? { id: a.id, xp } : null;
          } catch {
            return null;
          }
        });

        Promise.all(promises).then(async (results) => {
          const granted = results.filter((r): r is { id: string; xp: number } => r !== null);
          if (granted.length === 0) return;

          const refreshed = await fetchUserByUid(syncedUser.uid).catch(() => null);
          if (refreshed?.uid) {
            updateUserLocal(refreshed);
          } else {
            const totalXpBonus = granted.reduce((sum, g) => sum + g.xp, 0);
            const awardedMerged = [...new Set([...awarded, ...granted.map((g) => g.id)])];
            updateUserLocal({
              xp: (syncedUser.xp ?? 0) + totalXpBonus,
              awardedAchievements: awardedMerged,
            });
          }
          const grantedIds = new Set(granted.map((g) => g.id));
          setNewlyUnlocked(newOnes.filter((a) => grantedIds.has(a.id)));
        });
      })
      .catch(() => {});
  }, [user?.uid, user?.xp, updateUserLocal]);

  const achievements = buildAchievements(user);
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const pct = Math.round((unlocked / achievements.length) * 100);

  const progress     = user?.challenge_progress ?? [];
  const totalQueries = progress.reduce((acc, p) => acc + (p.totalQueries ?? 0), 0);
  const totalMinutes = Math.floor(progress.reduce((acc, p) => acc + (p.totalSeconds ?? 0), 0) / 60);
  const totalHints   = progress.reduce((acc, p) => acc + (p.totalHints   ?? 0), 0);
  const totalCaps    = progress.reduce((acc, p) => acc + (p.capFinish    ?? 0), 0);

  const stats = [
    { Icon: Zap,        label: "XP Total",        value: (user?.xp ?? 0).toLocaleString() },
    { Icon: BookOpen,   label: "Caps Completos",  value: totalCaps },
    { Icon: Clipboard,  label: "Casos Iniciados", value: progress.length },
    { Icon: Terminal,   label: "Queries",         value: totalQueries.toLocaleString() },
    { Icon: Clock,      label: "Tempo Jogado",    value: formatTime(totalMinutes) },
    { Icon: HelpCircle, label: "Dicas Usadas",    value: totalHints },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        {/* ── Popup de conquista desbloqueada ─────────────────────── */}
        {newlyUnlocked.length > 0 && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
                    Parabéns!
                  </p>
                  <h3 className="text-xl font-extrabold text-foreground">
                    {newlyUnlocked.length === 1
                      ? "Conquista Desbloqueada"
                      : `${newlyUnlocked.length} Conquistas Desbloqueadas`}
                  </h3>
                </div>
                <button
                  onClick={() => setNewlyUnlocked([])}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {newlyUnlocked.map((ach) => {
                  const Icon  = ICONS[ach.id] ?? Award;
                  const style = RARITY_STYLE[ach.rarity];
                  const xp    = RARITY_XP[ach.rarity];
                  return (
                    <div
                      key={ach.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${style.border} ${style.bg}`}
                    >
                      <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border ${style.border} ${style.bg}`}>
                        <Icon className={`w-5 h-5 ${style.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground leading-tight">{ach.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{ach.desc}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-yellow-400">+{xp} XP</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${style.badge}`}>
                          {style.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setNewlyUnlocked([])}
                className="mt-4 w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Incrível!
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <Award className="w-10 h-10 text-primary mb-2" />
              <h1 className="text-3xl font-extrabold text-foreground">Conquistas</h1>
              <p className="text-muted-foreground mt-1">Sua jornada como detetive SQL</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-primary">
                {unlocked}
                <span className="text-xl text-muted-foreground">/{achievements.length}</span>
              </p>
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

          {/* ── Stats ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {stats.map(({ Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-card px-4 py-3 text-center">
                <Icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-black text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* ── Achievement grid ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements
              .sort((a, b) => (b.unlocked ? 1 : 0) - (a.unlocked ? 1 : 0))
              .map((ach) => {
                const Icon  = ICONS[ach.id] ?? Award;
                const style = RARITY_STYLE[ach.rarity];
                const xpReward = RARITY_XP[ach.rarity] ?? 50;
                return (
                  <div
                    key={ach.id}
                    className={`flex items-start gap-4 rounded-xl border p-4 transition-all duration-300 ${
                      ach.unlocked
                        ? `${style.border} ${style.bg}`
                        : "border-border bg-card opacity-50 grayscale"
                    }`}
                  >
                    <div
                      className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border ${
                        ach.unlocked ? `${style.border} ${style.bg}` : "border-border bg-muted"
                      }`}
                    >
                      {ach.unlocked
                        ? <Icon className={`w-6 h-6 ${style.icon}`} />
                        : <Lock className="w-5 h-5 text-muted-foreground" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-foreground">{ach.title}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${style.badge}`}>
                          {style.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ach.desc}</p>
                      <p className="text-xs text-primary/90 mt-1 font-semibold">
                        Recompensa ao desbloquear: +{xpReward} XP
                      </p>
                      {ach.unlocked && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <p className="text-xs text-emerald-400 font-semibold">Conquistada</p>
                        </div>
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
