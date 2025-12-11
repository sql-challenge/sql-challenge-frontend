"use client";

import { Search } from "feather-icons-react";
import { Input } from "@/_components/_atoms/input";
import { Badge } from "@/_components/_atoms/badge";
import type { DifficultyLevel } from "@/_lib/types/mystery";

interface MysteryFiltersProps {
  selectedDifficulty: DifficultyLevel | "all";
  onDifficultyChange: (difficulty: DifficultyLevel | "all") => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const difficulties: Array<{ value: DifficultyLevel | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
  { value: "expert", label: "Expert" },
];

export function MysteryFilters({
  selectedDifficulty,
  onDifficultyChange,
  selectedCategory,
  onCategoryChange,
  categories,
  searchQuery,
  onSearchChange,
}: MysteryFiltersProps) {
  const hasActiveFilters =
    selectedDifficulty !== "all" || selectedCategory !== "all" || searchQuery !== "";

  const handleClearFilters = () => {
    onDifficultyChange("all");
    onCategoryChange("all");
    onSearchChange("");
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-8 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar mistérios por nome ou descrição..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target. value)}
          className="pl-10"
        />
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Dificuldade</h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((difficulty) => (
            <button
              key={difficulty.value}
              onClick={() => onDifficultyChange(difficulty.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:cursor-pointer ${
                selectedDifficulty === difficulty.value
                  ?  "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {difficulty.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Categoria</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:cursor-pointer ${
              selectedCategory === "all"
                ? "bg-accent text-accent-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:cursor-pointer ${
                selectedCategory === category
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filtros ativos:</span>
            {selectedDifficulty !== "all" && (
              <Badge variant="primary" className="cursor-pointer" onClick={() => onDifficultyChange("all")}>
                {difficulties.find((d) => d.value === selectedDifficulty)?.label} ✕
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="primary" className="cursor-pointer" onClick={() => onCategoryChange("all")}>
                {selectedCategory} ✕
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="primary" className="cursor-pointer" onClick={() => onSearchChange("")}>
                &quot;{searchQuery}&quot; ✕
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}