"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/_components/_organisms/header";
import { SqlEditor } from "@/_components/_organisms/sqlEditor";
import { ResultsPanel } from "@/_components/_organisms/resultsPanel";
import { MysteryStory } from "@/_components/_organisms/mysteryStory";
import { DatabaseExplorer } from "@/_components/_organisms/databaseExplorer";
import { HintsPanel } from "@/_components/_organisms/hintsPanel";
import type { MysteryDetail, QueryResult } from "@/_lib/types/mystery";
import { LoadingScreen } from "@/_components/_organisms/loadingScreen";
import { useSqlDatabase } from "@/_context/sqlContext";
import { MysteryService } from "@/_lib/services/mystery";

export default function MysteryEditorPage() {
  const params = useParams();
  const router = useRouter();
  const mysteryId = params.id as string;

  const [mystery, setMystery] = useState<MysteryDetail | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"story" | "database" | "hints">("story");
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialize SQL database
  const {
    executeQuery,
    isLoading: isDbLoading,
    error: dbError,
    isReady,
  } = useSqlDatabase(mystery?.database || null);

  // Load mystery data
  useEffect(() => {
    const loadMystery = async () => {
      try {
        setLoadError(null);
        const mysteryData = await MysteryService.getMysteryDetail(mysteryId);
        
        if (!mysteryData) {
          setLoadError("Mistério não encontrado");
          return;
        }
        
        setMystery(mysteryData);
      } catch (err) {
        console.error("Error loading mystery:", err);
        setLoadError("Erro ao carregar mistério");
      }
    };

    loadMystery();
  }, [mysteryId]);

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
      // debugger;
      setResults(queryResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao executar query");
      setResults(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRevealHint = (hintId: string) => {
    if (!hintsRevealed.includes(hintId)) {
      setHintsRevealed([...hintsRevealed, hintId]);
      // TODO: Deduct XP penalty
    }
  };

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

  if (!mystery || isDbLoading) {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        {/* Left Panel - Mystery Info & Database */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          {/* Mystery Header */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {mystery.icon} {mystery.title}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                    {mystery.difficulty}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium">
                    {mystery.category}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ⏱️ {mystery.estimatedTime}
                  </span>
                  {isReady && (
                    <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-medium">
                      ✓ DB Pronto
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Recompensa</p>
                <p className="text-xl font-bold text-primary">{mystery.xpReward} XP</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-card border border-border rounded-lg flex-1 flex flex-col">
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
                Dicas ({hintsRevealed.length}/{mystery.hints.length})
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {activeTab === "story" && <MysteryStory mystery={mystery} />}
              {activeTab === "database" && (
                <DatabaseExplorer database={mystery.database} />
              )}
              {activeTab === "hints" && (
                <HintsPanel
                  hints={mystery.hints}
                  revealedHints={hintsRevealed}
                  onRevealHint={handleRevealHint}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Editor & Results */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          {/* SQL Editor */}
          <div className="bg-card border border-border rounded-lg flex-1 flex flex-col min-h-[300px]">
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

          {/* Results Panel */}
          <div className="bg-card border border-border rounded-lg flex-1 min-h-[250px]">
            <ResultsPanel results={results} error={error} isRunning={isRunning} />
          </div>
        </div>
      </div>
    </div>
  );
}