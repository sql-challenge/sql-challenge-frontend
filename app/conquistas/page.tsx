"use client";

import { useEffect, useRef, useState } from "react";
import {
  Award, BookOpen, CheckCircle, Clipboard, Clock, HelpCircle,
  Lock, Terminal, Zap,
} from "feather-icons-react";
import { Header } from "@/_components/_organisms/header";
import { AchievementPopup } from "@/_components/_organisms/achievementPopup";
import { ProtectedRoute } from "@/_components/_organisms/protectedRoute";
import { useUser } from "@/_context/userContext";
import { api } from "@/_lib/api";
import {
  type Achievement, buildAchievements, ICONS, RARITY_STYLE, RARITY_XP,
} from "@/_lib/achievements";
import { useAchievements } from "@/_hooks/useAchievements";

const formatTime = (mins: number) => {
  if (mins < 60) return `${mins}min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
};

export default function ConquistasPage() {
  const { user, updateUserLocal } = useUser();
  const { newlyUnlocked, checkAchievements, clearNewly } = useAchievements();
  const hasLoaded = useRef(false);

  const [isLoading, setIsLoading] = useState(true);

  // Busca dados frescos do Firestore e detecta conquistas novas numa única passagem
  useEffect(() => {
    if (!user?.uid || hasLoaded.current) return;
    hasLoaded.current = true;
    const fetchUserByUid = async (uid: string) => {
      return api.get<typeof user>(`/api/user/uid/${uid}`);
    };

    const localXpSnapshot = user.xp ?? 0;
    fetchUserByUid(user.uid)
      .then(async (fresh) => {
        setIsLoading(false);
        if (!fresh?.uid) return;

        let syncedUser = fresh;
        if (localXpSnapshot > (fresh.xp ?? 0)) {
          await api.put("/api/user/", { uid: fresh.uid, xp: localXpSnapshot }).catch((err) => console.error("XP sync error:", err));
          syncedUser = { ...fresh, xp: localXpSnapshot };
        }
        if (syncedUser.xp !== user?.xp || syncedUser.username !== user?.username) {
          updateUserLocal(syncedUser);
        }

        await checkAchievements(syncedUser);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error("Achievement fetch error:", err);
      });
  }, [user?.uid, updateUserLocal, checkAchievements]);

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
          <AchievementPopup
            achievements={newlyUnlocked}
            onClose={() => clearNewly()}
          />
        )}

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}

          {!isLoading && (
          <>
          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-6 sm:mb-8 flex-wrap gap-3 sm:gap-4">
            <div>
              <Award className="w-8 sm:w-10 h-8 sm:h-10 text-primary mb-1 sm:mb-2" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Conquistas</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Sua jornada como detetive SQL</p>
            </div>
            <div className="text-right">
              <p className="text-2xl sm:text-4xl font-black text-primary">
                {unlocked}
                <span className="text-base sm:text-xl text-muted-foreground">/{achievements.length}</span>
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">conquistadas</p>
              <div className="mt-1 sm:mt-2 h-1.5 sm:h-2 w-28 sm:w-40 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{pct}% completo</p>
            </div>
          </div>

          {/* ── Stats ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6 sm:mb-8">
            {stats.map(({ Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-card px-2 sm:px-4 py-2 sm:py-3 text-center">
                <Icon className="w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-0.5 sm:mb-1 text-primary" />
                <p className="text-sm sm:text-lg font-black text-foreground truncate">{value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{label}</p>
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
          </>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
