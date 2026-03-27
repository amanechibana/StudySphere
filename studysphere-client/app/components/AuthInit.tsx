"use client";

import { useEffect } from "react";
import useAuthStore from "../stores/authStore";
import useUserStore from "../stores/userStore";
import { useRouter } from "next/navigation";

export default function AuthInit() {
  const { init, setUser, initialized } = useAuthStore();
  const { clearUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // registers callbacks that will be used to update the user store and returns unsubscribe cleanup function
    const unsubscribe = init({
      onLogin: async (authenticatedUser) => {
        console.log("redirecting user to home");
        router.push("/")
        // try {
        //   const res = await fetch(`/api/users/${authenticatedUser.uid}`, {
        //     headers: {
        //       Authorization: `Bearer ${await authenticatedUser.getIdToken()}`,
        //     },
        //   });
        //   const appUser = await res.json();
        //   setUser(appUser);
        // } catch (err) {
        //     console.error("Failed to find app user: ", err);
        //     // TODO
        // }
      },
      onLogout: () => {
        console.log("user logging out")
        clearUser();

        const isInitialized = useAuthStore.getState().initialized;
        if (isInitialized) {
          router.push('/login');
        }
      },
    });

    return unsubscribe;
  }, []);

  return null;
}
