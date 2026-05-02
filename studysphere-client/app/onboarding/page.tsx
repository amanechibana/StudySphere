"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../stores/authStore";
import useUserStore from "../stores/userStore";
import { useCreateUser } from "../hooks/useUser";
import { User } from "../api/user";
import { usernameSchema } from "../validation/authSchema";

export default function OnboardingPage() {
  const { user: firebaseUser, initialized } = useAuthStore();
  const { user: appUser, setUser } = useUserStore();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const {
    mutate: createUser,
    isPending,
    error: mutationError,
  } = useCreateUser();

  useEffect(() => {
    if (!initialized) return;
    if (!firebaseUser) {
      router.push("/login");
    } else if (appUser) {
      router.push("/rooms");
    }
  }, [firebaseUser, initialized, router, appUser]);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);

    const trimmed = usernameSchema.safeParse(username);
    if (!trimmed.success) {
      setValidationError(trimmed.error.issues[0].message);
      return;
    }

    createUser(
      {
        firebaseUid: firebaseUser!.uid,
        username: trimmed.data,
        email: firebaseUser!.email || undefined,
      },
      {
        onSuccess: (createdUser: User) => {
          setUser(createdUser);
          router.push("/rooms");
        },
        onError: (err) => {
          console.error("Failed to create user: ", err);
          if (err.message.startsWith("409"))
            setValidationError("Username already taken");
          else setValidationError("Something went wrong, please try again");
        },
      },
    );
  }

  const error =
    validationError ??
    (mutationError ? "Something went wrong, please try again" : null);

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
                  setValidationError(null);
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
              disabled={isPending}
              className="mt-2 bg-espresso text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-espresso-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Setting up..." : "Let's go"}
            </button>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
