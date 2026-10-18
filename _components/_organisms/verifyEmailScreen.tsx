"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, RefreshCw, LogOut, AlertCircle } from "feather-icons-react";
import { Logo } from "@/_components/_molecules/logo";
import { AuthCard } from "@/_components/_organisms/auth-card";
import { Button } from "@/_components/_atoms/button";
import { sendVerificationEmail, reloadAndCheckVerified } from "@/_lib/firebase/auth";

type Props = {
  email: string;
  /**
   * "sent"  — fluxo de registro: email enviado, usuário deslogado.
   * "gate"  — fluxo de login: usuário logado mas não verificado
   *           (reenvio + botão "já verifiquei" + sair da conta).
   */
  mode: "sent" | "gate";
  /** gate: chamado quando a verificação foi confirmada — prossegue o login. */
  onVerified?: () => void;
  /** gate: chamado ao sair da conta (ex.: email digitado errado). */
  onUseOtherAccount?: () => void;
};

/**
 * Tela do hard gate de verificação de email (produção).
 * Em dev/emulador nunca é renderizada (REQUIRE_EMAIL_VERIFICATION=false).
 */
export function VerifyEmailScreen({ email, mode, onVerified, onUseOtherAccount }: Props) {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setError(null);
    setIsResending(true);
    try {
      await sendVerificationEmail();
      setResent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao reenviar o email.");
    } finally {
      setIsResending(false);
    }
  };

  const handleConfirmed = async () => {
    setError(null);
    setIsChecking(true);
    try {
      const verified = await reloadAndCheckVerified();
      if (verified) {
        onVerified?.();
        return;
      }
      setError("Ainda não detectamos a confirmação. Aguarde alguns segundos e tente novamente.");
    } catch {
      setError("Sessão expirada. Faça login novamente.");
    } finally {
      setIsChecking(false);
    }
  };

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
            <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-primary/40 bg-primary/10">
              {mode === "gate" && error
                ? <AlertCircle className="h-8 w-8 text-destructive" />
                : <Mail className="h-8 w-8 text-primary" />}
            </div>
            <h2 className="text-xl font-display tracking-wide">
              {mode === "sent" ? "Confirme seu email" : "Verificação pendente"}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {mode === "sent"
                ? <>Enviamos um link de confirmação para <span className="font-semibold text-foreground">{email}</span>. Verifique sua caixa de entrada e confirme o email para ativar sua conta de detetive.</>
                : <>A conta <span className="font-semibold text-foreground">{email}</span> ainda não foi confirmada. Abra o link que enviamos para ativá-la.</>}
            </p>
            {resent && (
              <p className="text-xs text-success">Email reenviado. Confira sua caixa de entrada.</p>
            )}
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            {mode === "gate" && (
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  disabled={isChecking}
                  onClick={handleConfirmed}
                >
                  {isChecking ? "Verificando..." : "Já verifiquei — continuar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  disabled={isResending}
                  onClick={handleResend}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {isResending ? "Reenviando..." : "Reenviar email"}
                </Button>
                {onUseOtherAccount && (
                  <button
                    type="button"
                    onClick={onUseOtherAccount}
                    className="mt-2 inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Usar outra conta
                  </button>
                )}
              </div>
            )}

            {mode === "sent" && (
              <div className="pt-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="lg" className="w-full">
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </AuthCard>

        <p className="text-center text-xs text-muted-foreground">
          Não recebeu? Verifique o spam ou confira se o email está correto.
        </p>
      </div>
    </div>
  );
}
