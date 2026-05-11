import Link from "next/link";
import useAuthStore from "../stores/authStore";

interface NavbarProps {
  backHref?: string;
  roomName?: string;
  roomSubtitle?: string;
}

export default function Navbar({
  backHref,
  roomName,
  roomSubtitle,
}: NavbarProps) {
  const { user, logout, initialized } = useAuthStore();

  async function handleLogout() {
    await logout();
  }

  return (
    <nav className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
      {/* Left: back button or logo */}
      <div className="flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="border border-border rounded-lg px-3 py-1.5 text-sm text-espresso hover:bg-border/40 transition-colors"
          >
            ← Back
          </Link>
        )}
        {roomName ? (
          <div>
            <h1 className="font-semibold text-espresso leading-tight">
              {roomName}
            </h1>
            {roomSubtitle && (
              <p className="text-xs text-caramel">{roomSubtitle}</p>
            )}
          </div>
        ) : (
          <Link href="/" className="flex items-center gap-1.5 select-none">
            <span className="text-xl">☕</span>
            <span className="font-bold text-espresso text-lg tracking-tight">
              Study
            </span>
            <span className="font-serif italic text-caramel text-lg">
              Sphere
            </span>
          </Link>
        )}
      </div>

      {/* <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 border border-border rounded-full px-3 py-1.5 text-sm text-espresso-muted bg-surface-card">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>{fetch this from redis} studying now</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-caramel flex items-center justify-center text-white text-sm font-semibold cursor-pointer">
          {user.username}
        </div>
      </div> */}
      {!initialized ? null : user ? (
        <div className="flex items-center gap-3">
          <Link
            href="/rooms"
            className="text-sm font-medium text-espresso-muted hover:text-espresso transition-colors"
          >
            Rooms
          </Link>
          <Link
            href="/rooms/archived"
            className="text-sm font-medium text-espresso-muted hover:text-espresso transition-colors"
          >
            Archive
          </Link>
          <button
            className="shrink-0 bg-espresso text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-espresso-muted transition-colors cursor-pointer"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="shrink-0 bg-espresso text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-espresso-muted transition-colors cursor-pointer"
        >
          Sign in
        </Link>
      )}
    </nav>
  );
}
