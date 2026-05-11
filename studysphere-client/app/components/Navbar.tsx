import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRooms } from "../hooks/useRoom";
import useAuthStore from "../stores/authStore";
import { ArrowLeft } from "lucide-react";
import useUserStore from "../stores/userStore";

interface NavbarProps {
  backHref?: string;
  roomName?: string;
  roomSubtitle?: string;
}

import { Coffee } from "lucide-react";

export default function Navbar({
  backHref,
  roomName,
  roomSubtitle,
}: NavbarProps) {
  const { user, logout, initialized } = useAuthStore();
  const { user: appUser } = useUserStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: rooms = [] } = useRooms(!!appUser);

  const createdRooms = useMemo(
    () => rooms.filter((room) => room.ownerId === appUser?._id),
    [appUser?._id, rooms],
  );

  const profileName = appUser?.displayName ?? appUser?.username ?? "Profile";
  const profileInitial = profileName.slice(0, 1).toUpperCase();

  async function handleLogout() {
    setIsProfileOpen(false);
    await logout();
  }

  useEffect(() => {
    if (!isProfileOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isProfileOpen]);

  return (
    <nav className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
      {/* Left: back button or logo */}
      <div className="flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="border border-border rounded-lg px-3 py-1.5 text-sm text-espresso hover:bg-border/40 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back
            </div>
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
            <span>
              <Coffee className="w-6 h-6 text-caramel" />
            </span>
            <span className="font-bold text-espresso text-lg tracking-tight">
              Study
            </span>
            <span className="font-serif italic text-caramel text-lg">
              Sphere
            </span>
          </Link>
        )}
      </div>

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
        <div className="relative flex items-center gap-3" ref={dropdownRef}>
          {appUser && (
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-caramel flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
              title={profileName}
              aria-label="Open profile menu"
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
              onClick={() => setIsProfileOpen((open) => !open)}
            >
              {profileInitial}
            </button>
          )}

          {appUser && isProfileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-lg border border-border bg-surface-card shadow-lg"
            >
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-semibold text-espresso">
                  {profileName}
                </p>
                <p className="truncate text-xs text-espresso-muted">
                  @{appUser.username}
                </p>
              </div>

              <div className="border-b border-border py-2">
                <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-widest text-espresso-muted">
                  Rooms you created
                </p>
                {createdRooms.length > 0 ? (
                  createdRooms.map((room) => (
                    <Link
                      key={room._id}
                      href={`/room/${room._id}`}
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-espresso transition-colors hover:bg-background"
                    >
                      <span className="block truncate font-medium">
                        {room.name}
                      </span>
                      <span className="block truncate text-xs text-espresso-muted">
                        {room.course}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-2 text-sm italic text-espresso-muted">
                    No rooms yet.
                  </p>
                )}
              </div>

              <div className="py-2">
                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setIsProfileOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-espresso transition-colors hover:bg-background"
                >
                  Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-4 py-2 text-left text-sm font-medium text-espresso transition-colors hover:bg-background cursor-pointer"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
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
