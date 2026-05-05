"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { firebaseCreateUserWithEmailAndPassword } from "../firebase/firebaseMethods";
import { signupSchema } from "../validation/authSchema";
import { useRouter } from "next/navigation";
import useAuthStore from "../stores/authStore";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user: firebaseUser, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized && firebaseUser) {
      router.push("/rooms");
    }
  }, [firebaseUser, initialized, router]);

  async function handleSignup(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const res = signupSchema.safeParse({ email, password, confirmPassword });
    if (!res.success) {
      setError(res.error.issues[0].message);
      return;
    }

    //sign up with firebase first, then try mongo and rollback if it fails
    try {
      await firebaseCreateUserWithEmailAndPassword(email, password);

      router.push("/onboarding");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      console.error("Error signing up:", err);
      setError(errorMessage);
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
            Create an account
          </h2>
          <p className="text-sm text-caramel italic mb-6">
            Your study rooms are waiting.
          </p>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {/* Converting to onboarding type of app 
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
                onChange={(e) => setUsername(e.target.value)}
                placeholder="scholar42"
                className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-espresso placeholder:text-border outline-none focus:border-caramel transition-colors"
              />
            </div> */}

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
                value={email}
                onChange={(e) => {
                  setError(null);
                  setEmail(e.target.value);
                }}
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setError(null);
                  setPassword(e.target.value);
                }}
                placeholder="••••••••"
                className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-espresso placeholder:text-border outline-none focus:border-caramel transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-medium text-espresso-muted"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setError(null);
                  setConfirmPassword(e.target.value);
                }}
                placeholder="••••••••"
                className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-espresso placeholder:text-border outline-none focus:border-caramel transition-colors"
              />
            </div>

            <button
              type="submit"
              className="mt-2 bg-espresso text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-espresso-muted transition-colors cursor-pointer"
            >
              Create account
            </button>

            {error && <p className="text-red-500">{error}</p>}
          </form>
        </div>

        <p className="text-center text-sm text-espresso-muted mt-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-caramel hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
