import { CarFront, LogOut } from 'lucide-react'
import Brand from './Brand'

/** Page chrome: sidebar on desktop, compact header on mobile. */
export default function AppShell({ user, onSignOut, children }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/10 bg-paper/90 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <Brand compact />
          <button onClick={onSignOut} className="icon-button" aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 flex-col justify-between border-r border-ink/10 px-8 py-9 md:flex">
          <div>
            <Brand />
            <div className="mt-16">
              <p className="eyebrow">Workspace</p>
              <div className="mt-4 rounded-xl bg-ink px-4 py-3 text-paper">
                <div className="flex items-center gap-3">
                  <CarFront size={19} className="text-amber" />
                  <span className="text-sm font-semibold">Inventory floor</span>
                </div>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">Live stock control</span>
              </div>
            </div>
          </div>
          <div className="border-t border-ink/10 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber font-mono text-xs font-bold">{user.full_name.slice(0, 2).toUpperCase()}</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.full_name}</p>
                <p className="truncate text-xs text-ink/50">{user.is_admin ? 'Administrator' : user.email}</p>
              </div>
            </div>
            <button onClick={onSignOut} className="mt-4 flex items-center gap-2 text-xs font-semibold text-ink/55 transition hover:text-rust">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </aside>
        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
