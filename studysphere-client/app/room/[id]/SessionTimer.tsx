export default function SessionTimer({
  h,
  m,
  s,
  minimized = false,
}: {
  h: string;
  m: string;
  s: string;
  minimized?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between bg-espresso rounded-2xl shrink-0 gap-3 ${
        minimized ? "px-4 py-3" : "px-6 py-4"
      }`}
    >
      <div className="min-w-0">
        <p
          className={`font-semibold tracking-[0.25em] text-caramel/70 uppercase ${
            minimized ? "text-[9px] mb-1" : "text-[10px] mb-2"
          }`}
        >
          Session timer
        </p>
        <div
          className={`flex items-baseline gap-1 font-serif text-surface-card font-light tracking-wide ${
            minimized ? "text-xl" : "text-3xl"
          }`}
        >
          <span className="timer-digit">{h}</span>
          <span
            className={`breathe text-caramel mx-1 ${minimized ? "text-base" : "text-xl"}`}
          >
            :
          </span>
          <span className="timer-digit">{m}</span>
          <span
            className={`breathe text-caramel mx-1 ${minimized ? "text-base" : "text-xl"}`}
          >
            :
          </span>
          <span className="timer-digit">{s}</span>
        </div>
      </div>
      {!minimized && (
        <div className="flex items-center gap-2 bg-surface-card/10 rounded-full px-3 py-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs text-surface-card/70 font-medium">
            In session
          </span>
        </div>
      )}
      {minimized && (
        <span className="relative flex h-2 w-2 shrink-0" title="In session">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )}
    </div>
  );
}
