"use client"

import { Moon, Sun } from 'feather-icons-react';
import { useTheme } from "@/_context/themeProvider"
import { Button } from "./button"

/** Literally a button that toggles the theme */
export function ThemeToggler() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-10 w-10 p-0 cursor-pointer" aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
