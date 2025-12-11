import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { ThemeProvider } from "@/_context/themeProvider"
import "./globals.css"
import { UserProvider } from "@/_context/userContext"

export const metadata: Metadata = {
  title: "SQL Challenger - Master SQL Through Detective Stories",
  description: "Learn SQL by solving mysteries and challenges in an engaging, gamified environment",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} h-screen`}>
        <ThemeProvider>
          <UserProvider>
            <Suspense fallback={<div className="h-full w-full flex justify-center items-center">Loading...</div>}>{children}</Suspense>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
