"use client";

import { useState } from "react";
import { Button } from "@/_components/_atoms/button";
import { Badge } from "@/_components/_atoms/badge";
import { Divider } from "@/_components/_atoms/divider";
import type { Hint } from "@/_lib/types/mystery";
import { AlertCircle, Eye, Lock } from "feather-icons-react";

interface HintsPanelProps {
  hints: Hint[];
  revealedHints: string[];
  onRevealHint: (hintId: string) => void;
}

export function HintsPanel({
  hints,
  revealedHints,
  onRevealHint,
}: HintsPanelProps) {
  const [confirmingHintId, setConfirmingHintId] = useState<string | null>(null);

  const sortedHints = [...hints].sort((a, b) => a.order - b.order);

  const handleRevealClick = (hintId: string) => {
    setConfirmingHintId(hintId);
  };

  const handleConfirmReveal = (hintId: string) => {
    onRevealHint(hintId);
    setConfirmingHintId(null);
  };

  const handleCancelReveal = () => {
    setConfirmingHintId(null);
  };

  const totalRevealed = revealedHints.length;
  const totalHints = hints. length;

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
            {totalRevealed}/{totalHints} reveladas
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
            {totalRevealed === 1 ? "dica" : "dicas"}.  Cada dica reduz sua
            pontuação final. 
          </p>
        </div>
      )}

      <Divider />

      {/* Hints List */}
      <div className="space-y-3">
        {sortedHints.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Nenhuma dica disponível para este mistério.
            </p>
          </div>
        ) : (
          sortedHints.map((hint) => {
            const isRevealed = revealedHints.includes(hint.id);
            const isConfirming = confirmingHintId === hint.id;

            return (
              <div
                key={hint.id}
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
                      Dica #{hint.order}
                    </span>
                  </div>
                  {hint.xpPenalty > 0 && (
                    <Badge
                      variant={isRevealed ? "warning" : "outline"}
                      className="text-xs"
                    >
                      -{hint.xpPenalty} XP
                    </Badge>
                  )}
                </div>

                {isRevealed ?  (
                  <p className="text-sm text-foreground leading-relaxed bg-background/50 rounded-md p-3 border border-border">
                    {hint.content}
                  </p>
                ) : isConfirming ? (
                  <div className="space-y-3">
                    <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
                      <p className="text-xs text-warning mb-2">
                        Tem certeza que deseja revelar esta dica?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Você perderá {hint.xpPenalty} XP da sua pontuação
                        final.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleConfirmReveal(hint. id)}
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
                      onClick={() => handleRevealClick(hint.id)}
                      className="w-full"
                    >
                      <Lock className="h-3 w-3 mr-2" />
                      Revelar Dica (-{hint.xpPenalty} XP)
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