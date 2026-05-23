"use client"
import { ApiError } from "../errors"

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    body?: unknown
    headers?: Record<string, string>
    token?: string
    signal?: AbortSignal
}

type ApiResponse<T> = {
    data?: T
    error?: string
    fieldErrors?: Record<string, string>
    message?: string
}

const DEBUG = typeof window !== "undefined" && process.env["NEXT_PUBLIC_API_DEBUG"] === "true"

class ApiClient {
    private baseUrl: string
    private token: string | null = null
    private onAuthExpiredCb: (() => void) | null = null
    private inFlight: Map<string, Promise<unknown>> = new Map()

    constructor(baseUrl = "/api") {
        this.baseUrl = baseUrl
    }

    setToken(token: string | null) {
        this.token = token
    }

    getToken(): string | null {
        return this.token
    }

    setOnAuthExpired(cb: (() => void) | null) {
        this.onAuthExpiredCb = cb
    }

    private dedupKey(method: string, path: string, token?: string): string {
        return `${method}:${path}:${token ?? this.token ?? ""}`
    }

    async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
        const { method = "GET", body, headers = {}, token, signal } = options

        // ── Deduplicate concurrent GET requests ────────────────
        if (method === "GET") {
            const key = this.dedupKey(method, path, token)
            const existing = this.inFlight.get(key)
            if (existing) {
                if (DEBUG) console.debug(`[API] dedup GET ${path}`)
                return existing as Promise<T>
            }
        }

        const config: RequestInit = {
            method,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            signal,
        }

        const bearerToken = token ?? this.token
        if (bearerToken) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${bearerToken}`,
            }
        }

        if (body && method !== "GET") {
            config.body = JSON.stringify(body)
        }

        const doFetch = async (): Promise<T> => {
            if (DEBUG) console.debug(`[API] ${method} ${path}`)

            try {
                const response = await fetch(`${this.baseUrl}${path}`, config)

                if (response.status === 401) {
                    this.onAuthExpiredCb?.()
                }

                let data: ApiResponse<T>

                try {
                    data = await response.json()
                } catch {
                    if (!response.ok) {
                        throw new ApiError("Resposta inválida do servidor.", response.status)
                    }
                    data = {} as ApiResponse<T>
                }

                if (data.error) {
                    const message = response.status >= 500
                        ? "Erro interno do servidor. Tente novamente."
                        : data.error
                    throw new ApiError(message, response.status)
                }

                if (!response.ok) {
                    const message = response.status >= 500
                        ? "Erro interno do servidor. Tente novamente."
                        : (data.error || data.message) || "Requisição falhou"
                    throw new ApiError(message, response.status, data.fieldErrors)
                }

                return data.data as T
            } catch (error) {
                if (error instanceof ApiError) {
                    throw error
                }

                if (error instanceof DOMException && error.name === "AbortError") {
                    throw error
                }

                if (error instanceof TypeError) {
                    throw new ApiError("Erro de conexão com o servidor. Verifique sua internet.")
                }

                throw new ApiError("Um erro inesperado aconteceu. Tente novamente.")
            }
        }

        const promise = doFetch()
        const key = method === "GET" ? this.dedupKey(method, path, token) : null

        if (key) {
            this.inFlight.set(key, promise)
            promise.finally(() => {
                if (this.inFlight.get(key) === promise) {
                    this.inFlight.delete(key)
                }
            })
        }

        return promise
    }

    async get<T>(path: string, token?: string, signal?: AbortSignal): Promise<T> {
        return this.request<T>(path, { method: "GET", token, signal })
    }

    async post<T>(path: string, body?: unknown, token?: string): Promise<T> {
        return this.request<T>(path, { method: "POST", body, token })
    }

    async put<T>(path: string, body?: unknown, token?: string): Promise<T> {
        return this.request<T>(path, { method: "PUT", body, token })
    }

    async patch<T>(path: string, body?: unknown, token?: string): Promise<T> {
        return this.request<T>(path, { method: "PATCH", body, token })
    }

    async delete<T>(path: string, token?: string): Promise<T> {
        return this.request<T>(path, { method: "DELETE", token })
    }
}

export const api = new ApiClient(`${process.env["NEXT_PUBLIC_API_BASE_URL"]}`)
