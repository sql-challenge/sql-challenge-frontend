"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/_context/userContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isAuthReady && user === null) {
      router.replace("/auth/login");
    }
  }, [user, isAuthReady, router]);

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
