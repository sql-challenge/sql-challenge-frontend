"use client";

import { useState, useEffect } from "react";
import { Header } from "@/_components/_organisms/header";
import { ProtectedRoute } from "@/_components/_organisms/protectedRoute";
import { useUser } from "@/_context/userContext";
import { api } from "@/_lib/api";
import { Friend, User } from "@/_lib/types/user";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from "recharts";

// ── XP por raridade de conquista ───────────────────────────
const ACHIEVEMENT_XP: Record<string, number> = {
  comum: 50, raro: 150, épico: 300, lendário: 500,
};

// ── Spider chart ──────────────────────────────────────────
function buildRadarData(u: User | null, compare?: User | null) {
  if (!u) return [];
  const progress = u.challenge_progress ?? [];
  const queries  = progress.reduce((a, p) => a + (p.totalQueries ?? 0), 0);
  const minutes  = Math.floor(progress.reduce((a, p) => a + (p.totalSeconds ?? 0), 0) / 60);
  const hints    = progress.reduce((a, p) => a + (p.totalHints ?? 0), 0);
  const caps     = progress.reduce((a, p) => a + (p.capFinish ?? 0), 0);
  const xp       = u.xp ?? 0;

  const max = { queries: 500, minutes: 600, xp: 10000, caps: 20, hints: 50 };

  const pct = (v: number, m: number) => Math.min(100, Math.round((v / m) * 100));

  const base = [
    { axis: "Queries",    value: pct(queries, max.queries),  raw: queries },
    { axis: "Tempo (min)",value: pct(minutes, max.minutes),  raw: minutes },
    { axis: "XP",         value: pct(xp, max.xp),           raw: xp.toLocaleString() },
    { axis: "Capítulos",  value: pct(caps, max.caps),        raw: caps },
    { axis: "Dicas",      value: pct(hints, max.hints),      raw: hints },
  ];

  if (!compare) return base;

  const cp = compare.challenge_progress ?? [];
  const cq = cp.reduce((a, p) => a + (p.totalQueries ?? 0), 0);
  const cm = Math.floor(cp.reduce((a, p) => a + (p.totalSeconds ?? 0), 0) / 60);
  const ch = cp.reduce((a, p) => a + (p.totalHints ?? 0), 0);
  const cc = cp.reduce((a, p) => a + (p.capFinish ?? 0), 0);
  const cx = compare.xp ?? 0;

  return [
    { axis: "Queries",    value: pct(queries, max.queries),  raw: queries,                friend: pct(cq, max.queries)  },
    { axis: "Tempo (min)",value: pct(minutes, max.minutes),  raw: minutes,                friend: pct(cm, max.minutes)  },
    { axis: "XP",         value: pct(xp, max.xp),           raw: xp.toLocaleString(),    friend: pct(cx, max.xp)       },
    { axis: "Capítulos",  value: pct(caps, max.caps),        raw: caps,                   friend: pct(cc, max.caps)     },
    { axis: "Dicas",      value: pct(hints, max.hints),      raw: hints,                  friend: pct(ch, max.hints)    },
  ];
}

// ── Tabs ─────────────────────────────────────────────────
type Tab = "perfil" | "amigos" | "ranking";

