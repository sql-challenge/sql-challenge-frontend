"use client"

import { Avatar } from "@/_components/_atoms/avatar"
import { useAuth, useUser } from "@/_context/userContext"
import { LogIn, LogOut, User as UserIcon } from "feather-icons-react"
import Link from "next/link"
import { useMemo, useSyncExternalStore } from "react"
import { twMerge } from "tailwind-merge"

// Auth state (Firebase/localStorage) only exists on the client; gating the
// user-dependent branch on mount prevents SSR/client hydration mismatch.
const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function UserMenu() {
    const { user } = useUser()
    const { signOut } = useAuth()
    const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot)

    const initials = useMemo(() => {
        if (!user) return "??"

        return user.username
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }, [user])

    const activeUser = mounted ? user : null

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 p-1 hover:bg-secondary transition-colors cursor-pointer" aria-label={activeUser ? "Menu do usuário" : "Entrar"}>
                {activeUser ? (
                    <Avatar src={activeUser?.imagePerfil ?? undefined} alt={activeUser?.username} fallback={initials} size="md" />
                ) : (
                    <span className="flex h-10 w-10 items-center justify-center border-2 border-border text-muted-foreground">
                        <LogIn className="h-5 w-5" />
                    </span>
                )}
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all duration-300 z-50">
                <div className="border-2 border-border bg-card shadow-pixel overflow-hidden">
                    <div className="p-3 border-b-2 border-border">
                        <p className="font-medium text-sm text-foreground">{activeUser?.username || "Convidado"}</p>
                        <p className="text-xs text-muted-foreground">{activeUser?.email || "Acesse sua conta para investigar"}</p>
                    </div>
                    <div className="p-1">
                        {activeUser && (
                            <Link href="/perfil" className="flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                                <UserIcon className="h-4 w-4" />
                                Perfil
                            </Link>
                        )}
                        <button
                            className={twMerge(
                                "flex items-center gap-3 w-full px-3 py-2 text-sm transition-colors cursor-pointer",
                                activeUser ? "text-destructive hover:bg-destructive/10" : "text-primary hover:bg-primary/10"
                            )}
                            onClick={activeUser ? signOut : undefined}
                        >
                            {activeUser ? (
                                <>
                                    <LogOut className="h-4 w-4" />
                                    Sair
                                </>) : (
                                <Link className="flex items-center gap-3 w-full text-sm" href={'/auth/login'}>
                                    <LogIn className="h-4 w-4" />
                                    Entrar
                                </Link>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
