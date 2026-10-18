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
   * Flow-control errors do fluxo de autenticação (lançadas pelo userContext,
   * não por chamadas HTTP) — as páginas de login/registro usam-nas para
   * trocar a tela sem tratar como falha.
   */
  isEmailVerificationGate(): boolean {
    return this.code === "EMAIL_NOT_VERIFIED"
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.isNetworkError()) {
      return "Erro na conexão com o servidor. Verifique sua internet."
    }
    //
    if (this.isServerError()) {
      return "Erro interno do servidor. Tente novamente mais tarde."
    }
    //
    return this.message
  }
}

/**
 * Lançada pelo signUp em produção após enviar o email de verificação.
 * Não é uma falha — sinaliza para a página de registro trocar para a
 * tela "confira seu email".
 */
export class EmailVerificationSentError extends Error {
  constructor() {
    super("Verificação de email enviada")
    this.name = "EmailVerificationSentError"
  }
}

/**
 * Lançada pelo signIn em produção quando a conta de email/senha ainda
 * não está verificada. A página de login mostra a tela de verificação.
 */
export class EmailUnverifiedError extends Error {
  constructor() {
    super("Email não verificado")
    this.name = "EmailUnverifiedError"
  }
}