export default function PerfilPage() {
  const { user, updateUser } = useUser();
  const [tab, setTab] = useState<Tab>("perfil");

  // edit form
  const [nick,     setNick]     = useState(user?.nick     ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  // friends
  const [friends,       setFriends]       = useState<Friend[]>([]);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching,     setSearching]     = useState(false);
  const [compareUid,    setCompareUid]    = useState<string | null>(null);
  const [compareUser,   setCompareUser]   = useState<User | null>(null);

  // friend ranking
  const [friendRanking, setFriendRanking] = useState<User[]>([]);

  useEffect(() => {
    if (user) {
      setNick(user.nick ?? "");
      setUsername(user.username ?? "");
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    try {
      const data = await api.get<Friend[]>(`/api/user/${user.uid}/friends`);
      setFriends(data);
    } catch {}
  };

  const loadFriendRanking = async () => {
    if (!user) return;
    try {
      const data = await api.get<User[]>(`/api/user/${user.uid}/friends/ranking`);
      setFriendRanking(data);
    } catch {}
  };

  useEffect(() => {
    if (tab === "ranking") loadFriendRanking();
  }, [tab]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUser({ nick, username });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await api.get<User[]>(`/api/user/name/${encodeURIComponent(searchQuery.trim())}`);
      setSearchResults(results.filter(u => u.uid !== user?.uid));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (targetUid: string) => {
    if (!user) return;
    try {
      await api.post(`/api/user/${user.uid}/friends/${targetUid}`, {});
      await loadFriends();
      setSearchResults([]);
      setSearchQuery("");
    } catch (e: any) {
      alert(e.message ?? "Erro ao adicionar amigo");
    }
  };

  const handleAccept = async (targetUid: string) => {
    if (!user) return;
    await api.put(`/api/user/${user.uid}/friends/${targetUid}/accept`, {});
    await loadFriends();
  };

  const handleRemove = async (targetUid: string) => {
    if (!user) return;
    await api.delete(`/api/user/${user.uid}/friends/${targetUid}`);
    await loadFriends();
    if (compareUid === targetUid) { setCompareUid(null); setCompareUser(null); }
  };

  const handleCompare = async (f: Friend) => {
    if (compareUid === f.uid) { setCompareUid(null); setCompareUser(null); return; }
    try {
      const data = await api.get<User>(`/api/user/uid/${f.uid}`);
      setCompareUser(data);
      setCompareUid(f.uid);
    } catch {}
  };

  const radarData = buildRadarData(user, compareUser);
  const accepted  = friends.filter(f => f.status === "accepted");
  const pending   = friends.filter(f => f.status === "pending");

  const TABS: { id: Tab; label: string }[] = [
    { id: "perfil",  label: "Perfil" },
    { id: "amigos",  label: `Amigos (${accepted.length})` },
    { id: "ranking", label: "Ranking de Amigos" },
  ];

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Avatar + nome */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-3xl font-bold text-primary">
            {(user?.nick || user?.username || "?")[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{user?.nick || user?.username}</h1>
            <p className="text-muted-foreground text-sm">@{user?.username} · {(user?.xp ?? 0).toLocaleString()} XP</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-8">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                tab === t.id
                  ? "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ABA PERFIL ──────────────────────────────────── */}
        {tab === "perfil" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Formulário */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">Editar perfil</h2>

              <div>
                <label className="text-sm text-muted-foreground">Nome de usuário</label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Apelido (nick)</label>
                <input
                  value={nick}
                  onChange={e => setNick(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">E-mail</label>
                <input
                  value={user?.email ?? ""}
                  disabled
                  className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar alterações"}
              </button>
            </div>

            {/* Spider chart */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">Seu radar</h2>
              {compareUser && (
                <p className="text-xs text-muted-foreground mb-2">
                  <span className="text-primary font-semibold">Você</span>
                  {" vs "}
                  <span className="text-blue-400 font-semibold">{compareUser.nick || compareUser.username}</span>
                  {" — selecione um amigo na aba Amigos para comparar"}
                </p>
              )}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Você" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                    {compareUser && (
                      <Radar name={compareUser.nick || compareUser.username} dataKey="friend" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.2} />
                    )}
                    <Tooltip
                      formatter={(value: any, name: string, props: any) => [`${props.payload.raw}`, name]}
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── ABA AMIGOS ──────────────────────────────────── */}
        {tab === "amigos" && (
          <div className="space-y-6">

            {/* Busca */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Buscar jogadores</h2>
              <div className="flex gap-2">
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="Nome de usuário..."
                  className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {searching ? "..." : "Buscar"}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-3 space-y-2">
                  {searchResults.map(u => (
                    <div key={u.uid} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{u.nick || u.username}</p>
                        <p className="text-xs text-muted-foreground">@{u.username} · {(u.xp ?? 0).toLocaleString()} XP</p>
                      </div>
                      <button
                        onClick={() => handleAddFriend(u.uid)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
                      >
                        + Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pendentes */}
            {pending.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3">Solicitações pendentes</h2>
                <div className="space-y-2">
                  {pending.map(f => (
                    <div key={f.uid} className="flex items-center justify-between rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{f.nick || f.username}</p>
                        <p className="text-xs text-muted-foreground">@{f.username} · {(f.xp ?? 0).toLocaleString()} XP</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAccept(f.uid)} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-semibold">Aceitar</button>
                        <button onClick={() => handleRemove(f.uid)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold">Recusar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de amigos */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">Meus amigos</h2>
              {accepted.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum amigo ainda. Busque jogadores acima!</p>
              ) : (
                <div className="space-y-2">
                  {accepted.map(f => (
                    <div key={f.uid} className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${compareUid === f.uid ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`}>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{f.nick || f.username}</p>
                        <p className="text-xs text-muted-foreground">@{f.username} · {(f.xp ?? 0).toLocaleString()} XP · #{f.rankingPosition || "—"}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { handleCompare(f); setTab("perfil"); }}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${compareUid === f.uid ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                        >
                          {compareUid === f.uid ? "Comparando" : "Comparar"}
                        </button>
                        <button onClick={() => handleRemove(f.uid)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold">Remover</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ABA RANKING DE AMIGOS ───────────────────────── */}
        {tab === "ranking" && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Ranking entre amigos</h2>
            {friendRanking.length === 0 ? (
              <p className="text-muted-foreground text-sm">Adicione amigos para ver o ranking!</p>
            ) : (
              <div className="space-y-2">
                {friendRanking.map((u, i) => {
                  const isMe = u.uid === user?.uid;
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                  return (
                    <div key={u.uid} className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-all ${isMe ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`}>
                      <span className="text-xl w-8 text-center">{medal}</span>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-foreground">
                          {u.nick || u.username}
                          {isMe && <span className="ml-2 text-xs text-primary font-semibold">(você)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary">{(u.xp ?? 0).toLocaleString()} XP</p>
                        <div className="mt-1 h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, ((u.xp ?? 0) / Math.max(...friendRanking.map(p => p.xp ?? 0), 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
