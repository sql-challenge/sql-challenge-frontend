"use client";

import { useState, useEffect } from "react";
import { Header } from "@/_components/_organisms/header";
import { ProtectedRoute } from "@/_components/_organisms/protectedRoute";
import Link from "next/link";
import { Capitulo, Desafio } from "@/_lib/types/capitulo";
import { api } from "@/_lib/api";
import { useUser } from "@/_context/userContext";
import { Search, Database, Terminal, Clock, Zap, Award, Clipboard, ChevronDown } from "feather-icons-react";

const TONE = {
  primary:     "border-primary/30 bg-primary/10 text-primary",
  accent:      "border-accent/30 bg-accent/10 text-accent",
  success:     "border-success/30 bg-success/10 text-success",
  warning:     "border-warning/30 bg-warning/10 text-warning",
} as const;

type Tone = keyof typeof TONE;

const RULES: {
  Icon: typeof Search;
  title: string;
  desc: string;
  tone: Tone;
}[] = [
  {
    Icon: Search,
    title: "Investigue o Caso",
    desc: "Cada desafio é um mistério com história, personagens e pistas. Leia o contexto para entender o que aconteceu.",
    tone: "primary",
  },
  {
    Icon: Database,
    title: "Explore o Banco",
    desc: "Use o explorador de banco de dados para ver as tabelas e colunas disponíveis. Esses são seus instrumentos de investigação.",
    tone: "accent",
  },
  {
    Icon: Terminal,
    title: "Escreva SQL",
    desc: "Formule queries SQL para encontrar as respostas. Cada objetivo resolvido revela mais sobre o crime.",
    tone: "success",
  },
  {
    Icon: Clock,
    title: "Corra Contra o Tempo",
    desc: "Quanto mais rápido resolver, maior o bônus de XP. Ouro ×1.5 · Prata ×1.25 · Bronze ×1.0",
    tone: "warning",
  },
  {
    Icon: Zap,
    title: "Use Dicas com Cuidado",
    desc: "Dicas estão disponíveis mas custam XP. Reserve-as para quando estiver realmente travado.",
    tone: "warning",
  },
  {
    Icon: Award,
    title: "Suba no Ranking",
    desc: "Acumule XP, desbloqueie conquistas e dispute a posição de melhor detetive SQL do mundo.",
    tone: "primary",
  },
];

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Iniciante",     color: "text-success bg-success/10 border-success/30" },
  2: { label: "Intermediário", color: "text-warning bg-warning/10 border-warning/30" },
  3: { label: "Avançado",      color: "text-destructive bg-destructive/10 border-destructive/30" },
};

