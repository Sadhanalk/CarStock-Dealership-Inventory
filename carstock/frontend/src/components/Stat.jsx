export default function Stat({ label, value, accent = false }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white/40 px-4 py-4 sm:px-5">
      <p className="eyebrow">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${accent ? 'text-rust' : ''}`}>{value}</p>
    </div>
  )
}
