"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/_components/_organisms/header";
import { SqlEditor } from "@/_components/_organisms/sqlEditor";
import { ResultsPanel } from "@/_components/_organisms/resultsPanel";
import { DatabaseExplorer } from "@/_components/_organisms/databaseExplorer";
import { HintsPanel } from "@/_components/_organisms/hintsPanel";
import { LoadingScreen } from "@/_components/_organisms/loadingScreen";
import { useSqlDatabase } from "@/_context/sqlContext";
import { type CapituloView, type ObjetivoComConsulta, type QueryResult } from "@/_lib/types/capitulo";
import { api } from "@/_lib/api";
import { useChapterSession, formatSeconds } from "@/_hooks/useChapterSession";
import { useUser } from "@/_context/userContext";
import { NARRATIVAS } from "@/_lib/narrativas";

// Faixas de tempo por capítulo (em segundos)
// Calibradas para refletir dificuldade crescente: SELECT → GROUP BY → JOIN → CTE → ENCODE
const TIME_TIERS = [
  { gold: 10 * 60, silver: 20 * 60, bronze: 35 * 60 },   // Cap 1 – SELECT / WHERE
  { gold: 20 * 60, silver: 40 * 60, bronze: 65 * 60 },   // Cap 2 – GROUP BY / janela
  { gold: 30 * 60, silver: 60 * 60, bronze: 90 * 60 },   // Cap 3 – JOINs
  { gold: 40 * 60, silver: 80 * 60, bronze: 120 * 60 },  // Cap 4 – CTEs / subqueries
  { gold: 50 * 60, silver: 90 * 60, bronze: 150 * 60 },  // Cap 5 – ENCODE / complexo
];

type TierKey = "gold" | "silver" | "bronze" | "none";
interface Tier {
  tier: TierKey;
  label: string;
  multiplier: number;
  icon: string;
  timerColor: string;
  badgeClass: string;
}

function getTimeTier(seconds: number, capituloNumero: number): Tier {
  const t = TIME_TIERS[Math.min(capituloNumero - 1, TIME_TIERS.length - 1)];
  if (seconds <= t.gold)   return { tier: "gold",   label: "Ouro",      multiplier: 1.5,  icon: "🥇", timerColor: "text-yellow-400", badgeClass: "bg-yellow-400/10 border-yellow-400/40 text-yellow-400" };
  if (seconds <= t.silver) return { tier: "silver", label: "Prata",     multiplier: 1.25, icon: "🥈", timerColor: "text-slate-300",  badgeClass: "bg-slate-300/10  border-slate-300/40  text-slate-300"  };
  if (seconds <= t.bronze) return { tier: "bronze", label: "Bronze",    multiplier: 1.0,  icon: "🥉", timerColor: "text-amber-600", badgeClass: "bg-amber-600/10  border-amber-600/40  text-amber-600"  };
  return                         { tier: "none",   label: "Sem bônus", multiplier: 1.0,  icon: "⏰", timerColor: "text-red-500",   badgeClass: "bg-red-500/10    border-red-500/40    text-red-500"    };
}

