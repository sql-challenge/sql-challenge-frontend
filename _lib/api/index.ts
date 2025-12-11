"use client"
import { config } from "@/_utils"
import { ApiError } from "../errors"
// import '@/_lib/env'


type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    body?: any
    headers?: Record<string, string>
    token?: string
}

type ApiResponse<T> = {
    data?: T
    error?: string
    fieldErrors?: Record<string, string>
    message?: string
}

/**
 * API Client for making HTTP requests with error handling
 */
class ApiClient {
    private baseUrl: string

    constructor(baseUrl = "/api") {
        this.baseUrl = baseUrl
    }

    /**
     * Make an API request
     */
    async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
        const { method = "GET", body, headers = {}, token } = options

        const config: RequestInit = {
            method,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        }

        // Add authorization header if token is provided
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            }
        }

        // Add body for non-GET requests
        if (body && method !== "GET") {
            config.body = JSON.stringify(body)
        }

        try {
            const response = await fetch(`${this.baseUrl}${path}`, config)

            // Parse response
            let data: ApiResponse<T>
            try {
                data = await response.json()
            } catch {
                // If response is not JSON, create a generic error
                if (!response.ok) {
                    throw new ApiError(response.statusText || "Requisição falhou", response.status)
                }
                // If response is ok but not JSON, return empty object
                data = {} as ApiResponse<T>
        
            }

            // Handle error responses
            if (!response.ok) {
                throw new ApiError((data.error || data.message) || "Requisição falhou", response.status, data.fieldErrors)
            }

            return data.data as T
        } catch (error) {
            // Handle network errors
            if (error instanceof ApiError) {
                throw error
            }

            // Handle fetch errors (network issues, etc.)
            if (error instanceof TypeError) {
                throw new ApiError(`${error.name}-${error.message}`)
            }

            // Handle unknown errors
            throw new ApiError(error instanceof Error ? error.message : "Um erro inesperado aconteceu")
        }
    }

    /**
     * GET request
     */
    async get<T>(path: string, token?: string): Promise<T> {
        return this.request<T>(path, { method: "GET", token })
    }

    /**
     * POST request
     */
    async post<T>(path: string, body?: any, token?: string): Promise<T> {
        return this.request<T>(path, { method: "POST", body, token })
    }

    /**
     * PUT request
     */
    async put<T>(path: string, body?: any, token?: string): Promise<T> {
        return this.request<T>(path, { method: "PUT", body, token })
    }

    /**
     * PATCH request
     */
    async patch<T>(path: string, body?: any, token?: string): Promise<T> {
        return this.request<T>(path, { method: "PATCH", body, token })
    }

    /**
     * DELETE request
     */
    async delete<T>(path: string, token?: string): Promise<T> {
        return this.request<T>(path, { method: "DELETE", token })
    }
}

// Export singleton instance
export const api = new ApiClient(`${process.env["NEXT_PUBLIC_API_BASE_URL"]}:${process.env["NEXT_PUBLIC_API_PORT"]}`)
