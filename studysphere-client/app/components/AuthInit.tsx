"use client";

import { useEffect } from "react";
import useAuthStore from "../stores/authStore";
import useUserStore from "../stores/userStore";
import { useRouter } from "next/navigation";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseSetup";

export default function AuthInit() {
  const { user: firebaseUser, init, setUser, initialized } = useAuthStore();
  const { user: appUser, clearUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // registers callbacks that will be used to update the user store and returns unsubscribe cleanup function
    const unsubscribe = init({
      onLogin: async (authenticatedUser) => {
        console.log("[Auth Init] Fetching user data");
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/firebase/${authenticatedUser.uid}`,
            {
              headers: {
                Authorization: `Bearer ${await authenticatedUser.getIdToken()}`,
              },
            },
          );

          if (res.ok) {
            const appUser = await res.json();
            setUser(appUser);
            router.push("/");
          } else if (res.status === 404) {
            router.push("/onboarding");
          }
        } catch (err) {
          console.error("Failed to find app user: ", err);
        }
      },
      onLogout: () => {
        console.log("user logging out");
        clearUser();

        const isInitialized = useAuthStore.getState().initialized;
        if (isInitialized) {
          router.push("/login");
        }
      },
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        console.log(user)
        const token = await user.getIdToken();
        document.cookie = `firebaseToken=${token}; path=/; SameSite=strict`;
      } else {
        document.cookie = `firebaseToken=; path=/; SameSite=strict; max-age=0`;
      }
    });

    return unsubscribe;
  }, []);

  return null;
}
