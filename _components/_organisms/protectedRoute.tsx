"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/_context/userContext";
import { api } from "@/_lib/api";
import { ApiError } from "@/_lib/errors";
import type { User } from "@/_lib/types/user";

function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>, keys: string[]): boolean {
  for (const key of keys) {
    if (a[key] !== b[key]) return false
  }
  return true
}

const COMPARE_KEYS = ["uid", "xp", "rankingPosition", "username", "nick", "email"] as const

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { uid, isAuthReady, signOut } = useAuth();
  const { user, updateUserLocal } = useUser();
  const router = useRouter();
  const [isTokenValidating, setIsTokenValidating] = useState(false);

  const hasValidated = useRef(false);

  // Validate token with backend when auth is ready and user exists
  useEffect(() => {
    if (!isAuthReady || !uid) return;
    if (hasValidated.current) return;
    hasValidated.current = true;

    const validateToken = async () => {
      setIsTokenValidating(true);
      try {
        const validatedUser = await api.get<User>("/api/user/token/valid");
        if (validatedUser?.uid && user) {
          if (!shallowEqual(validatedUser as unknown as Record<string, unknown>, user as unknown as Record<string, unknown>, COMPARE_KEYS as unknown as string[])) {
            updateUserLocal(validatedUser);
          }
        }
      } catch (err) {
        if (err instanceof ApiError && (err.statusCode === 401 || err.statusCode === 403)) {
          signOut();
          router.replace("/auth/login");
        }
      } finally {
        setIsTokenValidating(false);
      }
    };

    validateToken();
  }, [isAuthReady, uid, user, signOut, router, updateUserLocal]);

  // Redirect when user is null after auth is ready
  useEffect(() => {
    if (isAuthReady && !isTokenValidating && uid === null) {
      router.replace("/auth/login");
    }
  }, [uid, isAuthReady, isTokenValidating, router]);

  const showSpinner = !isAuthReady || isTokenValidating || !uid;

  if (showSpinner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
