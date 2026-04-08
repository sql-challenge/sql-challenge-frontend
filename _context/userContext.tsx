"use client"

import { api } from "@/_lib/api"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { User, UserSignUpForm } from '@/_lib/types/user'
import {
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithGithub as firebaseSignInWithGithub,
  firebaseSignOut,
} from "@/_lib/firebase/auth"

type UserContextType = {
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (form: UserSignUpForm) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => void
  updateUser: (updates: Partial<User>) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("user")
      }
    }
  }, [])

  const persist = (u: User) => {
    setUser(u)
    localStorage.setItem("user", JSON.stringify(u))
  }

  const signIn = async (email: string, password: string) => {
    const user = await api.post<User>('/api/user/auth/', { email, password })
    persist(user)
  }

  const signUp = async (form: UserSignUpForm) => {
    const user = await api.post<User>('/api/user/', form)
    persist(user)
  }

  /**
   * Login/cadastro via Google.
   * O Firebase (Google) autentica o usuário e retorna um ID token assinado.
   * O backend verifica o token e cria o usuário no Firestore se for a primeira vez.
   */
  const signInWithGoogle = async () => {
    const { idToken } = await firebaseSignInWithGoogle()
    const user = await api.post<User>('/api/user/auth/oauth', { idToken })
    persist(user)
  }

  /**
   * Login/cadastro via GitHub.
   * Mesmo fluxo do Google — Firebase verifica a identidade, backend cria/atualiza o registro.
   */
  const signInWithGithub = async () => {
    const { idToken } = await firebaseSignInWithGithub()
    const user = await api.post<User>('/api/user/auth/oauth', { idToken })
    persist(user)
  }

  const signOut = async () => {
    await firebaseSignOut().catch(() => {})
    setUser(null)
    localStorage.removeItem("user")
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return
    await api.put('/api/user/', { ...updates, uid: user.uid })
    const updatedUser = { ...user, ...updates }
    persist(updatedUser)
  }

  return (
    <UserContext.Provider
      value={{ user, signIn, signUp, signInWithGoogle, signInWithGithub, signOut, updateUser }}
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
