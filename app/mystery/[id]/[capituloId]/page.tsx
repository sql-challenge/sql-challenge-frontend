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
// import { CapituloService } from "@/_lib/services/capitulo"; // Use your own service if available
import { type CapituloView, type Consulta, type QueryResult } from "@/_lib/types/capitulo";
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

  // Success
  const [isVictorious, setIsVictorious] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Setup DB for this capitulo
  const {
    executeQuery,
    isLoading: isDbLoading,
    error: dbError,
    isReady,
    setSchema,
  } = useSqlDatabase();

  // Load capitulo data (mock or async fetch)
  useEffect(() => {
    if (!desafioId || !capituloId) {
      return;
    }

    const loadCapituloData = async () => {
      try {
        // Replace this with your actual API call
        const capituloData = await api.get<CapituloView>(`/api/capitulo/view/${capituloId}`);
        setCapituloView(capituloData);
        setSchema(capituloData.schema);
      } catch (err) {
        console.error("Failed to load capitulo data:", err);
        setLoadError("Failed to load capitulo data");
      }
    };

    loadCapituloData();

    return () => {
      // Cleanup if needed when component unmounts or params change
    }
  }, [capituloId, desafioId, setSchema]);

  // Success check
  const checkVictoryCondition = (userResults: QueryResult): boolean => {
    if (!capituloView) return false;
    const expected: Consulta = capituloView.consultaSolucao;

    // Columns, order-insensitive, lowercase
    const userCols = new Set(userResults.columns.map((c: string) => c.toLowerCase()));
    const expectedCols = new Set(expected.colunas.map((c) => c.toLowerCase()));
    if (userCols.size !== expectedCols.size ||
        [...expectedCols].some(col => !userCols.has(col))) {
      setFeedback("As colunas retornadas não correspondem às esperadas.");
      return false;
    }

    // Rows
    if (userResults.rows.length !== expected.resultado.length) {
      setFeedback(
        `Número de linhas incorreto. Esperado: ${expected.resultado.length}, Obtido: ${userResults.rows.length}`
      );
      return false;
    }

    // Normalize rows for order-insensitive comparison
    const normVal = (val: unknown) =>
      val == null ? "null" : typeof val === "number" ? val.toFixed(2) : String(val).toLowerCase().trim();

    const normRow = (row: Record<string, unknown>) =>
      expected.colunas.map((col) => normVal(row[col])).sort().join("|");

    const uSet = new Set(userResults.rows.map(normRow));
    const eSet = new Set(expected.resultado.map(normRow));
    if (uSet.size !== eSet.size || [...eSet].some(r => !uSet.has(r))) {
      setFeedback("Os dados retornados não correspondem aos esperados.");
      return false;
    }

    // Score: base - hints penalty
    const capitulo = capituloView.capitulo;
    const totalPenalty = hintsRevealed
      .map(id => capituloView.dicas.find((d) => d.id === id)?.penalidadeXp || 0)
      .reduce((a, b) => a + b, 0);

    const baseXp = capitulo.xpRecompensa;
    setScore(Math.max(0, baseXp - totalPenalty));
    setFeedback("Parabéns! Você resolveu o mistério!");
    return true;
  };

  const handleRunQuery = async () => {
    if (!query.trim()) {
      setError("Por favor, escreva uma query SQL");
      return;
    }
    if (!isReady) {
      setError("Banco de dados ainda não está pronto. Aguarde...");
      return;
    }
    setIsRunning(true);
    setError(null);

    try {
      const queryResults = executeQuery(query);
      setResults(queryResults);

      // Check victory
      const victory = checkVictoryCondition(queryResults);
      setIsVictorious(victory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao executar query");
      setResults(null);
      setIsVictorious(false);
      setFeedback(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRevealHint = (hintId: number) => {
    if (!hintsRevealed.includes(hintId)) {
      setHintsRevealed([...hintsRevealed, hintId]);
    }
  };

  const VictoryBanner = () => (
    !isVictorious ? null : (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border-2 border-green-500 rounded-xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
          <div className="text-center space-y-4">
            <div className="text-6xl animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-green-500">
              Capítulo Resolvido!
            </h2>
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
                onClick={() => router.push(`/mystery/${desafioId}`)}
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
    )
  );

  const FeedbackBanner = () =>
    !feedback || isVictorious
      ? null
      : (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-500">{feedback}</p>
        </div>
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

  if (!capituloView || isDbLoading) {
    return <LoadingScreen />;
  }

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

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden min-h-0">
        {/* LEFT: Info and navigation */}
        <div className="lg:w-1/3 flex flex-col gap-4 overflow-hidden min-h-0">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {/* Icon/commented fields can be added here */}
              Capítulo {capitulo.numero}: {capitulo.introHistoria}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Uncomment if you add more fields */}
              {/* <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                {capitulo.difficulty}
              </span>
              <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium">
                {capitulo.category}
              </span> */}
              {/* <span className="text-sm text-muted-foreground">
                ⏱️ {capitulo.tempoEstimado}
              </span> */}
            </div>
            <div className="text-right mt-2">
              <p className="text-sm text-muted-foreground">Recompensa</p>
              <p className="text-xl font-bold text-primary">{capitulo.xpRecompensa} XP</p>
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
                História
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
                  <h2 className="font-semibold mb-2">Contexto:</h2>
                  <p className="mb-4">{capitulo.contextoHistoria}</p>
                  <h3 className="font-semibold mb-1">Objetivos:</h3>
                  <ul className="list-disc pl-5">
                    {capituloView.objetivos.map((obj) => (
                      <li key={obj.id}>{obj.descricao}</li>
                    ))}
                  </ul>
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

        {/* RIGHT: SQL Editor and Result */}
        <div className="lg:w-2/3 flex flex-col gap-4 min-h-0">
          {/* SQL Editor */}
          <div className="bg-card border border-border rounded-lg flex flex-col" style={{height: "45%"}}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Editor SQL</h2>
              <button
                onClick={handleRunQuery}
                disabled={isRunning || !isReady}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRunning ? "Executando..." : "▶ Executar Query"}
              </button>
            </div>
            <SqlEditor value={query} onChange={setQuery} />
          </div>

          <FeedbackBanner />

          <div className="bg-card border border-border rounded-lg flex-1 min-h-0 overflow-hidden">
            <ResultsPanel results={results} error={error} isRunning={isRunning} />
          </div>
        </div>
      </div>
      <VictoryBanner />
    </div>
  );
}