export default function MysteriesPage() {
  const { user } = useUser();
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [chaptersByChallenge, setChaptersByChallenge] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const fetchDesafios = async () => {
      try {
        const [desafiosData, capitulosData] = await Promise.all([
          api.get<Desafio[]>("/api/desafios/"),
          api.get<Capitulo[]>("/api/capitulo/"),
        ]);
        const chapterTotals = capitulosData.reduce<Record<number, number>>((acc, cap) => {
          acc[cap.idDesafio] = (acc[cap.idDesafio] ?? 0) + 1;
          return acc;
        }, {});

        setDesafios(desafiosData);
        setChaptersByChallenge(chapterTotals);
      } catch {
        setError("Não foi possível carregar os desafios.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDesafios();
  }, []);

  const filtered = desafios.filter(
    (d) =>
      d.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.descricao.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getResumeChapter = (desafioId: number) => {
    const progress = user?.challenge_progress?.find(
      (p) => p.nameChallenge === String(desafioId)
    );
    return Math.max(1, (progress?.capFinish ?? 0) + 1);
  };

  const getPlayerProgress = (desafioId: number) => {
    const progress = user?.challenge_progress?.find(
      (p) => p.nameChallenge === String(desafioId)
    );
    const completed = progress?.capFinish ?? 0;
    const total = chaptersByChallenge[desafioId] ?? 0;
    const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
    return { completed, total, pct };
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <div className="relative">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-2xl">
            <h1 className="text-[22px] leading-snug sm:text-4xl lg:text-5xl font-display tracking-wide text-foreground mb-3 sm:mb-4 sm:leading-tight">
              Desvende os Mistérios{" "}
              <span className="text-primary">com SQL</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6 max-w-xl">
              Cada caso esconde dados. Cada dado esconde a verdade. Use suas habilidades SQL para resolver crimes, fraudes e conspirações no mundo mágico.
            </p>
            <button
              onClick={() => setShowRules(!showRules)}
              className="pixel-press inline-flex items-center gap-2 px-4 py-2.5 border-2 border-primary/40 bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 shadow-pixel-sm"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showRules ? "rotate-180" : ""}`} />
              {showRules ? "Esconder regras" : "Como funciona?"}
            </button>
          </div>
        </div>
      </div>

      {/* Rules Section */}
      {showRules && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
          <div className="pixel-panel overflow-hidden mb-4">
            <div className="flex items-center gap-2 border-b-2 border-border px-4 sm:px-5 py-2.5 sm:py-3">
              <Terminal className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Protocolo de Investigação</h2>
            </div>
            <ol className="lg:grid lg:grid-cols-2">
              {RULES.map(({ Icon, title, desc, tone }, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 ${
                    i > 0 ? "border-t-2 border-border/50" : ""
                  } ${i >= 3 ? "lg:border-l-2 lg:border-border/50" : ""} ${
                    i === 3 ? "lg:border-t-0" : ""
                  }`}
                >
                  <span className={`shrink-0 w-9 h-9 border-2 flex items-center justify-center ${TONE[tone]}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="border-2 border-warning/30 bg-warning/5 px-5 py-4 flex items-start gap-3">
            <Zap className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-warning mb-0.5">Dica de XP</p>
              <p className="text-sm text-muted-foreground">
                Complete capítulos sem usar dicas e no menor tempo possível para maximizar o XP. Cada capítulo tem faixas de tempo — quanto mais rápido, maior o multiplicador!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search + Challenges */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-display tracking-wide text-foreground">Casos Disponíveis</h2>
          <span className="text-sm text-muted-foreground">{desafios.length} {desafios.length === 1 ? "caso" : "casos"}</span>
        </div>

        <div className="mb-5 sm:mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar caso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-3 text-base border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-2 border-border bg-card p-5 sm:p-6 animate-pulse">
                <div className="h-5 bg-muted w-3/4 mb-3" />
                <div className="h-3 bg-muted w-full mb-2" />
                <div className="h-3 bg-muted w-5/6" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive text-lg">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.length > 0 ? (
              filtered.map((d, i) => {
                const diff = DIFFICULTY_LABELS[Math.ceil(i / 2) + 1] ?? DIFFICULTY_LABELS[1];
                const progress = getPlayerProgress(d.id);
                return (
                  <Link key={d.id} href={`/mystery/${d.id}/${getResumeChapter(d.id)}`} className="block group">
                    <div className="pixel-panel relative p-4 sm:p-5 h-full hover:border-primary/50 hover:shadow-pixel active:border-primary/50 active:shadow-pixel transition-all duration-300 hover:-translate-y-0.5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 border-2 ${diff.color}`}>
                          {diff.label}
                        </span>
                        <span className="font-mono text-xs font-semibold text-primary/90 tabular-nums">
                          {progress.total > 0 ? `${progress.pct}%` : "0%"}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {d.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{d.descricao}</p>

                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mb-1">
                          <span>Progresso no caso</span>
                          <span className="font-semibold text-foreground whitespace-nowrap">
                            {progress.total > 0 ? `${progress.completed}/${progress.total} capítulos` : "0/0 capítulos"}
                          </span>
                        </div>
                        <div className="pixel-inset h-2 overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progress.total > 0 ? progress.pct : 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 sm:pt-4 border-t-2 border-border/60">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0">
                          <span className="truncate">Tempo estimado: {d.tempoEstimado}</span>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-primary group-hover:gap-1 flex items-center gap-0.5 transition-all">
                          Investigar →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <Clipboard className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">Nenhum caso encontrado com esse nome.</p>
                <p className="text-sm text-muted-foreground mt-1">Tente outro termo de busca.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
