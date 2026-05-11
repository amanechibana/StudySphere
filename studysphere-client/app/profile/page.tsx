"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../stores/authStore";
import useUserStore from "../stores/userStore";
import { useUpdateMe } from "../hooks/useUser";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const { user: firebaseUser, initialized } = useAuthStore();
  const { user: appUser, setUser } = useUserStore();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { mutate: updateMe, isPending } = useUpdateMe();

  useEffect(() => {
    if (!initialized) return;
    if (!firebaseUser) {
      router.push("/login");
    }
  }, [firebaseUser, initialized, router]);

  useEffect(() => {
    if (appUser) {
      setDisplayName(appUser.displayName ?? "");
      setBio(appUser.bio ?? "");
    }
  }, [appUser]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    updateMe(
      {
        displayName: displayName.trim() === "" ? null : displayName.trim(),
        bio: bio.trim() === "" ? null : bio.trim(),
      },
      {
        onSuccess: (updated) => {
          setUser(updated);
          setSaved(true);
        },
        onError: (err) => {
          console.error("Failed to update profile: ", err);
          setError("Something went wrong, please try again");
        },
      },
    );
  }

  if (!initialized || !appUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-espresso-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar backHref="/rooms" />
      <main className="px-4 py-8 flex justify-center">
        <div className="w-full max-w-xl">
          <h1 className="text-2xl font-semibold text-espresso mb-1">Profile</h1>
          <p className="text-sm text-caramel italic mb-6">
            How others see you in StudySphere.
          </p>

          <div className="bg-surface-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-caramel flex items-center justify-center text-white text-lg font-semibold">
                {(appUser.displayName ?? appUser.username).slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-espresso">
                  {appUser.displayName ?? appUser.username}
                </p>
                <p className="text-xs text-espresso-muted">@{appUser.username}</p>
                {appUser.email && (
                  <p className="text-xs text-espresso-muted">{appUser.email}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium text-espresso-muted"
                  htmlFor="displayName"
                >
                  Display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  maxLength={50}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="What should we call you?"
                  className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-espresso placeholder:text-border outline-none focus:border-caramel transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium text-espresso-muted"
                  htmlFor="bio"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  maxLength={500}
                  rows={4}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short note about you."
                  className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-espresso placeholder:text-border outline-none focus:border-caramel transition-colors resize-none"
                />
                <p className="text-xs text-espresso-muted">
                  {bio.length}/500
                </p>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="mt-2 bg-espresso text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-espresso-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Saving..." : "Save"}
              </button>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {saved && (
                <p className="text-emerald-600 text-sm">Profile updated.</p>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
