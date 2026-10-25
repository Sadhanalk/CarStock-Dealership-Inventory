import { AuthProvider, useAuth } from './context/AuthContext'
import AuthScreen from './pages/AuthScreen'
import Dashboard from './pages/Dashboard'

/** Logged out -> auth screen; logged in -> dashboard. */
function Screen() {
  const { user } = useAuth()
  return user ? <Dashboard /> : <AuthScreen />
}

export function App() {
  return (
    <AuthProvider>
      <Screen />
    </AuthProvider>
  )
}

export default App
