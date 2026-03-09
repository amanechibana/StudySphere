import Link from "next/link";
import useUserStore from "../stores/userStore";
import { ROOMS } from "../dummyData/dummyRooms";

interface NavbarProps {
  backHref?: string;
  roomName?: string;
  roomSubtitle?: string;
}

const dummyRoom = ROOMS[0];

export default function Navbar({
  backHref,
  roomName,
  roomSubtitle,
}: NavbarProps) {
  const { user } = useUserStore();

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

      {/* Right: online count + avatar */}
      {/* <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 border border-border rounded-full px-3 py-1.5 text-sm text-espresso-muted bg-surface-card">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>{fetch this from redis} studying now</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-caramel flex items-center justify-center text-white text-sm font-semibold cursor-pointer">
          {user.username}
        </div>
      </div> */}
    </nav>
  );
}
