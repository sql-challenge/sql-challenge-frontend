"use client";

import { useState, useCallback } from "react";
import { api } from "@/_lib/api";
import { type Achievement, buildAchievements, RARITY_XP } from "@/_lib/achievements";
import type { User } from "@/_lib/types/user";

export function useAchievements() {
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  const clearNewly = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  const checkAchievements = useCallback(async (user: User): Promise<Achievement[]> => {
    const achievements = buildAchievements(user);
    const awarded: string[] = user.awardedAchievements ?? [];
    const newOnes = achievements.filter((a) => a.unlocked && !awarded.includes(a.id));
    if (newOnes.length === 0) return [];

    const promises = newOnes.map(async (a) => {
      const xp = RARITY_XP[a.rarity] ?? 50;
      try {
        const resp = await api.post<{ awarded: boolean }>(
          `/api/user/${user.uid}/achievements/award`,
          { achievementId: a.id, xpBonus: xp }
        );
        return resp?.awarded ? a.id : null;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(promises);
    const grantedIds = new Set(results.filter((r): r is string => r !== null));
    const granted = newOnes.filter((a) => grantedIds.has(a.id));

    if (granted.length > 0) {
      setNewlyUnlocked(granted);
    }

    return granted;
  }, []);

  return { newlyUnlocked, checkAchievements, clearNewly };
}
