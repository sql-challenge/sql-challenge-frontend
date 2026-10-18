"use client"
import { api } from "@/_lib/api"

// ── Telemetria de eventos (Update 3) ─────────────────────────
// Fila em memória → flush a cada 15s em lote (≤25) → POST /api/events.
// Em pagehide: flush com fetch keepalive (sobrevive ao fechamento da aba
// e leva o header Authorization). Sem token (visitante), não coleta nada.

export type EventType =
  | "session_start"
  | "session_end"
  | "query_run"
  | "sql_error"
  | "hint_revealed"
  | "objetivo_completed"
  | "chapter_victory"

type EventEnvelope = {
  type: EventType
  desafioId: string
  capituloId: number
  clientTs: number
  payload: Record<string, unknown>
}

const FLUSH_INTERVAL_MS = 15_000
const MAX_BATCH = 25
const MAX_BUFFER = 100 // trava de memória: descarta os mais antigos

let queue: EventEnvelope[] = []
let flushTimer: ReturnType<typeof setInterval> | null = null

/** Tracker pré-atado ao contexto do capítulo. */
export type Tracker = (type: EventType, payload?: Record<string, unknown>) => void

export function createTracker(desafioId: string, capituloId: string | number): Tracker {
  const capNum = Number(capituloId) || 0
  return (type, payload = {}) => {
    trackEvent({ type, desafioId, capituloId: capNum, payload })
  }
}

type TrackedEvent = {
  type: EventType
  desafioId: string
  capituloId: number
  payload?: Record<string, unknown>
}

export function trackEvent(event: TrackedEvent): void {
  if (typeof window === "undefined") return
  if (!api.getToken()) return // telemetria exige sessão autenticada

  queue.push({ ...event, payload: event.payload ?? {}, clientTs: Date.now() })
  if (queue.length > MAX_BUFFER) {
    queue = queue.slice(-MAX_BUFFER)
  }

  ensureTimer()
  if (queue.length >= MAX_BATCH) {
    void flushEvents()
  }
}

function ensureTimer(): void {
  if (flushTimer) return
  flushTimer = setInterval(() => {
    void flushEvents()
  }, FLUSH_INTERVAL_MS)
}

/** Fecha o timer e esvazia a fila no unload — chamado no pagehide. */
export function flushTelemetryOnUnload(): void {
  stopTelemetryTimer()
  void flushEvents({ keepalive: true })
}

export function stopTelemetryTimer(): void {
  if (flushTimer) {
    clearInterval(flushTimer)
    flushTimer = null
  }
}

export async function flushEvents(opts?: { keepalive?: boolean }): Promise<void> {
  if (queue.length === 0) return

  const batch = queue.splice(0, MAX_BATCH)
  const token = api.getToken()
  if (!token) {
    queue = batch.concat(queue) // devolve — sem token não há como enviar
    return
  }

  try {
    const response = await fetch(`${process.env["NEXT_PUBLIC_API_BASE_URL"]}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ events: batch }),
      ...(opts?.keepalive ? { keepalive: true } : {}),
    })
    if (!response.ok) {
      console.error("[telemetry] flush failed:", response.status)
    }
  } catch (err) {
    console.error("[telemetry] flush error:", err)
  }
}

// Listener único por página: descarrega a fila no fechamento/navegação.
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushTelemetryOnUnload)
}
