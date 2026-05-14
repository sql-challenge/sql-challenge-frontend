"use client"

import { api } from "@/_lib/api"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { User, UserSignUpForm } from '@/_lib/types/user'
import {
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithGithub as firebaseSignInWithGithub,
  signInWithEmailPassword as firebaseSignInWithEmailPassword,
  firebaseSignOut,
  onFirebaseAuthStateChanged,
} from "@/_lib/firebase/auth"

type UserContextType = {
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (form: UserSignUpForm) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => void
  updateUser: (updates: Partial<User>) => Promise<void>
  updateUserLocal: (updates: Partial<User>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

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
  const [user, setUser] = useState<User | null>(null)

  // On mount: restore session from Firebase auth + localStorage
  useEffect(() => {
    // Restore token immediately so API calls work before Firebase auth fires
    const savedToken = localStorage.getItem("idToken")
    if (savedToken) {
      api.setToken(savedToken)
    }

    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("user")
      }
    }

    // Subscribe to Firebase auth state — keeps token fresh across page reloads
    const unsubscribe = onFirebaseAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const freshToken = await firebaseUser.getIdToken()
          persistToken(freshToken)
        } catch {
          // Token refresh failed — probably signed out
          clearPersisted()
          setUser(null)
        }
      }
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

  const signUp = async (form: UserSignUpForm) => {
    const user = await api.post<User>('/api/user/', form)
    const { idToken } = await firebaseSignInWithEmailPassword(form.email, form.password)
    persistToken(idToken)
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

  const signOut = async () => {
    await firebaseSignOut().catch((err) => console.error("Sign out error:", err))
    setUser(null)
    clearPersisted()
  }

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
      value={{ user, signIn, signUp, signInWithGoogle, signInWithGithub, signOut, updateUser, updateUserLocal }}
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
