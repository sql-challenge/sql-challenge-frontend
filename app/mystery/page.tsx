"use client";

import { useState, useEffect } from "react";
import { Header } from "@/_components/_organisms/header";
import Link from "next/link";
import { Desafio } from "@/_lib/types/capitulo";

export default function MysteriesPage() {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesafios = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/desafios/`);
        if (!response.ok) throw new Error("Falha ao carregar desafios");
        const data: Desafio[] = await response.json();
        setDesafios(data);
      } catch (err) {
        setError("Não foi possível carregar os desafios.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDesafios();
  }, []);

  const filteredDesafios = desafios.filter((d) =>
    d.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.descricao.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Mistérios SQL
          </h1>
          <p className="text-lg text-muted-foreground">
            Escolha um mistério e use suas habilidades SQL para desvendar o caso
          </p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar mistério..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Carregando desafios...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
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
        )}
      </div>
    </div>
  );
}
