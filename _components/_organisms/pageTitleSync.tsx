"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const BRAND = "SQL CHALLENGER";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return BRAND;
  if (pathname === "/mystery") return "Mistérios";
  if (pathname.startsWith("/mystery/")) return "Mistério";
  if (pathname === "/ranking") return "Ranking";
  if (pathname === "/conquistas") return "Conquistas";
  if (pathname === "/perfil") return "Perfil";
  if (pathname === "/auth/login") return "Login";
  if (pathname === "/auth/register") return "Cadastro";
  if (pathname === "/auth/forgot-password") return "Recuperar Senha";
  return BRAND;
}

export function PageTitleSync() {
  const pathname = usePathname();

  useEffect(() => {
    document.title = getPageTitle(pathname);
  }, [pathname]);

  return null;
}

