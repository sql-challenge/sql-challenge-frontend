"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/_components/_organisms/header";
import { ProtectedRoute } from "@/_components/_organisms/protectedRoute";
import { LoadingScreen } from "@/_components/_organisms/loadingScreen";
import { api } from "@/_lib/api";
import { ApiError } from "@/_lib/errors";
import { formatSeconds } from "@/_hooks/useChapterSession";
import { useUser } from "@/_context/userContext";
import type { Desafio } from "@/_lib/types/capitulo";
import { BarChart, Download, Lock, RefreshCw, Clock, Terminal, Zap, BookOpen } from "feather-icons-react";

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
}

interface OverviewResponse {
  desafioId: string | null;
  students: StudentOverview[];
}

type SortKey = "nick" | "xp" | "capFinish" | "tempoSegundos" | "totalQueries" | "totalHints" | "lastActivityAt";

const REFRESH_INTERVAL_MS = 30_000;

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "agora";
  if (diffSec < 3600) return `há ${Math.floor(diffSec / 60)}min`;
  if (diffSec < 86_400) return `há ${Math.floor(diffSec / 3600)}h`;
  return `há ${Math.floor(diffSec / 86_400)}d`;
}

export default function AdminPage() {
  const { user } = useUser();
  const router = useRouter();
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [desafioId, setDesafioId] = useState<string>("");
  const [students, setStudents] = useState<StudentOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("tempoSegundos");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const loadOverview = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setIsRefreshing(true);
    try {
      const data = await api.get<OverviewResponse>(
        `/api/admin/overview${desafioId ? `?desafioId=${encodeURIComponent(desafioId)}` : ""}`
      );
      setStudents(data.students ?? []);
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
    activeNow: students.filter((s) => s.lastActivityAt && Date.now() - new Date(s.lastActivityAt).getTime() < 5 * 60_000).length,
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
                    onChange={(e) => setDesafioId(e.target.value)}
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
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
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

              {/* Tabela */}
              {isLoading ? (
                <LoadingScreen />
              ) : (
                <div className="pixel-panel overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="border-b-2 border-border">
                      <tr className="text-muted-foreground">
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
                        <tr><td colSpan={8} className="text-center text-muted-foreground py-10">Nenhum aluno encontrad{desafioId ? "o para este desafio" : ""}.</td></tr>
                      ) : sorted.map((s) => (
                        <tr key={s.uid} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="px-2 py-2">
                            <p className="font-semibold text-foreground">{s.nick || s.username}</p>
                            <p className="text-[11px] text-muted-foreground">@{s.username}</p>
                          </td>
                          <td className="px-2 py-2 font-mono tabular-nums text-primary">{s.xp.toLocaleString()}</td>
                          <td className="px-2 py-2 font-mono tabular-nums">{s.capFinish}</td>
                          <td className="px-2 py-2 font-mono tabular-nums">{s.totalQueries}</td>
                          <td className="px-2 py-2 font-mono tabular-nums">{s.totalHints}</td>
                          <td className="px-2 py-2 font-mono tabular-nums">{formatSeconds(s.tempoSegundos)}</td>
                          <td className="px-2 py-2 text-muted-foreground text-xs whitespace-nowrap">{relativeTime(s.lastActivityAt)}</td>
                          <td className="px-2 py-2 font-mono tabular-nums">{s.sessionCount}</td>
                        </tr>
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
