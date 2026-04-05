"use client";

import { Badge } from "@/_components/_atoms/badge";
import { Divider } from "@/_components/_atoms/divider";
import type { MysteryDetail } from "@/_lib/types/mystery";

interface MysteryStoryProps {
  mystery: MysteryDetail;
}

export function MysteryStory({ mystery }: MysteryStoryProps) {
  return (
    <div className="space-y-4">
      {/* Story Introduction */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {/* <span className="text-2xl">📖</span> */}
          <h3 className="text-lg font-bold text-foreground">A História</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed italic">
          {mystery.storyIntro}
        </p>
      </div>

      <Divider />

      {/* Story Context */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {/* <span className="text-2xl">🔍</span> */}
          <h3 className="text-lg font-bold text-foreground">O Contexto</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {mystery.storyContext}
        </p>
      </div>

      <Divider />

      {/* Objectives */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {/* <span className="text-2xl">🎯</span> */}
          <h3 className="text-lg font-bold text-foreground">Objetivos</h3>
        </div>
        <ul className="space-y-2">
          {mystery.objectives. map((objective, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <Badge variant="primary" className="mt-0.5 shrink-0">
                {index + 1}
              </Badge>
              <span className="leading-relaxed">{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      <Divider />

      {/* Mystery Tags */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {/* <span className="text-2xl">🏷️</span> */}
          <h3 className="text-lg font-bold text-foreground">Conceitos</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {mystery.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}