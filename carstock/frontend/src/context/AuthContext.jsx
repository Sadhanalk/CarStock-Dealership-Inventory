import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { SESSION_EXPIRED_EVENT, authApi, session } from '../api/client'

const AuthContext = createContext(null)

/** Holds the logged-in user and exposes login / register / logout. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => session.load())
  const [sessionExpired, setSessionExpired] = useState(false)

  // The API client fires this event when a protected request comes back 401.
  useEffect(() => {
    const onExpired = () => {
      setUser(null)
      setSessionExpired(true)
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [])

  const value = useMemo(() => {
    const finish = (result) => {
      session.save(result)
      setSessionExpired(false)
      setUser(result.user)
      return result.user
    }
    return {
      user,
      isAdmin: Boolean(user?.is_admin),
      sessionExpired,
      login: async (email, password) => finish(await authApi.login(email, password)),
      register: async (fullName, email, password) => finish(await authApi.register(fullName, email, password)),
      logout: () => {
        session.clear()
        setUser(null)
      }
    }
  }, [user, sessionExpired])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
