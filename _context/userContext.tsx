"use client"

import { api } from "@/_lib/api"
import type React from "react"
import { createContext, useContext, useCallback, useEffect, useState } from "react"
import { User } from '@/_lib/types/user'
import {
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithGithub as firebaseSignInWithGithub,
  signInWithEmailPassword as firebaseSignInWithEmailPassword,
  createUserWithEmailPassword as firebaseCreateUserWithEmailPassword,
  firebaseSignOut,
  onFirebaseAuthStateChanged,
} from "@/_lib/firebase/auth"
import type { RegisterFormData } from "@/_lib/forms"

type UserContextType = {
  user: User | null
  isAuthReady: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (form: RegisterFormData) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => void
  updateUser: (updates: Partial<User>) => Promise<void>
  updateUserLocal: (updates: Partial<User>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// ── Synchronous initialization before any component renders ──
if (typeof window !== "undefined") {
  const savedToken = localStorage.getItem("idToken")
  if (savedToken) {
    api.setToken(savedToken)
  }
}

function persist(u: User) {
  localStorage.setItem("user", JSON.stringify(u))
}

function persistToken(token: string) {
  localStorage.setItem("idToken", token)
  api.setToken(token)
}

function clearPersisted() {
  localStorage.removeItem("user")
  localStorage.removeItem("idToken")
  api.setToken(null)
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null
    try {
      const saved = localStorage.getItem("user")
      return saved ? JSON.parse(saved) : null
    } catch {
      localStorage.removeItem("user")
      return null
    }
  })

  const [isAuthReady, setIsAuthReady] = useState(false)

  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const freshToken = await firebaseUser.getIdToken()
          persistToken(freshToken)
        } catch {
          clearPersisted()
          setUser(null)
        }
      }
      setIsAuthReady(true)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { idToken } = await firebaseSignInWithEmailPassword(email, password)
    persistToken(idToken)
    const user = await api.post<User>('/api/user/auth/oauth', { idToken })
    persist(user)
    setUser(user)
  }

  const signUp = async (form: RegisterFormData) => {
    const { idToken } = await firebaseCreateUserWithEmailPassword(form.email, form.password)
    persistToken(idToken)
    const user = await api.post<User>('/api/user/auth/oauth', { idToken, displayName: form.username })
    persist(user)
    setUser(user)
  }

  const signInWithGoogle = async () => {
    const { idToken, displayName, photoURL } = await firebaseSignInWithGoogle()
    persistToken(idToken)
    const user = await api.post<User>('/api/user/auth/oauth', { idToken, displayName, photoURL })
    persist(user)
    setUser(user)
  }

  const signInWithGithub = async () => {
    const { idToken, displayName, photoURL } = await firebaseSignInWithGithub()
    persistToken(idToken)
    const user = await api.post<User>('/api/user/auth/oauth', { idToken, displayName, photoURL })
    persist(user)
    setUser(user)
  }

  const signOut = useCallback(async () => {
    await firebaseSignOut().catch((err) => console.error("Sign out error:", err))
    setUser(null)
    clearPersisted()
  }, [])

  // Wire up API 401 interceptor — automatic logout on session expiry
  useEffect(() => {
    api.setOnAuthExpired(signOut)
    return () => api.setOnAuthExpired(null)
  }, [signOut])

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return
    await api.put('/api/user/', { ...updates, uid: user.uid })
    const updatedUser = { ...user, ...updates }
    persist(updatedUser)
    setUser(updatedUser)
  }

  const updateUserLocal = (updates: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...updates }
    persist(updatedUser)
    setUser(updatedUser)
  }

  return (
    <UserContext.Provider
      value={{ user, isAuthReady, signIn, signUp, signInWithGoogle, signInWithGithub, signOut, updateUser, updateUserLocal }}
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
