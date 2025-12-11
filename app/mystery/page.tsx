"use client";

import { useState } from "react";
import { Header } from "@/_components/_organisms/header";
import { MysteryCard } from "@/_components/_molecules/misteryCard";
import { MysteryFilters } from "@/_components/_molecules/misteryFilters";
import type { Mystery, DifficultyLevel } from "@/_lib/types/mystery";
import { mockMysteries } from "@/_lib/mock/mystery";

export default function MysteriesPage() {
  const [mysteries, setMysteries] = useState<Mystery[]>(mockMysteries);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMysteries = mysteries.filter((mystery) => {
    const matchesDifficulty = selectedDifficulty === "all" || mystery.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === "all" || mystery.category === selectedCategory;
    const matchesSearch = 
      mystery.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mystery.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDifficulty && matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(mysteries. map((m) => m.category)));

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

        {/* Filters */}
        <MysteryFilters
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold text-foreground">{mysteries.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Disponíveis</p>
            <p className="text-2xl font-bold text-primary">
              {mysteries.filter((m) => m.status === "available").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Em Progresso</p>
            <p className="text-2xl font-bold text-accent">
              {mysteries.filter((m) => m.status === "in_progress").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Completados</p>
            <p className="text-2xl font-bold text-success">
              {mysteries.filter((m) => m.status === "completed").length}
            </p>
          </div>
        </div>

        {/* Mystery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMysteries.length > 0 ? (
            filteredMysteries.map((mystery) => (
              <MysteryCard key={mystery.id} mystery={mystery} />
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