export default function CapituloEditorPage() {
  const params = useParams();
  const router = useRouter();
  const desafioId = params.id as string;
  const capituloId = params.capituloId as string;
  const { user } = useUser();

  const [capituloView, setCapituloView] = useState<CapituloView | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"story" | "database" | "hints">("story");
  const [loadError, setLoadError] = useState<string | null>(null);

  // Progresso por objetivo
  const [currentObjetivoIndex, setCurrentObjetivoIndex] = useState(0);
  const [completedObjetivos, setCompletedObjetivos] = useState<number[]>([]);
  const [objetivoFeedback, setObjetivoFeedback] = useState<string | null>(null);
  const [sessionRestored, setSessionRestored] = useState(false);

  // Vitória do capítulo
  const [isVictorious, setIsVictorious] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [earnedTier, setEarnedTier] = useState<Tier | null>(null);
  const [narrativa, setNarrativa] = useState<string | null>(null);

  // Sessão de tempo
  const { totalSeconds, sessionLoaded, restored, saveProgress } = useChapterSession(
    user?.uid,
    desafioId,
    capituloId
  );

  const {
    executeQuery,
    isLoading: isDbLoading,
    error: dbError,
    isReady,
    setSchema,
  } = useSqlDatabase();

  // Restaura estado salvo da sessão quando disponível
  useEffect(() => {
    if (!sessionLoaded || sessionRestored) return;
    if (restored) {
      setCurrentObjetivoIndex(restored.currentObjetivoIndex);
      setCompletedObjetivos(restored.completedObjetivos);
      setHintsRevealed(restored.hintsRevealed);
    }
    setSessionRestored(true);
  }, [sessionLoaded, restored, sessionRestored]);

  useEffect(() => {
    if (!desafioId || !capituloId) return;

    const loadCapituloData = async () => {
      try {
        const capituloData = await api.get<CapituloView>(`/api/capitulo/view/${capituloId}`);
        setCapituloView(capituloData);
        setSchema(capituloData.schema);
      } catch (err) {
        console.error("Failed to load capitulo data:", err);
        setLoadError("Falha ao carregar o capítulo. Tente novamente.");
      }
    };

    loadCapituloData();
  }, [capituloId, desafioId, setSchema]);

  const checkObjetivoCondition = (
    userResults: QueryResult,
    objetivo: ObjetivoComConsulta
  ): boolean => {
    const expected = objetivo.consulta;

    // 1. Verifica colunas (sem considerar ordem)
    const userCols = new Set(userResults.columns.map((c: string) => c.toLowerCase()));
    const expectedCols = new Set(expected.colunas.map((c) => c.toLowerCase()));
    if (
      userCols.size !== expectedCols.size ||
      [...expectedCols].some((col) => !userCols.has(col))
    ) {
      setObjetivoFeedback("As colunas retornadas não correspondem às esperadas.");
      return false;
    }

    // 2. Garante que o usuário retornou pelo menos 1 linha
    if (userResults.rows.length === 0) {
      setObjetivoFeedback("A query não retornou nenhum resultado.");
      return false;
    }

    // 3. Tenta rodar a query esperada no SQLite local para comparar linhas
    //    O SQLite tem apenas dados de amostra (≤100 linhas por tabela).
    //    Se retornar 0 linhas, os dados de amostra são insuficientes para validar
    //    contagem → aceita com base apenas nas colunas.
    let expectedRows: QueryResult["rows"] = [];
    try {
      const expectedResult = executeQuery(expected.query);
      expectedRows = expectedResult.rows;
    } catch {
      // Query não roda em SQLite (EXTRACT, ENCODE, etc.) → aceita pelas colunas
      setObjetivoFeedback(null);
      return true;
    }

    if (expectedRows.length === 0) {
      // Amostra SQLite insuficiente — aceita pelas colunas + resultado não vazio
      setObjetivoFeedback(null);
      return true;
    }

    // 4. Compara contagem e conteúdo quando SQLite tem dados de referência
    if (userResults.rows.length !== expectedRows.length) {
      setObjetivoFeedback(
        `Número de linhas incorreto. Esperado: ${expectedRows.length}, obtido: ${userResults.rows.length}.`
      );
      return false;
    }

    const normVal = (val: unknown) =>
      val == null ? "null" : typeof val === "number" ? val.toFixed(2) : String(val).toLowerCase().trim();

    const normRow = (row: Record<string, unknown>) =>
      expected.colunas.map((col) => normVal(row[col])).sort().join("|");

    const uSet = new Set(userResults.rows.map(normRow));
    const eSet = new Set(expectedRows.map(normRow));
    if (uSet.size !== eSet.size || [...eSet].some((r) => !uSet.has(r))) {
      setObjetivoFeedback("Os dados retornados não correspondem aos esperados.");
      return false;
    }

    setObjetivoFeedback(null);
    return true;
  };

  const handleRunQuery = async () => {
    if (!query.trim()) {
      setError("Por favor, escreva uma query SQL.");
      return;
    }
    if (!isReady) {
      setError("Banco de dados ainda não está pronto. Aguarde...");
      return;
    }
    if (!capituloView) return;

    setIsRunning(true);
    setError(null);
    setObjetivoFeedback(null);

    try {
      const queryResults = executeQuery(query);
      setResults(queryResults);

      const objetivo = capituloView.objetivos[currentObjetivoIndex];
      const correct = checkObjetivoCondition(queryResults, objetivo);

      if (correct) {
        const newCompleted = [...completedObjetivos, objetivo.id];
        setCompletedObjetivos(newCompleted);

        // Mostra interpretação narrativa do objetivo concluído
        setNarrativa(NARRATIVAS[objetivo.id] ?? null);

        const isLastObjetivo = currentObjetivoIndex >= capituloView.objetivos.length - 1;

        if (isLastObjetivo) {
          // Capítulo completo — calcula XP com bônus de tempo e penalidade de dicas
          const totalPenalty = hintsRevealed
            .map((id) => capituloView.dicas.find((d) => d.id === id)?.penalidadeXp ?? 0)
            .reduce((a, b) => a + b, 0);
          const baseXp = Math.max(0, capituloView.capitulo.xpRecompensa - totalPenalty);
          const tier = getTimeTier(totalSeconds, capituloView.capitulo.numero);
          setEarnedTier(tier);
          setScore(Math.round(baseXp * tier.multiplier));
          setFeedback("Você desvendou todos os mistérios deste capítulo!");
          // Pequeno delay para o jogador ler a narrativa antes do banner de vitória
          setTimeout(() => setIsVictorious(true), 10000);
          saveProgress(
            { currentObjetivoIndex, completedObjetivos: newCompleted, hintsRevealed },
            true
          );
          if (user?.uid) {
            const finalXp = Math.round(baseXp * tier.multiplier);
            api.post(`/api/user/${user.uid}/progress`, {
              desafioId,
              nameChallenge: desafioId,
              capFinish: capituloView.capitulo.numero,
              xpObtido: finalXp,
              tempoSegundos: totalSeconds,
            }).catch((err) => console.error("Erro ao salvar progresso:", err));
          }
        } else {
          const nextIndex = currentObjetivoIndex + 1;
          // Avança após o jogador ter tempo de ler a narrativa
          setTimeout(() => {
            setCurrentObjetivoIndex(nextIndex);
            setQuery("");
            setResults(null);
            setNarrativa(null);
          }, 10000);
          saveProgress(
            { currentObjetivoIndex: nextIndex, completedObjetivos: newCompleted, hintsRevealed },
            false
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao executar query");
      setResults(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRevealHint = (hintId: number) => {
    if (!hintsRevealed.includes(hintId)) {
      setHintsRevealed([...hintsRevealed, hintId]);
    }
  };

  const VictoryBanner = () =>
    !isVictorious ? null : (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border-2 border-green-500 rounded-xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center space-y-4">
            <div className="text-6xl animate-bounce">{earnedTier?.tier === "gold" ? "🏆" : "🎉"}</div>
            <h2 className="text-3xl font-bold text-green-500">Capítulo Resolvido!</h2>
            <p className="text-muted-foreground">{feedback}</p>

            {/* Tier conquistada */}
            {earnedTier && (
              <div className={`rounded-lg border px-4 py-2 text-sm font-semibold ${earnedTier.badgeClass}`}>
                {earnedTier.icon} Classificação: {earnedTier.label}
                {earnedTier.multiplier > 1 && (
                  <span className="ml-2 opacity-80">(×{earnedTier.multiplier} de bônus!)</span>
                )}
              </div>
            )}

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">XP Ganho</p>
              <p className="text-4xl font-bold text-green-500">+{score} XP</p>
              <p className="text-xs text-muted-foreground mt-1">⏱ Tempo: {formatSeconds(totalSeconds)}</p>
              {hintsRevealed.length > 0 && (
                <p className="text-xs text-yellow-500 mt-1">
                  {hintsRevealed.length} dica(s) usada(s)
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() =>
                  router.push(`/mystery/${desafioId}/${Number(capituloId) + 1}`)
                }
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Próximo Capítulo
              </button>
              <button
                onClick={() => setIsVictorious(false)}
                className="px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                Revisar
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  const ObjetivosPanel = ({ objetivos }: { objetivos: CapituloView["objetivos"] }) => (
    <ul className="space-y-2">
      {objetivos.map((obj, idx) => {
        const isDone = completedObjetivos.includes(obj.id);
        const isCurrent = idx === currentObjetivoIndex && !isVictorious;

        return (
          <li
            key={obj.id}
            className={`flex items-start gap-2 rounded-lg p-3 text-sm transition-colors ${
              isDone
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : isCurrent
                ? "bg-primary/10 border border-primary/30 text-foreground font-medium"
                : "border border-border/40 text-muted-foreground opacity-50"
            }`}
          >
            <span className="mt-0.5 shrink-0 text-base">
              {isDone ? "✅" : isCurrent ? "▶" : "🔒"}
            </span>
            <span>
              <span className="font-semibold mr-1">{obj.ordem}.</span>
              {obj.descricao}
            </span>
          </li>
        );
      })}
    </ul>
  );

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">{loadError}</h2>
          <button
            onClick={() => router.push("/mystery")}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Voltar para Mistérios
          </button>
        </div>
      </div>
    );
  }

  if (!capituloView || isDbLoading) return <LoadingScreen />;

  if (dbError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">
            Erro ao carregar banco de dados
          </h2>
          <p className="text-muted-foreground">{dbError}</p>
        </div>
      </div>
    );
  }

  const capitulo = capituloView.capitulo;
  const totalObjetivos = capituloView.objetivos.length;
  const currentObjetivo = capituloView.objetivos[currentObjetivoIndex];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden min-h-0">
        {/* LEFT: Info */}
        <div className="lg:w-1/3 flex flex-col gap-4 overflow-hidden min-h-0">
          {(() => {
            const currentTier = capituloView ? getTimeTier(totalSeconds, capituloView.capitulo.numero) : null;
            const tiers = capituloView ? TIME_TIERS[Math.min(capituloView.capitulo.numero - 1, TIME_TIERS.length - 1)] : null;
            const xpBase = capituloView?.capitulo.xpRecompensa ?? 0;
            return (
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Capítulo {capitulo.numero}</p>
                <h1 className="text-sm font-semibold text-foreground mb-3 line-clamp-1">
                  {capitulo.introHistoria.split(/[.!?]/)[0].trim()}
                </h1>

                {/* Timer em destaque */}
                <div className={`flex items-center justify-between rounded-lg border px-4 py-3 mb-3 ${currentTier?.badgeClass ?? ""}`}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Tempo</p>
                    <p className={`text-3xl font-mono font-bold tabular-nums leading-none ${currentTier?.timerColor}`}>
                      {formatSeconds(totalSeconds)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl leading-none">{currentTier?.icon}</p>
                    <p className={`text-sm font-bold mt-1 ${currentTier?.timerColor}`}>{currentTier?.label}</p>
                  </div>
                </div>

                {/* Faixas de XP por tempo */}
                {tiers && (
                  <div className="grid grid-cols-3 gap-1 mb-3 text-xs">
                    {[
                      { key: "gold",   icon: "🥇", label: "Ouro",   limit: tiers.gold,   mult: 1.5  },
                      { key: "silver", icon: "🥈", label: "Prata",  limit: tiers.silver, mult: 1.25 },
                      { key: "bronze", icon: "🥉", label: "Bronze", limit: tiers.bronze, mult: 1.0  },
                    ].map(({ key, icon, label, limit, mult }) => {
                      const active = currentTier?.tier === key;
                      return (
                        <div key={key} className={`rounded-md border px-2 py-1.5 text-center transition-all ${active ? "border-primary/50 bg-primary/10 font-bold scale-105" : "border-border opacity-60"}`}>
                          <span className="text-base">{icon}</span>
                          <p className="font-semibold">{label}</p>
                          <p className="text-muted-foreground">{"< "}{formatSeconds(limit)}</p>
                          <p className="font-bold text-primary">{Math.round(xpBase * mult)} XP</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Progresso */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                  <span>Progresso</span>
                  <span className="font-semibold text-foreground">{completedObjetivos.length}/{totalObjetivos}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(completedObjetivos.length / totalObjetivos) * 100}%` }}
                  />
                </div>
              </div>
            );
          })()}

          {/* Tabs */}
          <div className="bg-card border border-border rounded-lg flex-1 flex flex-col min-h-0">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("story")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "story"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Objetivos
              </button>
              <button
                onClick={() => setActiveTab("database")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "database"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Banco de Dados
              </button>
              <button
                onClick={() => setActiveTab("hints")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "hints"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dicas ({hintsRevealed.length}/{capituloView.dicas.length})
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {activeTab === "story" && (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {capitulo.contextoHistoria}
                  </p>
                  <ObjetivosPanel objetivos={capituloView.objetivos} />
                </div>
              )}
              {activeTab === "database" && (
                <DatabaseExplorer database={capituloView.schema} />
              )}
              {activeTab === "hints" && (
                <HintsPanel
                  dicas={capituloView.dicas}
                  revealedDicas={hintsRevealed}
                  onRevealDica={handleRevealHint}
                />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Editor */}
        <div className="lg:w-2/3 flex flex-col gap-4 min-h-0">
          {/* Objetivo atual */}
          {!isVictorious && currentObjetivo && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                Objetivo {currentObjetivoIndex + 1} de {totalObjetivos}
              </p>
              <p className="text-sm font-medium text-foreground">
                {currentObjetivo.descricao}
              </p>
            </div>
          )}

          {/* Feedback de erro no objetivo atual */}
          {objetivoFeedback && !isVictorious && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-sm text-red-400">{objetivoFeedback}</p>
            </div>
          )}

          {/* Editor SQL */}
          <div
            className="bg-card border border-border rounded-lg flex flex-col"
            style={{ height: "42%" }}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Editor SQL</h2>
              <button
                onClick={handleRunQuery}
                disabled={isRunning || !isReady || isVictorious}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRunning ? "Executando..." : "▶ Executar Query"}
              </button>
            </div>
            <SqlEditor value={query} onChange={setQuery} />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Painel de interpretação narrativa */}
          {narrativa && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-lg px-4 py-3 flex gap-3 items-start animate-pulse-once">
              <span className="text-xl shrink-0 mt-0.5">🔍</span>
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Dedução do investigador</p>
                <p className="text-sm text-emerald-100 leading-relaxed">{narrativa}</p>
              </div>
              <button
                onClick={() => setNarrativa(null)}
                className="shrink-0 text-emerald-500 hover:text-emerald-300 text-lg leading-none ml-auto"
                aria-label="Fechar"
              >×</button>
            </div>
          )}

          <div className="bg-card border border-border rounded-lg flex-1 min-h-0 overflow-hidden">
            <ResultsPanel results={results} error={null} isRunning={isRunning} />
          </div>
        </div>
      </div>
      <VictoryBanner />
    </div>
  );
}
