"use client";

import { useState } from "react";
import { Button } from "@/_components/_atoms/button";
import { Badge } from "@/_components/_atoms/badge";
import { Divider } from "@/_components/_atoms/divider";
import type { Dica } from "@/_lib/types/capitulo";
import { AlertCircle, Eye, Lock } from "feather-icons-react";

interface HintsPanelProps {
  dicas: Dica[];
  revealedDicas: number[];
  onRevealDica: (dicaId: number) => void;
}

export function HintsPanel({
  dicas,
  revealedDicas,
  onRevealDica,
}: HintsPanelProps) {
  const [confirmingDicaId, setConfirmingDicaId] = useState<number | null>(null);

  const sortedDicas = [...dicas].sort((a, b) => a.ordem - b.ordem);

  const handleRevealClick = (dicaId: number) => {
    setConfirmingDicaId(dicaId);
  };

  const handleConfirmReveal = (dicaId: number) => {
    onRevealDica(dicaId);
    setConfirmingDicaId(null);
  };

  const handleCancelReveal = () => {
    setConfirmingDicaId(null);
  };

  const totalRevealed = revealedDicas.length;
  const totalDicas = dicas.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <h3 className="text-lg font-bold text-foreground">Dicas</h3>
          </div>
          <Badge variant={totalRevealed > 0 ? "warning" : "default"}>
            {totalRevealed}/{totalDicas} reveladas
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Use dicas para ajudar a resolver o mistério, mas cuidado - cada dica
          tem uma penalidade de XP!
        </p>
      </div>

      {totalRevealed > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-warning">
            Você já revelou {totalRevealed}{" "}
            {totalRevealed === 1 ? "dica" : "dicas"}. Cada dica reduz sua
            pontuação final.
          </p>
        </div>
      )}

      <Divider />

      {/* Dicas List */}
      <div className="space-y-3">
        {sortedDicas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Nenhuma dica disponível para este capítulo.
            </p>
          </div>
        ) : (
          sortedDicas.map((dica) => {
            const isRevealed = revealedDicas.includes(dica.id);
            const isConfirming = confirmingDicaId === dica.id;

            return (
              <div
                key={dica.id}
                className={`border rounded-lg p-4 transition-all ${
                  isRevealed
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {isRevealed ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-semibold text-foreground">
                      Dica #{dica.ordem}
                    </span>
                  </div>
                  {dica.penalidadeXp > 0 && (
                    <Badge
                      variant={isRevealed ? "warning" : "outline"}
                      className="text-xs"
                    >
                      -{dica.penalidadeXp} XP
                    </Badge>
                  )}
                </div>

                {isRevealed ? (
                  <p className="text-sm text-foreground leading-relaxed bg-background/50 rounded-md p-3 border border-border">
                    {dica.conteudo}
                  </p>
                ) : isConfirming ? (
                  <div className="space-y-3">
                    <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
                      <p className="text-xs text-warning mb-2">
                        Tem certeza que deseja revelar esta dica?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Você perderá {dica.penalidadeXp} XP da sua pontuação final.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleConfirmReveal(dica.id)}
                        className="flex-1"
                      >
                        Sim, revelar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelReveal}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground italic">
                      Esta dica está bloqueada. Clique no botão abaixo para
                      revelá-la.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRevealClick(dica.id)}
                      className="w-full"
                    >
                      <Lock className="h-3 w-3 mr-2" />
                      Revelar Dica (-{dica.penalidadeXp} XP)
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}