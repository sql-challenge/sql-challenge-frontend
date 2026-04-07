"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/_context/userContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/auth/login");
    }
  }, [user, router]);

  if (!user) return null;

  return <>{children}</>;
}
