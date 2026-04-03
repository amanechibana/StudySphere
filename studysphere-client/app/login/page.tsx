"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useAuthStore from "../stores/authStore";
import useUserStore from "../stores/userStore";
import {
  firebaseGoogleSignIn,
  firebaseSignInWithEmailAndPassword,
} from "../firebase/firebaseMethods";
import { useRouter } from "next/navigation";
import SocialSignIn from "../components/SocialSignIn";

export default function LoginPage() {
  const { user, initialized } = useAuthStore();
  const { user: appUser } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (initialized && user && appUser) {
      router.push("/");
    } else if (initialized && user && !appUser) {
      router.push("/onboarding");
    }
  }, [appUser, initialized, router, user]);

  async function handleLogin(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    // authenticate using Firebase
    try {
      await firebaseSignInWithEmailAndPassword(email, password);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      console.error("Error signing in:", err);
      setError(errorMessage);
    }
  }

  async function googleSignin() {
    try {
      await firebaseGoogleSignIn();
    } catch (err) {
      console.error("Error signing in with Google: ", err);
      setError("Error signing in with Google");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          <span className="text-2xl">☕</span>
          <span className="font-bold text-espresso text-xl tracking-tight">
            Study
          </span>
          <span className="font-serif italic text-caramel text-xl">Sphere</span>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-espresso mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-caramel italic mb-6">
            Sign in to your study space.
          </p>

          <SocialSignIn googleSignIn={googleSignin} />

          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-medium text-espresso-muted"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="example@email.com"
                className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-espresso placeholder:text-border outline-none focus:border-caramel transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-medium text-espresso-muted"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-espresso placeholder:text-border outline-none focus:border-caramel transition-colors"
              />
            </div>

            <button
              type="submit"
              className="mt-2 bg-espresso text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-espresso-muted transition-colors cursor-pointer"
            >
              Sign in
            </button>

            {error && <p className="text-red-500">{error}</p>}
          </form>
        </div>

        <p className="text-center text-sm text-espresso-muted mt-4">
          New here?{" "}
          <Link
            href="/signup"
            className="text-caramel hover:underline font-medium"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
