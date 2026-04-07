"use client";

import { useEffect, useState } from "react";
import { Header } from "@/_components/_organisms/header";
import { ProtectedRoute } from "@/_components/_organisms/protectedRoute";
import { useUser } from "@/_context/userContext";
import { User } from "@/_lib/types/user";

const MEDAL = ["🥇", "🥈", "🥉"];
const LEVEL_FROM_XP = (xp: number) => {
  if (xp >= 10000) return { label: "Mestre SQL",    color: "text-yellow-400"  };
  if (xp >= 5000)  return { label: "Detetive Sênior",color: "text-purple-400" };
  if (xp >= 2000)  return { label: "Investigador",  color: "text-blue-400"    };
  if (xp >= 500)   return { label: "Recruta",       color: "text-emerald-400" };
  return               { label: "Novato",           color: "text-muted-foreground" };
};

export default function RankingPage() {
  const { user: me } = useUser();
  const [players, setPlayers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/top?limit=20`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        // endpoint retorna array direto (sem wrapper data)
        setPlayers(Array.isArray(data) ? data : data.data ?? []);
      } catch {
        setError("Não foi possível carregar o ranking.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const myPosition = players.findIndex((p) => p.uid === me?.uid) + 1;

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">Ranking Global</h1>
          <p className="text-muted-foreground">Os melhores detetives SQL do mundo mágico</p>
          {me && myPosition > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold">
              Você está em <span className="text-lg font-black">#{myPosition}</span>
            </div>
          )}
        </div>

        {/* Top 3 Podium */}
        {!isLoading && !error && players.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-10">
            {[1, 0, 2].map((idx) => {
              const p = players[idx];
              const height = idx === 0 ? "h-32" : idx === 1 ? "h-24" : "h-20";
              const pos = idx + 1;
              const lvl = LEVEL_FROM_XP(p.xp);
              return (
                <div key={p.uid} className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
                  <div className="text-2xl">{MEDAL[idx]}</div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border-2 border-primary/40 flex items-center justify-center text-xl font-black text-primary">
                    {p.username?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <p className="text-xs font-bold text-foreground text-center line-clamp-1">{p.username}</p>
                  <p className={`text-xs ${lvl.color}`}>{lvl.label}</p>
                  <p className="text-sm font-black text-primary">{p.xp.toLocaleString()} XP</p>
                  <div className={`w-full ${height} rounded-t-lg ${idx === 0 ? "bg-yellow-500/20 border border-yellow-500/30" : idx === 1 ? "bg-slate-400/20 border border-slate-400/30" : "bg-amber-700/20 border border-amber-700/30"} flex items-center justify-center`}>
                    <span className="text-2xl font-black text-muted-foreground">#{pos}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        {isLoading && (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse flex items-center gap-4">
                <div className="w-8 h-6 bg-muted rounded" />
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
                <div className="h-5 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-400">{error}</div>
        )}

        {!isLoading && !error && (
          <div className="space-y-2">
            {players.map((p, i) => {
              const isMe = p.uid === me?.uid;
              const lvl = LEVEL_FROM_XP(p.xp);
              const progressPct = Math.min(100, (p.xp / 10000) * 100);
              return (
                <div
                  key={p.uid}
                  className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-all ${
                    isMe
                      ? "border-primary/50 bg-primary/5 shadow-sm shadow-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  {/* Position */}
                  <div className="w-8 text-center font-black text-lg shrink-0">
                    {i < 3 ? MEDAL[i] : <span className="text-muted-foreground text-sm">#{i + 1}</span>}
                  </div>

                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-black border-2 shrink-0 ${isMe ? "border-primary bg-primary/20 text-primary" : "border-border bg-muted text-muted-foreground"}`}>
                    {p.username?.[0]?.toUpperCase() ?? "?"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                        {p.username}
                        {isMe && <span className="ml-1 text-xs opacity-60">(você)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${lvl.color}`}>{lvl.label}</span>
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[80px]">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right shrink-0">
                    <p className="font-black text-sm text-primary">{p.xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              );
            })}

            {players.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Ainda não há jogadores no ranking. Seja o primeiro!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
