"use client";

import { useState, useEffect } from "react";
import { Header } from "@/_components/_organisms/header";
import Link from "next/link";
import { Desafio } from "@/_lib/types/capitulo";

const RULES = [
  {
    icon: "🔍",
    title: "Investigue o Caso",
    desc: "Cada desafio é um mistério com história, personagens e pistas. Leia o contexto para entender o que aconteceu.",
    color: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
    delay: "0ms",
  },
  {
    icon: "🗄️",
    title: "Explore o Banco",
    desc: "Use o explorador de banco de dados para ver as tabelas e colunas disponíveis. Esses são seus instrumentos de investigação.",
    color: "from-purple-500/20 to-purple-600/5 border-purple-500/30",
    delay: "100ms",
  },
  {
    icon: "⌨️",
    title: "Escreva SQL",
    desc: "Formule queries SQL para encontrar as respostas. Cada objetivo resolvido revela mais sobre o crime.",
    color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
    delay: "200ms",
  },
  {
    icon: "⏱️",
    title: "Corra Contra o Tempo",
    desc: "Quanto mais rápido resolver, maior o bônus de XP. Ouro 🥇 ×1.5 · Prata 🥈 ×1.25 · Bronze 🥉 ×1.0",
    color: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30",
    delay: "300ms",
  },
  {
    icon: "💡",
    title: "Use Dicas com Cuidado",
    desc: "Dicas estão disponíveis mas custam XP. Reserve-as para quando estiver realmente travado.",
    color: "from-orange-500/20 to-orange-600/5 border-orange-500/30",
    delay: "400ms",
  },
  {
    icon: "🏆",
    title: "Suba no Ranking",
    desc: "Acumule XP, desbloqueie conquistas e dispute a posição de melhor detetive SQL do mundo.",
    color: "from-red-500/20 to-red-600/5 border-red-500/30",
    delay: "500ms",
  },
];

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Iniciante",    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
  2: { label: "Intermediário",color: "text-yellow-400  bg-yellow-400/10  border-yellow-400/30"  },
  3: { label: "Avançado",     color: "text-red-400     bg-red-400/10     border-red-400/30"     },
};

export default function MysteriesPage() {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const fetchDesafios = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/desafios/`);
        if (!response.ok) throw new Error("Falha ao carregar desafios");
        const data: Desafio[] = await response.json();
        setDesafios(data);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary border border-primary/30 bg-primary/10 px-3 py-1 rounded-full mb-4">
              Agência de Investigação SQL
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-4 leading-tight">
              Desvende os Mistérios{" "}
              <span className="text-primary">com SQL</span>
            </h1>
            <p className="text-base text-muted-foreground mb-6 max-w-xl">
              Cada caso esconde dados. Cada dado esconde a verdade. Use suas habilidades SQL para resolver crimes, fraudes e conspirações no mundo mágico.
            </p>
            <button
              onClick={() => setShowRules(!showRules)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
            >
              <span>{showRules ? "▲" : "▼"}</span>
              {showRules ? "Esconder regras" : "Como funciona?"}
            </button>
          </div>
        </div>
      </div>

      {/* Rules Section */}
      {showRules && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {RULES.map((rule, i) => (
              <div
                key={i}
                className={`rounded-xl border bg-gradient-to-br p-5 ${rule.color}`}
              >
                <div className="text-3xl mb-3">{rule.icon}</div>
                <h3 className="font-bold text-foreground mb-1">{rule.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{rule.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-5 py-4 flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-bold text-yellow-400 mb-0.5">Dica de XP</p>
              <p className="text-sm text-muted-foreground">
                Complete capítulos sem usar dicas e no menor tempo possível para maximizar o XP. Cada capítulo tem faixas de tempo — quanto mais rápido, maior o multiplicador!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search + Challenges */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Casos Disponíveis</h2>
          <span className="text-sm text-muted-foreground">{desafios.length} casos</span>
        </div>

        <div className="mb-6 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔎</span>
          <input
            type="text"
            placeholder="Buscar caso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6 animate-pulse">
                <div className="h-5 bg-muted rounded w-3/4 mb-3" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-5/6" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length > 0 ? (
              filtered.map((d, i) => {
                const diff = DIFFICULTY_LABELS[Math.ceil(i / 2) + 1] ?? DIFFICULTY_LABELS[1];
                return (
                  <Link key={d.id} href={`/mystery/${d.id}/1`} className="block group">
                    <div className="relative bg-card border border-border rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
                      {/* Glow accent */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">🕵️</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${diff.color}`}>
                          {diff.label}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {d.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{d.descricao}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-border/60">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>⏱️ {d.tempoEstimado}</span>
                          <span>🎯 {d.taxaConclusao}%</span>
                        </div>
                        <span className="text-xs font-semibold text-primary group-hover:gap-1 flex items-center gap-0.5 transition-all">
                          Investigar →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">Nenhum caso encontrado.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
