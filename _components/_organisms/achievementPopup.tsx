"use client";

import { Award, X } from "feather-icons-react";
import { type Achievement, ICONS, RARITY_STYLE, RARITY_XP } from "@/_lib/achievements";

interface AchievementPopupProps {
  achievements: Achievement[];
  onClose: () => void;
  onNavigateNext?: () => void;
}

const popInKeyframes = `
@keyframes pop-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
`;

export function AchievementPopup({ achievements, onClose, onNavigateNext }: AchievementPopupProps) {
  if (achievements.length === 0) return null;

  return (
    <>
      <style>{popInKeyframes}</style>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
        style={{ animation: "pop-in 0.2s ease-out 1 forwards" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
              Parabéns!
            </p>
            <h3 className="text-xl font-extrabold text-foreground">
              {achievements.length === 1
                ? "Conquista Desbloqueada"
                : `${achievements.length} Conquistas Desbloqueadas`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {achievements.map((ach) => {
            const Icon  = ICONS[ach.id] ?? Award;
            const style = RARITY_STYLE[ach.rarity];
            const xp    = RARITY_XP[ach.rarity];
            return (
              <div
                key={ach.id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${style.border} ${style.bg}`}
              >
                <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border ${style.border} ${style.bg}`}>
                  <Icon className={`w-5 h-5 ${style.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground leading-tight">{ach.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{ach.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-yellow-400">+{xp} XP</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${style.badge}`}>
                    {style.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            onClose();
            onNavigateNext?.();
          }}
          className="mt-4 w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          Incrível!
        </button>
      </div>
    </div>
    </>
  );
}
