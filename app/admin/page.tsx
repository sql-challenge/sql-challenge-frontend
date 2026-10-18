"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/_components/_organisms/header";
import { ProtectedRoute } from "@/_components/_organisms/protectedRoute";
import { LoadingScreen } from "@/_components/_organisms/loadingScreen";
import { api } from "@/_lib/api";
import { ApiError } from "@/_lib/errors";
import { formatSeconds } from "@/_hooks/useChapterSession";
import type { Desafio } from "@/_lib/types/capitulo";
import { BarChart, Download, Flag, Lock, RefreshCw, Clock, Terminal, Zap, BookOpen, ChevronDown, ChevronRight, PlayCircle, Search } from "feather-icons-react";

interface SessionBrief {
  capituloId: number;
  desafioId: string;
  currentObjetivoIndex: number;
  completedCount: number;
  totalSeconds: number;
  isActive: boolean;
  firstStartedAt: string | null;
  lastActivityAt: string | null;
}

interface StudentOverview {
  uid: string;
  username: string;
  nick: string;
  email: string;
  xp: number;
  lastLogin: string | null;
  capFinish: number;
  xpObtido: number;
  totalQueries: number;
  totalHints: number;
  tempoSegundos: number;
  sessionCount: number;
  firstStartedAt: string | null;
  lastActivityAt: string | null;
  sessions: SessionBrief[];
}

interface OverviewResponse {
  desafioId: string | null;
  students: StudentOverview[];
}

interface StudentEvent {
  id: string;
  type: string;
  desafioId: string;
  capituloId: number;
  classCode: string | null;
  payload: Record<string, unknown>;
  clientTs: string | null;
  serverTs: string;
}

interface SecurityFlag {
  id: string;
  uid: string;
  type: string;
  detail: string;
  desafioId: string;
  capituloId: number;
  serverTs: string;
}

interface FlagsResponse {
  desafioId: string | null;
  flags: SecurityFlag[];
}

const FLAG_LABELS: Record<string, string> = {
  xp_over_max: "XP acima do máximo",
  xp_without_progress: "XP sem avanço",
  chapter_jump: "Pulo de capítulos",
  zero_query_victory: "Vitória sem queries",
  time_over_wallclock: "Tempo acima do relógio",
  achievement_burst: "Rajada de conquistas",
};

interface StudentEventsResponse {
  uid: string;
  events: StudentEvent[];
}

type SortKey = "nick" | "xp" | "capFinish" | "tempoSegundos" | "totalQueries" | "totalHints" | "lastActivityAt";

const REFRESH_INTERVAL_MS = 30_000;
const ACTIVE_WINDOW_MS = 5 * 60_000; // "ativo agora" = atividade nos últimos 5 min

const EVENT_LABELS: Record<string, string> = {
  session_start: "▶ abriu capítulo",
  session_end: "⏸ fechou capítulo",
  query_run: "⌨ rodou query",
  sql_error: "✗ erro de SQL",
  hint_revealed: "💡 abriu dica",
  objetivo_completed: "✔ objetivo resolvido",
  chapter_victory: "🏆 vitória",
};

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "agora";
  if (diffSec < 3600) return `há ${Math.floor(diffSec / 60)}min`;
  if (diffSec < 86_400) return `há ${Math.floor(diffSec / 3600)}h`;
  return `há ${Math.floor(diffSec / 86_400)}d`;
}

function clockTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function AdminPage() {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [desafioId, setDesafioId] = useState<string>("");
  const [students, setStudents] = useState<StudentOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("tempoSegundos");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedUid, setExpandedUid] = useState<string | null>(null);
  const [eventsByUid, setEventsByUid] = useState<Record<string, StudentEvent[]>>({});
  const [flags, setFlags] = useState<SecurityFlag[]>([]);

  const loadOverview = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setIsRefreshing(true);
    try {
      const [data, flagData] = await Promise.all([
        api.get<OverviewResponse>(
          `/api/admin/overview${desafioId ? `?desafioId=${encodeURIComponent(desafioId)}` : ""}`
        ),
        api.get<FlagsResponse>(
          `/api/admin/flags${desafioId ? `?desafioId=${encodeURIComponent(desafioId)}` : ""}`
        ).catch(() => ({ desafioId: desafioId || null, flags: [] as SecurityFlag[] })),
      ]);
      setStudents(data.students ?? []);
      setFlags(flagData.flags ?? []);
      setAccessDenied(false);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) {
        setAccessDenied(true);
      } else {
        setError(err instanceof Error ? err.message : "Erro ao carregar visão geral.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [desafioId]);

  // Lista de desafios (filtro)
  useEffect(() => {
    api.get<Desafio[]>("/api/desafios/")
      .then((d) => setDesafios(d ?? []))
      .catch(() => {});
  }, []);

  // Carrega + polling a cada 30s
  useEffect(() => {
    void loadOverview();
    const interval = setInterval(() => void loadOverview({ silent: true }), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadOverview]);

  const loadStudentEvents = useCallback(async (uid: string) => {
    try {
      const data = await api.get<StudentEventsResponse>(
        `/api/admin/students/${uid}/events?limit=60${desafioId ? `&desafioId=${encodeURIComponent(desafioId)}` : ""}`
      );
      setEventsByUid((prev) => ({ ...prev, [uid]: data.events ?? [] }));
    } catch (err) {
      console.error("Erro ao carregar eventos do aluno:", err);
    }
  }, [desafioId]);

  const toggleExpand = (uid: string) => {
    setExpandedUid((cur) => {
      const next = cur === uid ? null : uid;
      if (next && !eventsByUid[next]) void loadStudentEvents(next);
      return next;
    });
  };

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...students].sort((a, b) => {
      if (sortKey === "nick") {
        const an = (a.nick || a.username || "").toLowerCase();
        const bn = (b.nick || b.username || "").toLowerCase();
        return dir * an.localeCompare(bn);
      }
      if (sortKey === "lastActivityAt") {
        const at = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
        const bt = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
        return dir * (at - bt);
      }
      return dir * ((a[sortKey] as number ?? 0) - (b[sortKey] as number ?? 0));
    });
  }, [students, sortKey, sortDir]);

  const liveSessions = useMemo(() => {
    const now = Date.now();
    const out: { student: StudentOverview; session: SessionBrief }[] = [];
    for (const s of students) {
      for (const sess of s.sessions) {
        const recent = sess.lastActivityAt && now - new Date(sess.lastActivityAt).getTime() < ACTIVE_WINDOW_MS;
        if (sess.isActive || recent) out.push({ student: s, session: sess });
      }
    }
    return out.sort((a, b) =>
      (new Date(b.session.lastActivityAt ?? 0).getTime()) - (new Date(a.session.lastActivityAt ?? 0).getTime())
    );
  }, [students]);

  // uid → nº de flags de atividade suspeita
  const flagsByUid = useMemo(() => {
    const map: Record<string, SecurityFlag[]> = {};
    for (const f of flags) {
      (map[f.uid] ??= []).push(f);
    }
    return map;
  }, [flags]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "nick" ? "asc" : "desc");
    }
  };

  const exportCsv = () => {
    const header = [
      "nick", "username", "email", "xp", "xpObtido", "capitulos",
      "queries", "dicas", "tempoSegundos", "sessoes", "primeiraAtividade", "ultimaAtividade",
    ];
    const rows = sorted.map((s) => [
      s.nick, s.username, s.email, s.xp, s.xpObtido, s.capFinish,
      s.totalQueries, s.totalHints, s.tempoSegundos, s.sessionCount,
      s.firstStartedAt ?? "", s.lastActivityAt ?? "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sql-challenge-overview-${desafioId || "todos"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totals = useMemo(() => ({
    xp: students.reduce((a, s) => a + s.xpObtido, 0),
    queries: students.reduce((a, s) => a + s.totalQueries, 0),
    hints: students.reduce((a, s) => a + s.totalHints, 0),
    seconds: students.reduce((a, s) => a + s.tempoSegundos, 0),
    activeNow: students.filter((s) => s.lastActivityAt && Date.now() - new Date(s.lastActivityAt).getTime() < ACTIVE_WINDOW_MS).length,
  }), [students]);

  const th = (key: SortKey, label: string) => (
    <th
      className="px-2 py-2 text-left text-[11px] uppercase tracking-wider cursor-pointer select-none hover:text-primary"
      onClick={() => toggleSort(key)}
    >
      {label}{sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
    </th>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {accessDenied ? (
            <div className="text-center py-20">
              <Lock className="w-10 h-10 mx-auto mb-3 text-destructive" />
              <h1 className="text-xl font-bold text-foreground mb-1">Acesso restrito</h1>
              <p className="text-sm text-muted-foreground">Este painel é apenas para o professor/administrador.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <BarChart className="w-8 h-8 text-primary mb-1" />
                  <h1 className="text-xl sm:text-2xl font-display tracking-wide text-foreground">Painel do Professor</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {totals.activeNow} ativo(s) nos últimos 5 min · atualiza a cada 30s
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={desafioId}
                    onChange={(e) => { setDesafioId(e.target.value); setExpandedUid(null); }}
                    className="border-2 border-border bg-card text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Todos os desafios</option>
                    {desafios.map((d) => (
                      <option key={d.id} value={String(d.id)}>{d.titulo}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => void loadOverview()}
                    disabled={isRefreshing}
                    className="pixel-press px-3 py-2 border-2 border-border bg-card text-foreground text-sm disabled:opacity-50"
                    aria-label="Atualizar"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={exportCsv}
                    disabled={sorted.length === 0}
                    className="pixel-press flex items-center gap-1.5 px-3 py-2 border-2 border-primary bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" /> CSV
                  </button>
                </div>
              </div>

              {/* Totais */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                {[
                  { Icon: Zap, label: "XP ganho", value: totals.xp.toLocaleString() },
                  { Icon: Terminal, label: "Queries", value: totals.queries.toLocaleString() },
                  { Icon: BookOpen, label: "Dicas usadas", value: totals.hints },
                  { Icon: Clock, label: "Tempo total", value: formatSeconds(totals.seconds) },
                  { Icon: BarChart, label: "Alunos", value: students.length },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="border-2 border-border bg-card px-3 py-2.5 text-center">
                    <Icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <p className="font-mono text-sm sm:text-base font-bold text-foreground tabular-nums">{value}</p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {error && <p className="text-sm text-destructive mb-4">{error}</p>}

              {/* Agora — quem está jogando e onde está travado */}
              {liveSessions.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <PlayCircle className="w-4 h-4 text-success" /> Agora
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {liveSessions.map(({ student, session }) => (
                      <div key={`${student.uid}_${session.desafioId}_${session.capituloId}`} className="border-2 border-success/30 bg-success/5 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm text-foreground truncate">{student.nick || student.username}</p>
                          {session.isActive
                            ? <span className="text-[10px] font-bold text-success border border-success/40 bg-success/10 px-1.5 py-0.5">AO VIVO</span>
                            : <span className="text-[10px] text-muted-foreground">{relativeTime(session.lastActivityAt)}</span>}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Capítulo {session.capituloId} · objetivo {session.currentObjetivoIndex + 1} · {session.completedCount} resolvido(s) · {formatSeconds(session.totalSeconds)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Atividade suspeita (auditoria server-side) */}
              {flags.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <Flag className="w-4 h-4 text-destructive" />
                    Atividade suspeita ({flags.length})
                  </h2>
                  <div className="border-2 border-destructive/30 bg-destructive/5 divide-y divide-border/40">
                    {flags.slice(0, 20).map((f) => {
                      const st = students.find((s) => s.uid === f.uid);
                      return (
                        <div key={f.id} className="flex items-start gap-2 px-3 py-2">
                          <span className="text-[10px] font-bold text-destructive border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 shrink-0 uppercase">
                            {FLAG_LABELS[f.type] ?? f.type}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground font-semibold truncate">
                              {st?.nick || st?.username || f.uid}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">{f.detail}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">{relativeTime(f.serverTs)}</span>
                        </div>
                      );
                    })}
                    {flags.length > 20 && (
                      <p className="text-[11px] text-muted-foreground px-3 py-1.5">
                        + {flags.length - 20} mais (veja no CSV do recorte completo)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tabela */}
              {isLoading ? (
                <LoadingScreen />
              ) : (
                <div className="pixel-panel overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="border-b-2 border-border">
                      <tr className="text-muted-foreground">
                        <th className="w-6" />
                        {th("nick", "Aluno")}
                        {th("xp", "XP total")}
                        {th("capFinish", "Capítulos")}
                        {th("totalQueries", "Queries")}
                        {th("totalHints", "Dicas")}
                        {th("tempoSegundos", "Tempo")}
                        {th("lastActivityAt", "Última atividade")}
                        <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wider">Sessões</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.length === 0 ? (
                        <tr><td colSpan={9} className="text-center text-muted-foreground py-10">Nenhum aluno encontrad{desafioId ? "o para este desafio" : ""}.</td></tr>
                      ) : sorted.map((s) => (
                        <Fragment key={s.uid}>
                          <tr
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => toggleExpand(s.uid)}
                          >
                            <td className="px-1 py-2">
                              {expandedUid === s.uid
                                ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex items-center gap-1.5">
                                {(flagsByUid[s.uid]?.length ?? 0) > 0 && (
                                  <span
                                    className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold text-destructive border border-destructive/40 bg-destructive/10 px-1 py-0.5"
                                    title={flagsByUid[s.uid].map((f) => `${FLAG_LABELS[f.type] ?? f.type}: ${f.detail}`).join("\n")}
                                  >
                                    <Flag className="w-2.5 h-2.5" />{flagsByUid[s.uid].length}
                                  </span>
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground truncate">{s.nick || s.username}</p>
                                  <p className="text-[11px] text-muted-foreground">@{s.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-2 font-mono tabular-nums text-primary">{s.xp.toLocaleString()}</td>
                            <td className="px-2 py-2 font-mono tabular-nums">{s.capFinish}</td>
                            <td className="px-2 py-2 font-mono tabular-nums">{s.totalQueries}</td>
                            <td className="px-2 py-2 font-mono tabular-nums">{s.totalHints}</td>
                            <td className="px-2 py-2 font-mono tabular-nums">{formatSeconds(s.tempoSegundos)}</td>
                            <td className="px-2 py-2 text-muted-foreground text-xs whitespace-nowrap">{relativeTime(s.lastActivityAt)}</td>
                            <td className="px-2 py-2 font-mono tabular-nums">{s.sessionCount}</td>
                          </tr>
                          {expandedUid === s.uid && (
                            <tr className="border-b border-border/50">
                              <td colSpan={9} className="px-3 py-3 bg-muted/20">
                                <EventsTimeline events={eventsByUid[s.uid]} />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function EventsTimeline({ events }: { events?: StudentEvent[] }) {
  if (!events) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
        <Search className="w-3.5 h-3.5 animate-pulse" /> Carregando eventos...
      </div>
    );
  }
  if (events.length === 0) {
    return <p className="text-xs text-muted-foreground py-2">Nenhum evento registrado ainda para este recorte.</p>;
  }
  return (
    <div className="space-y-1 max-h-72 overflow-y-auto">
      {events.map((e) => {
        const sql = typeof e.payload?.["sql"] === "string" ? (e.payload["sql"] as string) : null;
        const label = EVENT_LABELS[e.type] ?? e.type;
        return (
          <div key={e.id} className="flex items-start gap-2 text-xs border-b border-border/30 pb-1">
            <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">{clockTime(e.serverTs)}</span>
            <span className="whitespace-nowrap font-medium">{label}</span>
            {sql && (
              <code className="flex-1 truncate text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5">{sql}</code>
            )}
            {e.type === "objetivo_completed" && typeof e.payload?.["index"] === "number" && (
              <span className="text-[10px] text-muted-foreground">#{(e.payload["index"] as number) + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
