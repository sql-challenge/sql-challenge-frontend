"use client"

import { Avatar } from "@/_components/_atoms/avatar"
import { User, useUser } from "@/_context/userContext"
import { LogIn, LogOut, Settings, User as UserIcon } from "feather-icons-react"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { twMerge } from "tailwind-merge"

interface UserMenuProps {
    user: User
}

export function UserMenu() {
    const { user, signOut } = useUser()

    const initials = useMemo(() => {
        if (!user) return "??"

        return user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }, [user])

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-secondary transition-colors">
                <Avatar src={user?.avatar} alt={user?.name} fallback={initials} size="md" />
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-50">
                <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                    <div className="p-3 border-b border-border">
                        <p className="font-medium text-sm text-foreground">{user?.name || "Convidado"}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || "convidado@mock.com"}</p>
                    </div>
                    <div className="p-1">
                        {user && (<>
                            <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors">
                                <UserIcon className="h-4 w-4" />
                                Profile
                            </button>
                            <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors">
                                <Settings className="h-4 w-4" />
                                Settings
                            </button>

                        </>)}
                        <button
                            className={twMerge(
                                "flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors cursor-pointer",
                                user ? "text-destructive hover:bg-destructive/10" : "text-primary hover:bg-primary/10"
                            )}
                            onClick={user ? signOut : undefined}
                        >
                            {user ? (
                                <>
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </>) : (
                                <Link className="flex items-center gap-3 w-full text-sm rounded-md" href={'/auth/login'}>
                                    <LogIn className="h-4 w-4" />
                                    Sign In
                                </Link>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
