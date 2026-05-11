import Link from "next/link";

const TEAM = ["Aidan", "Amane", "Barnatt", "Jimmy", "Takekuni"];

export default function Footer() {
  return (
    <footer className="bg-espresso text-surface-card">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div>
          <Link href="/" className="flex items-center gap-1.5 select-none mb-2">
            <span className="text-lg">☕</span>
            <span className="font-bold text-surface-card text-base tracking-tight">
              Study
            </span>
            <span className="font-serif italic text-caramel text-base">
              Sphere
            </span>
          </Link>
          <p className="text-xs text-surface-card/70 leading-relaxed max-w-xs">
            Find your focus. Drop into a study room, share a canvas, and keep
            each other accountable.
          </p>
        </div>

        <div className="md:text-right">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-caramel uppercase mb-2">
            About
          </p>
          <p className="text-xs text-surface-card/70 mb-1">
            A CS 554 project at Stevens Institute of Technology.
          </p>
          <p className="text-xs text-surface-card/90">
            Built by{" "}
            <span className="text-caramel font-medium">{TEAM.join(", ")}</span>.
          </p>
        </div>
      </div>

      <div className="border-t border-surface-card/10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between text-[11px] text-surface-card/60">
          <p>© {new Date().getFullYear()} StudySphere</p>
          <p className="italic font-serif text-caramel/80">Brewed with care.</p>
        </div>
      </div>
    </footer>
  );
}
