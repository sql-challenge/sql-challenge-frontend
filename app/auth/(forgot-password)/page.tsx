"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Logo } from "@/_components/_molecules/logo"
import { AuthCard } from "@/_components/_organisms/auth-card"
import { FormField } from "@/_components/_molecules/form-field"
import { Button } from "@/_components/_atoms/button"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <Logo size="lg" />
            </div>
          </div>

          <AuthCard>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Confira seu Email</h2>
              <p className="text-muted-foreground">
                Enviamos instruções de redefinição de senha para <span className="font-semibold text-foreground">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Não recebeu o email? Verifique sua caixa de spam ou{" "}
                <button onClick={() => setIsSubmitted(false)} className="text-primary hover:underline">
                  tente novamente
                </button>
              </p>
            </div>

            <div className="mt-6">
              <Link href="/auth/login" className="cursor-pointer">
                <Button variant="outline" className="w-full bg-transparent">
                  Voltar para Login
                </Button>
              </Link>
            </div>
          </AuthCard>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-balance">Redefina sua Senha</h1>
          <p className="mt-2 text-muted-foreground">
            Digite seu email e enviaremos instruções para redefinir sua senha
          </p>
        </div>

        <AuthCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Email"
              type="email"
              placeholder="detetive@sqlchallenger.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              helperText="Enviaremos instruções de redefinição para este email"
              required
            />

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Instruções de Redefinição"}
            </Button>
          </form>

          <div className="mt-6">
            <Link href="/auth/login" className="cursor-pointer">
              <Button variant="ghost" className="w-full">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar para Login
              </Button>
            </Link>
          </div>
        </AuthCard>

        <p className="text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link href="/auth/register" className="cursor-pointer text-primary hover:underline font-semibold">
            Comece sua investigação
          </Link>
        </p>
      </div>
    </div>
  )
}