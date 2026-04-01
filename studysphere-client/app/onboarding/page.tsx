"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../stores/authStore";
import useUserStore from "../stores/userStore";

export default function OnboardingPage() {
  const { user: firebaseUser, initialized } = useAuthStore();
  const { user: appUser, setUser } = useUserStore();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!firebaseUser) {
      router.push("/login");
    } else if (appUser) {
      router.push("/");
    }
  }, [firebaseUser, initialized, router, appUser]);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      setError("Username must be between 3 and 20 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: firebaseUser!.uid,
          username: trimmed,
          email: firebaseUser!.email,
        }),
      });

      if (res.ok) {
        const newUser = await res.json();
        setUser(newUser);
        router.push("/");
      } else if (res.status === 409) {
        setError("Username already taken");
      } else {
        setError("Something went wrong, please try again");
      }
    } catch (err) {
      console.error("Failed to create user:", err);
      setError("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-1.5 mb-8">
          <span className="text-2xl">☕</span>
          <span className="font-bold text-espresso text-xl tracking-tight">
            Study
          </span>
          <span className="font-serif italic text-caramel text-xl">Sphere</span>
        </div>

        <div className="bg-surface-card border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-espresso mb-1">
            One last step
          </h2>
          <p className="text-sm text-caramel italic mb-6">
            Pick a username to get started.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-medium text-espresso-muted"
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => {
                  setError(null);
                  setUsername(e.target.value);
                }}
                placeholder="scholar42"
                className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-espresso placeholder:text-border outline-none focus:border-caramel transition-colors"
              />
              <p className="text-xs text-espresso-muted">
                3–20 characters. Letters, numbers, and underscores only.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-espresso text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-espresso-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Setting up..." : "Let's go"}
            </button>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
