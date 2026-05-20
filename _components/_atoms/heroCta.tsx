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
      className="cursor-pointer"
      onClick={() => router.push(user ? "/mystery" : "/auth/login")}
    >
      Resolver Primeiro Mistério
    </Button>
  );
}
