export default function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center border-l-4 border-amber bg-ink font-mono text-xs font-bold tracking-tighter text-paper">CS//</div>
      {!compact && (
        <div>
          <p className="font-mono text-sm font-bold tracking-[-0.12em]">CARSTOCK</p>
          <p className="eyebrow mt-0.5">Inventory control</p>
        </div>
      )}
    </div>
  )
}
