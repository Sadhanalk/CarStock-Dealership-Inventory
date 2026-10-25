import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import Brand from '../components/Brand'
import { useAuth } from '../context/AuthContext'

const DEMO_ADMIN = 'admin@carstock.com / AdminPass123!'

/** Login and registration share one screen; `mode` switches the form. */
export default function AuthScreen() {
  const { login, register, sessionExpired } = useAuth()
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isLogin = mode === 'login'

  const submit = async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget).entries())
    setBusy(true)
    setError('')
    try {
      if (isLogin) await login(data.email, data.password)
      else await register(data.full_name, data.email, data.password)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5 py-10 text-paper">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-paper text-ink shadow-2xl lg:grid-cols-[1fr_0.9fr]">
        <div className="relative hidden min-h-[620px] overflow-hidden bg-amber p-10 lg:block">
          <div className="absolute -right-16 -top-12 h-72 w-72 rounded-full border-[48px] border-ink/10" />
          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full border-[70px] border-ink/10" />
          <Brand />
          <div className="absolute bottom-12 left-10 max-w-sm">
            <p className="eyebrow">CarStock / Control room</p>
            <h1 className="mt-4 text-5xl font-bold leading-[0.98] tracking-[-0.06em]">Keep the line moving.</h1>
            <p className="mt-5 text-sm leading-6 text-ink/65">One clear place for the metal on your floor, the people moving it, and the next decision.</p>
          </div>
        </div>

        <div className="p-7 sm:p-12">
          <Brand compact />
          <div className="mt-16">
            <p className="eyebrow">{isLogin ? 'Operator login' : 'New operator'}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">{isLogin ? 'Back to the floor.' : 'Open your station.'}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/55">{isLogin ? 'Sign in to see live stock and make the next move.' : 'Create an operator account to browse and reserve vehicles.'}</p>

            {sessionExpired && isLogin && (
              <p role="status" className="mt-4 rounded-lg bg-amber/20 px-3 py-2 text-xs font-semibold">
                Your session expired. Please sign in again.
              </p>
            )}

            <form className="mt-8 space-y-4" onSubmit={submit}>
              {!isLogin && (
                <label className="block">
                  <span className="label">Full name</span>
                  <input className="field mt-2" name="full_name" required minLength="2" placeholder="Avery Stone" autoComplete="name" />
                </label>
              )}
              <label className="block">
                <span className="label">Email address</span>
                <input className="field mt-2" name="email" type="email" required placeholder="you@dealership.com" autoComplete="email" />
              </label>
              <label className="block">
                <span className="label">Password</span>
                <input className="field mt-2" name="password" type="password" required minLength="8" placeholder="8+ characters, with a letter and a number" autoComplete={isLogin ? 'current-password' : 'new-password'} />
              </label>
              {error && (
                <p role="alert" className="rounded-lg bg-rust/10 px-3 py-2 text-sm font-medium text-rust">
                  {error}
                </p>
              )}
              <button className="button-primary mt-3 w-full" type="submit" disabled={busy}>
                {busy ? 'One moment…' : isLogin ? 'Enter inventory' : 'Create account'} <ArrowUpRight size={16} />
              </button>
            </form>

            <button
              onClick={() => {
                setMode(isLogin ? 'register' : 'login')
                setError('')
              }}
              className="mt-7 w-full text-center text-xs font-semibold text-ink/55 hover:text-ink"
            >
              {isLogin ? 'Need an operator account? Register' : 'Already have access? Sign in'}
            </button>
            <p className="mt-10 border-t border-ink/10 pt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-ink/35">Demo admin: {DEMO_ADMIN}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
