"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/_context/userContext";
import { api } from "@/_lib/api";
import { ApiError } from "@/_lib/errors";
import type { User } from "@/_lib/types/user";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady, signOut, updateUserLocal } = useUser();
  const router = useRouter();
  const [isTokenValidating, setIsTokenValidating] = useState(false);

  // Validate token with backend when auth is ready and user exists
  useEffect(() => {
    if (!isAuthReady || !user) return;
    
    const validateToken = async () => {
      setIsTokenValidating(true);
      try {
        const validatedUser = await api.get<User>("/api/user/token/valid");
        if (validatedUser?.uid) {
          // Token valid — refresh user data from backend
          updateUserLocal(validatedUser);
        }
      } catch (err) {
        if (err instanceof ApiError && (err.statusCode === 401 || err.statusCode === 403)) {
          // Token invalid/expired — clear session
          signOut();
          router.replace("/auth/login");
        }
      } finally {
        setIsTokenValidating(false);
      }
    };

    validateToken();
  }, [isAuthReady, user, signOut, router, updateUserLocal]);

  // Redirect when user is null after auth is ready
  useEffect(() => {
    if (isAuthReady && !isTokenValidating && user === null) {
      router.replace("/auth/login");
    }
  }, [user, isAuthReady, isTokenValidating, router]);

  const showSpinner = !isAuthReady || isTokenValidating || !user;

  if (showSpinner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
