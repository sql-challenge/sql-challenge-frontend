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

const AUTOSAVE_INTERVAL_MS = 5 * 60_000;

export function useChapterSession(
  uid: string | null | undefined,
  desafioId: string,
  capituloId: string,
  paused = false,
): UseChapterSessionReturn {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [restored, setRestored] = useState<SessionState | null>(null);

  const sessionStartRef = useRef<number>(0);
  const loadRequestIdRef = useRef(0);
  const stateRef = useRef<SessionState>({
    currentObjetivoIndex: 0,
    completedObjetivos: [],
    hintsRevealed: [],
  });

  // Rastreia tempo pausado para excluir do elapsed enviado ao servidor
  const pauseStartRef = useRef<number | null>(null);
  const pendingPausedMsRef = useRef(0);

  useEffect(() => {
    if (paused) {
      pauseStartRef.current = Date.now();
    } else if (pauseStartRef.current !== null) {
      pendingPausedMsRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = null;
    }
  }, [paused]);

  const saveProgress = useCallback(
    (state: SessionState, isClosing = false) => {
      stateRef.current = state;
      if (!uid) return;

      const now = Date.now();
      const raw = now - sessionStartRef.current;
      // Exclui o tempo de pausa acumulado desde o último saveProgress
      const pausedMs =
        pendingPausedMsRef.current +
        (pauseStartRef.current !== null ? now - pauseStartRef.current : 0);
      const elapsed = Math.max(0, Math.floor((raw - pausedMs) / 1000));

      // Reseta contadores de pausa
      pendingPausedMsRef.current = 0;
      if (pauseStartRef.current !== null) pauseStartRef.current = now;
      sessionStartRef.current = now;

      const body = {
        elapsedSeconds: elapsed,
        currentObjetivoIndex: state.currentObjetivoIndex,
        completedObjetivos: state.completedObjetivos,
        hintsRevealed: state.hintsRevealed,
        isClosing,
      };

      if (isClosing) {
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
    const requestId = ++loadRequestIdRef.current;
    queueMicrotask(() => {
      if (loadRequestIdRef.current !== requestId) return;
      setSessionLoaded(false);
      setRestored(null);
    });

    if (!uid) {
      sessionStartRef.current = Date.now();
      queueMicrotask(() => {
        if (loadRequestIdRef.current !== requestId) return;
        setSessionLoaded(true);
      });
      return;
    }

    api
      .get<SessionResponse>(`/api/sessions/${uid}/${desafioId}/${capituloId}`)
      .then((s) => {
        if (loadRequestIdRef.current !== requestId) return;
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
        if (loadRequestIdRef.current !== requestId) return;
        sessionStartRef.current = Date.now();
        setSessionLoaded(true);
      });
  }, [uid, desafioId, capituloId]);

  // Salva ao fechar/navegar para fora da página
  useEffect(() => {
    if (!uid || !sessionLoaded) return;

    const handleUnload = () => saveProgress(stateRef.current, true);
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      saveProgress(stateRef.current, true);
    };
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

  // Cronômetro visual — congela quando paused=true
  useEffect(() => {
    if (!sessionLoaded || paused) return;

    const interval = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionLoaded, paused]);

  return { totalSeconds, sessionLoaded, restored, saveProgress };
}

export function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
}
