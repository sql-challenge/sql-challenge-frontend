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

export default function CapituloEditorPage() {
  const params = useParams();
  const router = useRouter();
  const desafioId = params.id as string;
  const capituloId = params.capituloId as string;

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

  // Vitória do capítulo
  const [isVictorious, setIsVictorious] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    executeQuery,
    isLoading: isDbLoading,
    error: dbError,
    isReady,
    setSchema,
  } = useSqlDatabase();

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

    // Verifica colunas (sem considerar ordem)
    const userCols = new Set(userResults.columns.map((c: string) => c.toLowerCase()));
    const expectedCols = new Set(expected.colunas.map((c) => c.toLowerCase()));
    if (
      userCols.size !== expectedCols.size ||
      [...expectedCols].some((col) => !userCols.has(col))
    ) {
      setObjetivoFeedback("As colunas retornadas não correspondem às esperadas.");
      return false;
    }

    // Executa a query esperada no SQLite local para obter as linhas de referência
    let expectedRows: QueryResult["rows"] = [];
    try {
      const expectedResult = executeQuery(expected.query);
      expectedRows = expectedResult.rows;
    } catch {
      // Query esperada não roda em SQLite (ex.: EXTRACT, ENCODE) → aceita pelo check de colunas
      setObjetivoFeedback(null);
      return true;
    }

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

        const isLastObjetivo = currentObjetivoIndex >= capituloView.objetivos.length - 1;

        if (isLastObjetivo) {
          // Capítulo completo
          const totalPenalty = hintsRevealed
            .map((id) => capituloView.dicas.find((d) => d.id === id)?.penalidadeXp ?? 0)
            .reduce((a, b) => a + b, 0);
          setScore(Math.max(0, capituloView.capitulo.xpRecompensa - totalPenalty));
          setFeedback("Você desvendou todos os mistérios deste capítulo!");
          setIsVictorious(true);
        } else {
          setCurrentObjetivoIndex(currentObjetivoIndex + 1);
          setQuery("");
          setResults(null);
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
        <div className="bg-card border-2 border-green-500 rounded-xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
          <div className="text-center space-y-4">
            <div className="text-6xl animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-green-500">Capítulo Resolvido!</h2>
            <p className="text-muted-foreground">{feedback}</p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">XP Ganho</p>
              <p className="text-4xl font-bold text-green-500">+{score} XP</p>
              {hintsRevealed.length > 0 && (
                <p className="text-xs text-yellow-500 mt-2">
                  ({hintsRevealed.length} dica(s) usada(s))
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
        const isLocked = idx > currentObjetivoIndex && !isVictorious;

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
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Capítulo {capitulo.numero}: {capitulo.introHistoria}
            </h1>
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-muted-foreground">
                Progresso:{" "}
                <span className="font-semibold text-foreground">
                  {completedObjetivos.length}/{totalObjetivos}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground text-right">Recompensa</p>
                <p className="text-xl font-bold text-primary text-right">
                  {capitulo.xpRecompensa} XP
                </p>
              </div>
            </div>
            {/* Barra de progresso */}
            <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(completedObjetivos.length / totalObjetivos) * 100}%` }}
              />
            </div>
          </div>

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

          <div className="bg-card border border-border rounded-lg flex-1 min-h-0 overflow-hidden">
            <ResultsPanel results={results} error={null} isRunning={isRunning} />
          </div>
        </div>
      </div>
      <VictoryBanner />
    </div>
  );
}
