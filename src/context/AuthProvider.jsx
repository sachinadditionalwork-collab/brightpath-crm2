import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContext'
import { authService } from '../services/authService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    // Initialize session check
    authService.getSession().then(({ session, profile }) => {
      if (isMounted) {
        setUser(session?.user || null)
        setProfile(profile || null)
        setIsLoading(false)
      }
    }).catch((err) => {
      if (isMounted) {
        setError(err.message)
        setIsLoading(false)
      }
    })

    // Listen to real-time auth changes
    const subscription = authService.onAuthStateChange((_event, session, profile) => {
      if (isMounted) {
        setUser(session?.user || null)
        setProfile(profile || null)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      if (subscription?.unsubscribe) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signIn = async (email, password) => {
    setError(null)
    const result = await authService.signIn(email, password)
    if (result.error) {
      setError(result.error.message)
      return { success: false, error: result.error.message }
    }
    setUser(result.user)
    setProfile(result.profile)
    return { success: true }
  }

  const signUp = async (email, password, fullName) => {
    setError(null)
    const result = await authService.signUp(email, password, fullName)
    if (result.error) {
      setError(result.error.message)
      return { success: false, error: result.error.message }
    }
    setUser(result.user)
    setProfile(result.profile)
    return { success: true }
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
    setProfile(null)
  }

  const switchPersona = (email) => {
    const demoUser = authService.switchDemoPersona(email)
    if (demoUser) {
      setUser({ id: demoUser.id, email: demoUser.email })
      setProfile(demoUser)
    }
  }

  const value = {
    user,
    profile,
    isLoading,
    error,
    isAdmin: profile?.role === 'admin',
    isManager: profile?.role === 'manager',
    isCounsellor: profile?.role === 'counsellor',
    signIn,
    signUp,
    signOut,
    switchPersona,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
