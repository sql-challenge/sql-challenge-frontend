/**
 * Custom API Error class for structured error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public fieldErrors?: Record<string, string>,
    public code?: string,
  ) {
    super(message)
    this.name = "API_ERROR"
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.statusCode === 422 || this.statusCode === 400
  }

  /**
   * Check if error is a server error
   */
  isServerError(): boolean {
    return this.statusCode ? this.statusCode >= 500 : false
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(): boolean {
    return !this.statusCode
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.isNetworkError()) {
      return `[${this.message.split('-')[1]}] Erro na conexão com o servidor.`
    }
    //
    if (this.isServerError()) {
      return `[${this.name}] ${this.message || "Aconteceu um erro no lado do servidor."}`
    }
    //
    return this.message
  }
}
