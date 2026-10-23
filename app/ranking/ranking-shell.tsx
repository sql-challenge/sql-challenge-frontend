"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/_components/_organisms/header";
import { ProtectedRoute } from "@/_components/_organisms/protectedRoute";
import { useUser } from "@/_context/userContext";
import { User } from "@/_lib/types/user";
import { api } from "@/_lib/api";
import { Award, TrendingUp } from "feather-icons-react";

const LEVEL_FROM_XP = (xp: number) => {
  if (xp >= 10000) return { label: "Mestre SQL",     color: "text-warning" };
  if (xp >= 5000)  return { label: "Detetive Sênior", color: "text-accent" };
  if (xp >= 2000)  return { label: "Investigador",    color: "text-primary" };
  if (xp >= 500)   return { label: "Recruta",         color: "text-success" };
  return                 { label: "Novato",           color: "text-muted-foreground" };
};

const PODIUM = {
  0: { color: "text-warning",  block: "border-warning/50 bg-warning/15" },
  1: { color: "text-muted-foreground", block: "border-border bg-muted/50" },
  2: { color: "text-accent",   block: "border-accent/40 bg-accent/10" },
} as const;

const POLL_INTERVAL_MS = 60_000;

export function RankingShell({ initialPlayers }: { initialPlayers: Record<string, unknown>[] }) {
  const { user: me } = useUser();
  const [players, setPlayers] = useState<User[]>(() => initialPlayers as unknown as User[]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => initialPlayers.length === 0);
  const mountedRef = useRef(true);

  const loadRanking = useCallback(async () => {
    try {
      const data = await api.get<User[]>("/api/user/top?limit=20");
      if (mountedRef.current) {
        setPlayers(data);
        setError(null);
      }
    } catch {
      if (mountedRef.current) {
        setError("Não foi possível carregar o ranking.");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // Carrega imediatamente: o prefetch do servidor pode ter falhado (timeout),
    // e o primeiro poll não pode esperar o intervalo inteiro.
    void loadRanking();
    const interval = setInterval(() => loadRanking(), POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [loadRanking]);

  const myPosition = players.findIndex((p) => p.uid === me?.uid) + 1;

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Award className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h1 className="text-2xl sm:text-4xl font-display tracking-wide text-foreground mb-2">Ranking Global</h1>
          <p className="text-muted-foreground">Os melhores detetives SQL do mundo mágico</p>
          {me && myPosition > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 border-2 border-primary/40 bg-primary/10 px-4 py-2 text-primary text-sm font-semibold">
              Você está em <span className="font-mono text-lg font-black tabular-nums">#{myPosition}</span>
            </div>
          )}
        </div>

        {/* Top 3 Podium */}
        {!error && players.length >= 3 && (
          <div className="flex items-end justify-center gap-1 sm:gap-3 mb-8 sm:mb-10">
            {[1, 0, 2].map((idx) => {
              const p = players[idx];
              const height = idx === 0 ? "h-24 sm:h-32" : idx === 1 ? "h-20 sm:h-24" : "h-16 sm:h-20";
              const pos = idx + 1;
              const lvl = LEVEL_FROM_XP(p.xp);
              const podium = PODIUM[idx as 0 | 1 | 2];
              return (
                <div key={p.uid} className="flex flex-col items-center gap-1 sm:gap-2 flex-1 max-w-[90px] sm:max-w-[140px]">
                  <Award className={`w-5 h-5 sm:w-6 sm:h-6 ${podium.color}`} />
                  <div className="w-8 sm:w-12 h-8 sm:h-12 border-2 border-primary/40 bg-primary/10 flex items-center justify-center text-sm sm:text-xl font-black text-primary">
                    {p.username?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-foreground text-center line-clamp-1">{p.username}</p>
                  <p className={`text-[11px] sm:text-xs ${lvl.color}`}>{lvl.label}</p>
                  <p className="font-mono text-[11px] sm:text-sm font-black text-primary tabular-nums">{p.xp.toLocaleString()} XP</p>
                  <div className={`w-full ${height} border-2 ${podium.block} flex items-center justify-center`}>
                    <span className="font-mono text-base sm:text-2xl font-black text-muted-foreground tabular-nums">#{pos}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12 text-destructive">{error}</div>
        )}

        {/* Full list */}
        {!error && (
          <div className="space-y-2">
            {players.map((p, i) => {
              const isMe = p.uid === me?.uid;
              const lvl = LEVEL_FROM_XP(p.xp);
              const progressPct = Math.min(100, (p.xp / 10000) * 100);
              return (
                <div
                  key={p.uid}
                  className={`flex items-center gap-2 sm:gap-4 border-2 px-3 sm:px-4 py-2.5 sm:py-3 transition-all ${
                    isMe
                      ? "border-primary/50 bg-primary/5 shadow-pixel-sm"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="w-6 sm:w-8 text-center font-mono font-black text-base sm:text-lg shrink-0">
                    {i < 3 ? (
                      <Award className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto ${PODIUM[i as 0 | 1 | 2].color}`} />
                    ) : (
                      <span className="text-muted-foreground text-[11px] sm:text-sm tabular-nums">#{i + 1}</span>
                    )}
                  </div>

                  <div className={`w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-xs sm:text-base font-black border-2 shrink-0 ${isMe ? "border-primary bg-primary/20 text-primary" : "border-border bg-muted text-muted-foreground"}`}>
                    {p.username?.[0]?.toUpperCase() ?? "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-xs sm:text-sm truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                        {p.username}
                        {isMe && <span className="ml-1 text-[11px] sm:text-xs opacity-60">(você)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
                      <span className={`text-[11px] sm:text-xs ${lvl.color}`}>{lvl.label}</span>
                      <div className="pixel-inset h-2 flex-1 max-w-[60px] sm:max-w-[80px] overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono font-black text-xs sm:text-sm text-primary tabular-nums">{p.xp.toLocaleString()}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              );
            })}

            {loading && players.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-muted-foreground animate-pulse" />
                <p className="text-base font-semibold text-foreground">Carregando ranking...</p>
              </div>
            )}

            {!loading && players.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-base font-semibold text-foreground">Ranking vazio</p>
                <p className="text-sm mt-1">Ainda não há detetives registrados. Seja o primeiro a investigar!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
