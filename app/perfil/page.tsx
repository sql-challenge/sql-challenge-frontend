"use client";

import { useState, useEffect } from "react";
import { Header } from "@/_components/_organisms/header";
import { ProtectedRoute } from "@/_components/_organisms/protectedRoute";
import { useUser } from "@/_context/userContext";
import { User } from "@/_lib/types/user";

// ── Spider Chart SVG customizado ──────────────────────────
const AXES = [
  { key: "value",  icon: "⌨️", label: "Queries"    },
  { key: "value",  icon: "⏱️", label: "Tempo"      },
  { key: "value",  icon: "⚡", label: "XP"         },
  { key: "value",  icon: "📖", label: "Capítulos"  },
  { key: "value",  icon: "💡", label: "Dicas"      },
];
const N = AXES.length;
const SIZE   = 220;
const CX     = SIZE / 2;
const CY     = SIZE / 2;
const RADIUS = 76;
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
  const friendValues= data.map(d => ('friend' in d ? (d as { friend?: number }).friend ?? 0 : 0));

  const axisAngles = Array.from({ length: N }, (_, i) => (360 / N) * i);

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-background p-3 sm:p-5 relative overflow-hidden">
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

      <svg width="100%" viewBox={`0 0 ${SIZE} ${SIZE}`} className="overflow-visible text-blue-300">
        <defs>
          <radialGradient id="radarGradMe" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id="radarGradFriend" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id="radarGridBg" cx="50%" cy="50%" r="60%">
            <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.02" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <polygon
          points={Array.from({ length: N }, (_, i) => {
            const p = polar((360 / N) * i, RADIUS);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="url(#radarGridBg)"
          stroke="none"
        />

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
              fill={lvl % 2 === 0 ? "#60a5fa" : "none"}
              fillOpacity={lvl % 2 === 0 ? 0.04 : 0}
              stroke="#60a5fa"
              strokeWidth={lvl === LEVELS - 1 ? 0.8 : 0.5}
              strokeOpacity={lvl === LEVELS - 1 ? 0.35 : 0.2}
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
              stroke="#60a5fa"
              strokeWidth={0.5}
              strokeOpacity={0.22}
            />
          );
        })}

        {/* área do amigo (primeiro para ficar atrás) */}
        {compareUser && (
          <>
            <polygon
              points={polyPoints(friendValues)}
              fill="#60a5fa"
              fillOpacity={0.12}
              stroke="#60a5fa"
              strokeWidth={1.6}
              strokeOpacity={0.8}
              strokeLinejoin="round"
            />
          </>
        )}

        {/* área do usuário */}
        <polygon
          points={polyPoints(myValues)}
          fill="#3b82f6"
          fillOpacity={0.2}
          stroke="#3b82f6"
          strokeWidth={2.2}
          strokeOpacity={0.95}
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* labels dos eixos */}
        {axisAngles.map((angle, i) => {
          const LABEL_R = RADIUS + 20;
          const p = polar(angle, LABEL_R);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fontWeight="700"
              fill="currentColor"
            >
              {AXES[i].icon} {AXES[i].label}
            </text>
          );
        })}
      </svg>

      {/* stats abaixo */}
      <div className="grid grid-cols-5 gap-0.5 sm:gap-1 mt-1">
        {data.map((d, i) => (
          <div key={i} className="text-center">
            <p className="text-[10px] text-muted-foreground">{AXES[i].label}</p>
            <p className="text-xs font-black text-blue-400">{d.raw}</p>
            {compareUser && (
              <p className="text-[10px] text-blue-400">{('friend' in d ? (d as { friend?: number }).friend : 0) ?? 0}%</p>
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

  const [isLoading]     = useState(false);

  // friends (disabled — will be re-enabled later)
  // const [friends,       setFriends]       = useState<Friend[]>([]);
  // const friendsLoadedRef = useRef<string | null>(null);
  // const [searchQuery,   setSearchQuery]   = useState("");
  // const [searchResults, setSearchResults] = useState<User[]>([]);
  // const [searching,     setSearching]     = useState(false);
  // const [compareUid,    setCompareUid]    = useState<string | null>(null);
  // const [compareUser,   setCompareUser]   = useState<User | null>(null);
  // const [friendRanking, setFriendRanking] = useState<User[]>([]);

  useEffect(() => {
    if (!user) return;
    setNick(user.nick ?? "");
    setUsername(user.username ?? "");
  }, [user?.uid]);

  // const loadFriends = async () => {
  //   if (!user) return;
  //   try {
  //     const data = await api.get<Friend[]>(`/api/user/${user.uid}/friends`);
  //     setFriends(Array.isArray(data) ? data : []);
  //   } catch {} finally {
  //     setIsLoading(false);
  //   }
  // };

  // const loadFriendRanking = useCallback(async () => {
  //   if (!user) return;
  //   try {
  //     const data = await api.get<User[]>(`/api/user/${user.uid}/friends/ranking`);
  //     setFriendRanking(Array.isArray(data) ? data : []);
  //   } catch {}
  // }, [user?.uid]);

  // const friendRankingMountedRef = useRef(true);

  // useEffect(() => {
  //   if (tab !== "ranking") return;
  //   friendRankingMountedRef.current = true;
  //   loadFriendRanking();
  //   const interval = setInterval(() => {
  //     if (friendRankingMountedRef.current) loadFriendRanking();
  //   }, 60_000);
  //   return () => {
  //     friendRankingMountedRef.current = false;
  //     clearInterval(interval);
  //   };
  // }, [tab, loadFriendRanking]);

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

  // const handleSearch = async () => {
  //   if (!searchQuery.trim()) return;
  //   setSearching(true);
  //   try {
  //     const list = await api.get<User[]>(`/api/user/name/${encodeURIComponent(searchQuery.trim().toLowerCase())}`);
  //     setSearchResults(list.filter(u => u.uid !== user?.uid));
  //   } catch {
  //     setSearchResults([]);
  //   } finally {
  //     setSearching(false);
  //   }
  // };

  // const handleAddFriend = async (targetUid: string) => {
  //   if (!user) return;
  //   try {
  //     await api.post(`/api/user/${user.uid}/friends/${targetUid}`, {});
  //     await loadFriends();
  //     setSearchResults([]);
  //     setSearchQuery("");
  //   } catch (e: unknown) {
  //     alert(e instanceof Error ? e.message : "Erro ao adicionar amigo");
  //   }
  // };

  // const handleAccept = async (targetUid: string) => {
  //   if (!user) return;
  //   await api.put(`/api/user/${user.uid}/friends/${targetUid}/accept`, {});
  //   await loadFriends();
  // };

  // const handleRemove = async (targetUid: string) => {
  //   if (!user) return;
  //   await api.delete(`/api/user/${user.uid}/friends/${targetUid}`);
  //   await loadFriends();
  //   if (compareUid === targetUid) { setCompareUid(null); setCompareUser(null); }
  // };

  // const handleCompare = async (f: Friend) => {
  //   if (compareUid === f.uid) { setCompareUid(null); setCompareUser(null); return; }
  //   try {
  //     const data = await api.get<User>(`/api/user/uid/${f.uid}`);
  //     setCompareUser(data);
  //     setCompareUid(f.uid);
  //   } catch {}
  // };

  const radarData = buildRadarData(user);
  // const accepted  = friends.filter(f => f.status === "accepted");
  // const pending   = friends.filter(f => f.status === "pending");

  const TABS: { id: Tab; label: string }[] = [
    { id: "perfil",  label: "Perfil" },
    // { id: "amigos",  label: `Amigos (${accepted.length})` },
    // { id: "ranking", label: "Ranking de Amigos" },
  ];

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">

        {/* {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )} */}

        {!isLoading && (
        <>
        {/* Avatar + nome */}
        <div className="flex items-center gap-3 sm:gap-5 mb-6 sm:mb-8">
          <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-xl sm:text-3xl font-bold text-primary">
            {(user?.nick || user?.username || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-extrabold text-foreground truncate">{user?.nick || user?.username}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm truncate">@{user?.username} · {(user?.xp ?? 0).toLocaleString()} XP</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6 sm:mb-8">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors ${
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

              {/* Notificações por e-mail — disabled, backend notify endpoint preserved for future */}
              {/* <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Notificações por e-mail</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Receba um e-mail quando novas histórias forem adicionadas</p>
                </div>
                <button
                  onClick={async () => {
                    if (!user) return;
                    const newVal = !(user.emailNotifications ?? false);
                    await updateUser({ emailNotifications: newVal });
                  }}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                    user?.emailNotifications ? "bg-primary" : "bg-muted"
                  }`}
                  aria-label="Toggle notificações"
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    user?.emailNotifications ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div> */}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar alterações"}
              </button>
            </div>

            {/* Spider chart */}
            <SpiderChart data={radarData} compareUser={null} />
          </div>
        )}

        {/* ── ABA AMIGOS ──────────────────────────────────── */}
        {/* {tab === "amigos" && (
          <div className="space-y-6">
            ...
          </div>
        )} */}

        {/* ── ABA RANKING DE AMIGOS ───────────────────────── */}
        {/* {tab === "ranking" && (
          <div>
            ...
          </div>
        )} */}
          </>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
