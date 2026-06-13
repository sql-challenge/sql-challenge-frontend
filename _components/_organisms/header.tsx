"use client"

import { Logo } from "@/_components/_molecules/logo"
import { ThemeToggler } from "@/_components/_atoms/themeToggler"
import { UserMenu } from "@/_components/_molecules/userMenu"
// import { FriendNotificationBell } from "@/_components/_molecules/friendNotificationBell"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Star, Award, User } from "feather-icons-react"

const NAV_LINKS = [
  { href: "/mystery",    label: "Mistérios",  Icon: Search },
  { href: "/ranking",    label: "Ranking",    Icon: Star },
  { href: "/conquistas", label: "Conquistas", Icon: Award },
  { href: "/perfil",     label: "Perfil",     Icon: User },
]

export function Header() {
  const pathname = usePathname()

  return (
    <div className="sticky top-2 z-50 w-full px-4">
      <header className="border-2 border-border bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Logo size="md" />
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label, Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/")
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border-2 ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* <FriendNotificationBell /> */}
            <ThemeToggler />
            <UserMenu />
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex border-t-2 border-border">
          {NAV_LINKS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4 mb-0.5" />
                {label}
              </Link>
            )
          })}
        </div>
      </header>
    </div>
  )
}
