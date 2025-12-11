"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useUser } from "@/_context/userContext"
import { useRouter } from "next/navigation"
import { Logo } from "@/_components/_molecules/logo"
import { AuthCard } from "@/_components/_organisms/auth-card"
import { FormField } from "@/_components/_molecules/form-field"
import { Button } from "@/_components/_atoms/button"
import { Badge } from "@/_components/_atoms/badge"
import { ZodError } from "zod"
import { ApiError } from "@/_lib/errors"
import { UserSignUpForm, UserSignUp, UserSignUpWithoutDefaultValues } from "@/_lib/types/user"


export default function RegisterPage() {
  const [formData, setFormData] = useState<UserSignUpForm>({
    username: "",
    email: "",
    imagePerfil: "",
    password: "",
    confirmPassword: "",
    nick: "", // campo inutil?
  })
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UserSignUpForm, string>>>({})

  const { signUp, user } = useUser()
  const router = useRouter()

  const validateField = (field: keyof UserSignUpForm, value: string) => {
    try {
      // Basic validation
      if (field === "confirmPassword" && value !== formData. password) {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: "As senhas não coincidem" }))
      } else if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFieldErrors((prev) => ({ ...prev, email: "Email inválido" }))
      } else if (field === "password" && value.length < 8) {
        setFieldErrors((prev) => ({ ...prev, password: "A senha deve ter no mínimo 8 caracteres" }))
      } else if (field === "username" && value.length < 3) {
        setFieldErrors((prev) => ({ ...prev, name: "O nome deve ter no mínimo 3 caracteres" }))
      } else {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    } catch (err:  any) {
      console.error("Validation error:", err)
    }
  }

  const handleFieldChange = (field: keyof UserSignUpForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    // Calculate password strength
    if (field === "password") {
      let strength = 0
      if (value.length >= 8) strength++
      if (/[a-z]/.test(value)) strength++
      if (/[A-Z]/. test(value)) strength++
      if (/[0-9]/.test(value)) strength++
      if (/[^A-Za-z0-9]/. test(value)) strength++
      setPasswordStrength(strength)
    }
  }

  const handleFieldBlur = (field: keyof UserSignUpForm) => () => {
    validateField(field, formData[field] || "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      setIsLoading(true)
      
      // Validate all fields
      if (formData.password !== formData.confirmPassword) {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: "As senhas não coincidem" }))
        return
      }

      if (formData.password.length < 8) {
        setFieldErrors((prev) => ({ ...prev, password: "A senha deve ter no mínimo 8 caracteres" }))
        return
      }

      // Call signUp with validated data
      await signUp({...formData,
        challenge_progress: [],
        xp: 0,
        rankingPosition: 0,
        friends: []
       })
       //
      router.push("/dashboard")
    } catch (err) {
      // Handle API errors
      if (err instanceof ApiError) {
        setError(err.getUserMessage())
      } else {
        setError("Ocorreu um erro ao criar sua conta. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const hasErrors = Object.values(fieldErrors).some((error) => error !== undefined)

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return null
    if (passwordStrength <= 2) return <Badge variant="destructive">Fraca</Badge>
    if (passwordStrength <= 3) return <Badge variant="warning">Média</Badge>
    return <Badge variant="success">Forte</Badge>
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-balance">Junte-se à Investigação</h1>
          <p className="mt-2 text-muted-foreground">Crie sua conta de detetive e comece a solucionar mistérios em SQL</p>
        </div>

        <AuthCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormField
              label="Nome de usuário"
              type="text"
              placeholder="nome_do_detetive"
              value={formData.username}
              onChange={handleFieldChange("username")}
              onBlur={handleFieldBlur("username")}
              error={fieldErrors.username}
              helperText="Este será seu nome de detetive público"
              required
            />

            <FormField
              label="Email"
              type="email"
              placeholder="detetive@sqlchallenger.com"
              value={formData.email}
              onChange={handleFieldChange("email")}
              onBlur={handleFieldBlur("email")}
              error={fieldErrors.email}
              required
            />

            <div className="space-y-2">
              <FormField
                label="Senha"
                type="password"
                placeholder="Crie uma senha forte"
                value={formData. password}
                onChange={handleFieldChange("password")}
                onBlur={handleFieldBlur("password")}
                error={fieldErrors.password}
                helperText="Mínimo de 8 caracteres com letras maiúsculas, minúsculas e números"
                required
              />
              {formData.password && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrength
                            ? passwordStrength <= 2
                              ? "bg-destructive"
                              : passwordStrength <= 3
                                ? "bg-warning"
                                : "bg-success"
                            : "bg-secondary"
                        }`}
                      />
                    ))}
                  </div>
                  {getPasswordStrengthLabel()}
                </div>
              )}
            </div>

            <FormField
              label="Confirmar Senha"
              type="password"
              placeholder="Confirme sua senha"
              value={formData.confirmPassword}
              onChange={handleFieldChange("confirmPassword")}
              onBlur={handleFieldBlur("confirmPassword")}
              error={fieldErrors.confirmPassword}
              required
            />

            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-border bg-input accent-primary"
                required
              />
              <span className="text-muted-foreground">
                Eu concordo com os{" "}
                <Link href="/terms" className="text-primary hover: underline">
                  Termos de Serviço
                </Link>{" "}
                e{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
              </span>
            </div>

            <Button type="submit" className="w-full cursor-pointer" size="lg" disabled={isLoading || hasErrors}>
              {isLoading ? "Criando conta..." : "Criar Conta de Detetive"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou cadastre-se com</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" type="button" disabled>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-. 26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button" disabled>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-. 261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-. 729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>
          </div>
        </AuthCard>

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta? {" "}
          <Link href="/auth/login" className="text-primary hover:underline font-semibold">
            Entre
          </Link>
        </p>
      </div>
    </div>
  )
}