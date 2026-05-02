export default function SessionTimer({ h, m, s }: { h: string; m: string; s: string }) {
  return (
    <div className="flex items-center justify-between bg-espresso rounded-2xl px-6 py-4 shrink-0">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.25em] text-caramel/70 uppercase mb-2">
          Session timer
        </p>
        <div className="flex items-baseline gap-1 font-serif text-3xl text-surface-card font-light tracking-wide">
          <span className="timer-digit">{h}</span>
          <span className="breathe text-caramel text-xl mx-1">:</span>
          <span className="timer-digit">{m}</span>
          <span className="breathe text-caramel text-xl mx-1">:</span>
          <span className="timer-digit">{s}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-surface-card/10 rounded-full px-3 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs text-surface-card/70 font-medium">In session</span>
      </div>
    </div>
  );
}
