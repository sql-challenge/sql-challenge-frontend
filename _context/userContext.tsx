"use client"

// ── Context Architecture Notes ──────────────────────────────
// AuthContext  → uid, isAuthReady, auth methods (signIn/signOut)
//   Re-renders when: auth state changes (login/logout/token refresh)
//   Consumers: ProtectedRoute, UserMenu, auth pages
//
// UserDataContext → user (full profile), updateUser, updateUserLocal
//   Re-renders when: profile data changes (XP, username, progress, etc.)
//   Consumers: all page components, FriendNotificationBell, Header
//
// WHY SPLIT? When updateUserLocal is called (e.g., after chapter completion
// or token validation), only UserDataContext consumers re-render.
// AuthContext consumers like ProtectedRoute do NOT re-render, preventing
// cascading re-renders of the entire page tree.
//
// To debug re-renders in React DevTools Profiler:
//   1. Open Profiler → click "Record" → interact with the app
//   2. Look for components re-rendering without prop/state changes
//   3. Add to any component for tracing:
//      useEffect(() => { console.log('<ComponentName> rendered') });
// ────────────────────────────────────────────────────────────

import { api } from "@/_lib/api"
import type React from "react"
import { createContext, useContext, useCallback, useEffect, useState, useMemo } from "react"
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

// ── Auth context (uid + auth methods only, no user profile) ──
type AuthContextType = {
  uid: string | null
  isAuthReady: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (form: RegisterFormData) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── User data context (profile + XP + progress) ──
type UserContextType = {
  user: User | null
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

  // Derive uid synchronously from user state (avoids extra state)
  const uid = user?.uid ?? null

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

  const authValue = useMemo(() => ({
    uid,
    isAuthReady,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    signOut,
  }), [uid, isAuthReady, signIn, signUp, signInWithGoogle, signInWithGithub, signOut])

  const userValue = useMemo(() => ({
    user,
    updateUser,
    updateUserLocal,
  }), [user, updateUser, updateUserLocal])

  return (
    <AuthContext.Provider value={authValue}>
      <UserContext.Provider value={userValue}>
        {children}
      </UserContext.Provider>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within a UserProvider")
  }
  return context
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
