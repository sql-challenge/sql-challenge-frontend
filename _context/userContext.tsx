"use client"

import { api } from "@/_lib/api"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { User, UserSignUp } from '@/_lib/types/user'
// export type User = {
//   id: string
//   name: string
//   email: string
//   avatar?: string
//   level?: number
//   xp?: number
// }

// export interface LoginUserResponse extends User {

// }

type UserContextType = {
  user: User | null
  // isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (form: UserSignUp) => Promise<void>
  signOut: () => void
  updateUser: (updates: Partial<User>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for saved user in localStorage after mount
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Failed to parse saved user:", error)
        localStorage.removeItem("user")
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    // loginSchema.parse({ email, password })
    // TODO: Replace with actual API call
    // Simulate API call
    // await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = await api.post<User>('/api/user/auth/', {email, password})
    // persist session
    // change to jwt or order thing 
    setUser(user)
    localStorage.setItem("user", JSON.stringify(user))
  }

  const signUp = async (form: UserSignUp) => {
    const user = await api.post<User>('/api/user/', form)

    setUser(user)
    localStorage.setItem("user", JSON.stringify(user))
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  return (
    <UserContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
