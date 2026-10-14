"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { sendPasswordResetEmail } from "firebase/auth"
import { ArrowLeft, Mail } from "feather-icons-react"
import { Logo } from "@/_components/_molecules/logo"
import { AuthCard } from "@/_components/_organisms/auth-card"
import { FormField } from "@/_components/_molecules/form-field"
import { Button } from "@/_components/_atoms/button"
import { auth } from "@/_lib/firebase/config"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await sendPasswordResetEmail(auth, email)
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar email de redefinição")
    } finally {
      setIsLoading(false)
    }
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
              <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-success/40 bg-success/10">
                <Mail className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-xl font-display tracking-wide">Confira seu Email</h2>
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
          <h1 className="text-2xl font-display tracking-wide text-balance">Redefina sua Senha</h1>
          <p className="mt-2 text-muted-foreground">
            Digite seu email e enviaremos instruções para redefinir sua senha
          </p>
        </div>

        <AuthCard>
          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
            <FormField
              label="Email"
              type="email"
              placeholder="detetive@sqlchallenger.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              helperText="Enviaremos instruções de redefinição para este email"
              required
            />

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Instruções de Redefinição"}
            </Button>
          </form>

          <div className="mt-6">
            <Link href="/auth/login" className="cursor-pointer">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
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