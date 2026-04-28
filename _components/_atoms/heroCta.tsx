"use client";

import { useRouter } from "next/navigation";
import { Button } from "./button";
import { useUser } from "@/_context/userContext";

export function HeroCta() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <Button
      size="lg"
      className="cursor-pointer shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
      onClick={() => router.push(user ? "/mystery" : "/auth/login")}
    >
      Resolver Primeiro Mistério
    </Button>
  );
}
