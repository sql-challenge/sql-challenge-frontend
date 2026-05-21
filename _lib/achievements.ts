import {
  Activity, Award, BookOpen, CheckCircle, Clipboard, Clock, Compass,
  Cpu, Droplet, Feather, Folder, Globe, HelpCircle, Lock, Monitor,
  Search, Server, Shield, Star, Terminal, TrendingUp, X, Zap,
} from "feather-icons-react";
import type { User } from "@/_lib/types/user";

// ── Types ───────────────────────────────────────────────────────────────────
export interface Achievement {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  rarity: "comum" | "raro" | "épico" | "lendário";
}

// ── Icon map ────────────────────────────────────────────────────────────────
export const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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

// ── Styles ──────────────────────────────────────────────────────────────────
export const RARITY_STYLE: Record<string, { label: string; border: string; bg: string; badge: string; icon: string }> = {
  comum:    { label: "Comum",    border: "border-slate-500/30",  bg: "bg-slate-500/5",  badge: "bg-slate-500/10  text-slate-400  border-slate-500/30",  icon: "text-slate-400"  },
  raro:     { label: "Raro",     border: "border-blue-500/40",   bg: "bg-blue-500/5",   badge: "bg-blue-500/10   text-blue-400   border-blue-500/30",   icon: "text-blue-400"   },
  épico:    { label: "Épico",    border: "border-purple-500/40", bg: "bg-purple-500/5", badge: "bg-purple-500/10 text-purple-400 border-purple-500/30", icon: "text-purple-400" },
  lendário: { label: "Lendário", border: "border-yellow-500/40", bg: "bg-yellow-500/5", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: "text-yellow-400" },
};

export const RARITY_XP: Record<string, number> = {
  comum: 50, raro: 150, épico: 300, lendário: 500,
};

// ── Achievement definitions ─────────────────────────────────────────────────
export function buildAchievements(user: User | null): Achievement[] {
  const progress     = user?.challenge_progress ?? [];
  const totalCaps    = progress.reduce((acc, p) => acc + (p.capFinish    ?? 0), 0);
  const totalXP      = user?.xp ?? 0;
  const totalDesafios = progress.length;
  const totalQueries = progress.reduce((acc, p) => acc + (p.totalQueries ?? 0), 0);
  const totalMinutes = Math.floor(progress.reduce((acc, p) => acc + (p.totalSeconds ?? 0), 0) / 60);
  const totalHints   = progress.reduce((acc, p) => acc + (p.totalHints   ?? 0), 0);

  return [
    { id: "first_blood",   title: "Primeira Gota de Sangue", desc: "Complete o seu primeiro capítulo.",                        rarity: "comum",    unlocked: totalCaps >= 1 },
    { id: "3_chapters",    title: "Aprendiz do Método",      desc: "Complete 3 capítulos no total.",                           rarity: "comum",    unlocked: totalCaps >= 3 },
    { id: "10_chapters",   title: "Investigador Dedicado",   desc: "Complete 10 capítulos no total.",                          rarity: "raro",     unlocked: totalCaps >= 10 },
    { id: "xp_500",        title: "Faísca de Gênio",         desc: "Acumule 500 XP.",                                          rarity: "comum",    unlocked: totalXP >= 500 },
    { id: "xp_2000",       title: "Detetive em Ascensão",    desc: "Acumule 2.000 XP.",                                        rarity: "raro",     unlocked: totalXP >= 2000 },
    { id: "xp_5000",       title: "Elite da Investigação",   desc: "Acumule 5.000 XP.",                                        rarity: "épico",    unlocked: totalXP >= 5000 },
    { id: "xp_10000",      title: "Mestre SQL",              desc: "Acumule 10.000 XP. O topo do mundo mágico.",               rarity: "lendário", unlocked: totalXP >= 10000 },
    { id: "multi_case",    title: "Detetive Polivalente",    desc: "Inicie 3 casos diferentes.",                               rarity: "raro",     unlocked: totalDesafios >= 3 },
    { id: "5_cases",       title: "Lenda do Arquivo",        desc: "Complete pelo menos 1 capítulo em 5 casos diferentes.",    rarity: "épico",    unlocked: totalDesafios >= 5 },
    { id: "queries_10",    title: "Digitador Curioso",       desc: "Execute 10 queries.",                                      rarity: "comum",    unlocked: totalQueries >= 10 },
    { id: "queries_100",   title: "Analista de Dados",       desc: "Execute 100 queries.",                                     rarity: "raro",     unlocked: totalQueries >= 100 },
    { id: "queries_500",   title: "Máquina de Consultas",    desc: "Execute 500 queries.",                                     rarity: "épico",    unlocked: totalQueries >= 500 },
    { id: "time_30",       title: "Detetive Dedicado",       desc: "Jogue por 30 minutos no total.",                           rarity: "comum",    unlocked: totalMinutes >= 30 },
    { id: "time_120",      title: "Mergulho Profundo",       desc: "Jogue por 2 horas no total.",                              rarity: "raro",     unlocked: totalMinutes >= 120 },
    { id: "time_600",      title: "Guardião do Arquivo",     desc: "Jogue por 10 horas no total.",                             rarity: "épico",    unlocked: totalMinutes >= 600 },
    { id: "no_hints",      title: "Voo Solo",                desc: "Complete um capítulo sem usar nenhuma dica.",              rarity: "raro",     unlocked: progress.some((p) => (p.totalHints ?? 0) === 0 && (p.capFinish ?? 0) > 0) },
    { id: "hints_0_total", title: "Mente Pura",              desc: "Complete 5 capítulos sem usar nenhuma dica.",              rarity: "épico",    unlocked: totalHints === 0 && totalCaps >= 5 },
    { id: "sql_master",    title: "Arcano do SQL",           desc: "Complete todos os casos disponíveis.",                     rarity: "lendário", unlocked: false },
  ];
}

export function getQuickAchievements(user: User | null): { id: string; icon: string; title: string; unlocked: boolean }[] {
  const all = buildAchievements(user);
  const ids = new Set(["first_blood", "xp_500", "xp_2000", "xp_5000", "multi_case", "queries_10"]);
  const iconMap: Record<string, string> = {
    first_blood: "🩸", xp_500: "⚡", xp_2000: "🔥", xp_5000: "💎", multi_case: "🗂️", queries_10: "⌨️",
  };
  return all.filter((a) => ids.has(a.id)).map((a) => ({
    id: a.id, icon: iconMap[a.id] ?? "🏅", title: a.title, unlocked: a.unlocked,
  }));
}
