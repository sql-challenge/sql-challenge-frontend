"use client"

import { Logo } from "@/_components/_molecules/logo"
import { ThemeToggler } from "@/_components/_atoms/themeToggler"
import { UserMenu } from "@/_components/_molecules/userMenu"
import { FriendNotificationBell } from "@/_components/_molecules/friendNotificationBell"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_LINKS = [
  { href: "/mystery",    label: "Mistérios",  icon: "🔍" },
  { href: "/ranking",    label: "Ranking",    icon: "🏆" },
  { href: "/conquistas", label: "Conquistas", icon: "🎖️" },
  { href: "/perfil",     label: "Perfil",     icon: "👤" },
]

export function Header() {
  const pathname = usePathname()

  return (
    <div className="sticky top-2 z-50 w-full px-4">
      <header className="rounded-xl border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Logo size="md" />
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label, icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/")
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <span>{icon}</span>
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <FriendNotificationBell />
            <ThemeToggler />
            <UserMenu />
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex border-t border-border">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            )
          })}
        </div>
      </header>
    </div>
  )
}
