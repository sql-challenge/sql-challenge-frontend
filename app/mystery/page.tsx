"use client";

import { useState } from "react";
import { Header } from "@/_components/_organisms/header";
// import { MysteryFilters } from "@/_components/_molecules/misteryFilters"; // hold for future extension
import Link from "next/link";
import { Desafio } from "@/_lib/types/capitulo";

// ---- INLINE MOCK FOR COMPATIBILITY ----
const mockDesafios: Desafio[] = [
  {
    id: 1,
    titulo: "O banco fantasma",
    descricao: "Desvende o mistério do banco com dados desaparecidos.",
    tempoEstimado: "30min",
    taxaConclusao: 73,
    criadoEm: "2024-05-01T12:00:00Z",
    atualizadoEm: "2024-05-01T12:00:00Z"
  },
  {
    id: 2,
    titulo: "Senha perdida do gerente",
    descricao: "Recupere o acesso do gerente usando SQL.",
    tempoEstimado: "25min",
    taxaConclusao: 86,
    criadoEm: "2024-05-06T12:00:00Z",
    atualizadoEm: "2024-05-06T12:00:00Z"
  }
];
// ---- END MOCK ----

export default function MysteriesPage() {
  const [desafios] = useState<Desafio[]>(mockDesafios);
  // const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all"); // unused for now
  // const [selectedCategory, setSelectedCategory] = useState<string>("all"); // unused for now
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDesafios = desafios.filter((d) =>
    d.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.descricao.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // const categories = Array.from(new Set(desafios.map((d) => d.category).filter(Boolean))); // if/when present

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Mistérios SQL
          </h1>
          <p className="text-lg text-muted-foreground">
            Escolha um mistério e use suas habilidades SQL para desvendar o caso
          </p>
        </div>

        {/* Filters - Uncomment when category/difficulty are present */}
        {/*
        <MysteryFilters
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        */}

        {/* Simple Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar mistério..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Stats - Uncomment and extend when you have compatible stats fields */}
        {/*
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold text-foreground">{desafios.length}</p>
          </div>
        </div>
        */}

        {/* Card Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesafios.length > 0 ? (
            filteredDesafios.map((d) => (
              <Link
                key={d.id}
                href={`/mystery/${d.id}/1`}
                className="block group"
              >
                <div className="bg-card border border-border rounded-lg p-6 h-full hover:border-primary/50 transition-all hover:shadow-lg">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {d.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {d.descricao}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>⏱️ {d.tempoEstimado}</span>
                      <span>🎯 {d.taxaConclusao}%</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nenhum mistério encontrado com os filtros selecionados
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}