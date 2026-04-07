"use client";

import { useState, useEffect } from "react";
import { Header } from "@/_components/_organisms/header";
import { ProtectedRoute } from "@/_components/_organisms/protectedRoute";
import { useUser } from "@/_context/userContext";
import { api } from "@/_lib/api";
import { Friend, User } from "@/_lib/types/user";

// ── XP por raridade de conquista ───────────────────────────
const ACHIEVEMENT_XP: Record<string, number> = {
  comum: 50, raro: 150, épico: 300, lendário: 500,
};

// ── Spider Chart SVG customizado ──────────────────────────
const AXES = [
  { key: "value",  icon: "⌨️", label: "Queries"    },
  { key: "value",  icon: "⏱️", label: "Tempo"      },
  { key: "value",  icon: "⚡", label: "XP"         },
  { key: "value",  icon: "📖", label: "Capítulos"  },
  { key: "value",  icon: "💡", label: "Dicas"      },
];
const N = AXES.length;
const SIZE   = 280;
const CX     = SIZE / 2;
const CY     = SIZE / 2;
const RADIUS = 100;
const LEVELS = 4;

function polar(angle: number, r: number) {
  const a = (angle - 90) * (Math.PI / 180);
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function polyPoints(values: number[], maxR = RADIUS) {
  return values.map((v, i) => {
    const angle = (360 / N) * i;
    const r = (v / 100) * maxR;
    const p = polar(angle, r);
    return `${p.x},${p.y}`;
  }).join(" ");
}

interface SpiderChartProps {
  data: ReturnType<typeof buildRadarData>;
  compareUser: User | null;
}

function SpiderChart({ data, compareUser }: SpiderChartProps) {
  const myValues    = data.map(d => d.value    ?? 0);
  const friendValues= data.map((d: any) => d.friend ?? 0);
  const rawValues   = data.map(d => d.raw);

  const axisAngles = Array.from({ length: N }, (_, i) => (360 / N) * i);

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-background p-5 relative overflow-hidden">
      {/* glow decorativo */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground">Radar de Habilidades</h2>
        {compareUser && (
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />Você</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />{compareUser.nick || compareUser.username}</span>
          </div>
        )}
      </div>

      <svg width="100%" viewBox={`0 0 ${SIZE} ${SIZE}`} className="overflow-visible">
        <defs>
          <radialGradient id="radarGradMe" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id="radarGradFriend" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* grid concêntrico */}
        {Array.from({ length: LEVELS }, (_, lvl) => {
          const r = (RADIUS / LEVELS) * (lvl + 1);
          const pts = Array.from({ length: N }, (__, i) => {
            const p = polar((360 / N) * i, r);
            return `${p.x},${p.y}`;
          }).join(" ");
          return (
            <polygon
              key={lvl}
              points={pts}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={lvl === LEVELS - 1 ? 0.8 : 0.5}
              strokeOpacity={0.5}
            />
          );
        })}

        {/* eixos */}
        {axisAngles.map((angle, i) => {
          const outer = polar(angle, RADIUS);
          return (
            <line
              key={i}
              x1={CX} y1={CY}
              x2={outer.x} y2={outer.y}
              stroke="hsl(var(--border))"
              strokeWidth={0.5}
              strokeOpacity={0.5}
            />
          );
        })}

        {/* área do amigo (primeiro para ficar atrás) */}
        {compareUser && (
          <>
            <polygon
              points={polyPoints(friendValues)}
              fill="url(#radarGradFriend)"
              stroke="#60a5fa"
              strokeWidth={1.5}
              strokeOpacity={0.7}
            />
            {friendValues.map((v, i) => {
              const p = polar((360 / N) * i, (v / 100) * RADIUS);
              return (
                <circle key={i} cx={p.x} cy={p.y} r={3}
                  fill="#60a5fa" filter="url(#glow)" />
              );
            })}
          </>
        )}

        {/* área do usuário */}
        <polygon
          points={polyPoints(myValues)}
          fill="url(#radarGradMe)"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          filter="url(#glow)"
        />
        {myValues.map((v, i) => {
          const p = polar((360 / N) * i, (v / 100) * RADIUS);
          return (
            <circle key={i} cx={p.x} cy={p.y} r={4}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth={1.5}
              filter="url(#glow)"
            />
          );
        })}

        {/* labels dos eixos */}
        {axisAngles.map((angle, i) => {
          const LABEL_R = RADIUS + 22;
          const p = polar(angle, LABEL_R);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fill="hsl(var(--muted-foreground))"
              fontWeight="600"
            >
              {AXES[i].icon} {AXES[i].label}
            </text>
          );
        })}
      </svg>

      {/* stats abaixo */}
      <div className="grid grid-cols-5 gap-1 mt-1">
        {data.map((d, i) => (
          <div key={i} className="text-center">
            <p className="text-[10px] text-muted-foreground">{AXES[i].label}</p>
            <p className="text-xs font-black text-primary">{d.raw}</p>
            {compareUser && (
              <p className="text-[10px] text-blue-400">{(d as any).friend ?? 0}%</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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
            <SpiderChart data={radarData} compareUser={compareUser} />
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
