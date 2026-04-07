"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/_lib/api";

export interface SessionState {
  currentObjetivoIndex: number;
  completedObjetivos: number[];
  hintsRevealed: number[];
}

interface SessionResponse {
  totalSeconds: number;
  currentObjetivoIndex: number;
  completedObjetivos: number[];
  hintsRevealed: number[];
}

interface UseChapterSessionReturn {
  totalSeconds: number;
  sessionLoaded: boolean;
  restored: SessionState | null;
  saveProgress: (state: SessionState, isClosing?: boolean) => void;
}

const AUTOSAVE_INTERVAL_MS = 30_000;

export function useChapterSession(
  uid: string | null | undefined,
  desafioId: string,
  capituloId: string
): UseChapterSessionReturn {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [restored, setRestored] = useState<SessionState | null>(null);

  // Tick do cronômetro local (conta apenas o tempo da sessão atual)
  const localSecondsRef = useRef(0);
  const sessionStartRef = useRef<number>(0);

  // Ref para o estado mais recente — usada pelos listeners de evento
  const stateRef = useRef<SessionState>({
    currentObjetivoIndex: 0,
    completedObjetivos: [],
    hintsRevealed: [],
  });

  // Atualiza a ref toda vez que o estado mudar (chamado externamente via saveProgress)
  const saveProgress = useCallback(
    (state: SessionState, isClosing = false) => {
      stateRef.current = state;
      if (!uid) return;

      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      sessionStartRef.current = Date.now();
      localSecondsRef.current += elapsed;
      setTotalSeconds((prev) => prev + elapsed);

      const body = {
        elapsedSeconds: elapsed,
        currentObjetivoIndex: state.currentObjetivoIndex,
        completedObjetivos: state.completedObjetivos,
        hintsRevealed: state.hintsRevealed,
        isClosing,
      };

      if (isClosing) {
        // navigator.sendBeacon garante entrega mesmo quando a página está fechando
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sessions/${uid}/${desafioId}/${capituloId}`;
        const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } else {
        api.patch(`/api/sessions/${uid}/${desafioId}/${capituloId}`, body).catch(() => {});
      }
    },
    [uid, desafioId, capituloId]
  );

  // Carrega sessão salva ao montar
  useEffect(() => {
    if (!uid) {
      sessionStartRef.current = Date.now();
      setSessionLoaded(true);
      return;
    }

    api
      .get<{ data: SessionResponse }>(`/api/sessions/${uid}/${desafioId}/${capituloId}`)
      .then((res) => {
        const s = (res as { data: SessionResponse }).data;
        setTotalSeconds(s.totalSeconds ?? 0);

        const restoredState: SessionState = {
          currentObjetivoIndex: s.currentObjetivoIndex ?? 0,
          completedObjetivos: s.completedObjetivos ?? [],
          hintsRevealed: s.hintsRevealed ?? [],
        };
        stateRef.current = restoredState;
        setRestored(restoredState);
      })
      .catch(() => {})
      .finally(() => {
        sessionStartRef.current = Date.now();
        setSessionLoaded(true);
      });
  }, [uid, desafioId, capituloId]);

  // Salva ao fechar/navegar para fora da página
  useEffect(() => {
    if (!uid || !sessionLoaded) return;

    const handleUnload = () => saveProgress(stateRef.current, true);
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [uid, sessionLoaded, saveProgress]);

  // Autosave a cada 30s
  useEffect(() => {
    if (!uid || !sessionLoaded) return;

    const interval = setInterval(
      () => saveProgress(stateRef.current, false),
      AUTOSAVE_INTERVAL_MS
    );
    return () => clearInterval(interval);
  }, [uid, sessionLoaded, saveProgress]);

  // Cronômetro visual (incrementa a cada segundo)
  useEffect(() => {
    if (!sessionLoaded) return;

    const interval = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionLoaded]);

  return { totalSeconds, sessionLoaded, restored, saveProgress };
}

export function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
}
