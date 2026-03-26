"use client"

import { useEffect } from "react";
import useAuthStore from "../stores/authStore";
import useUserStore from "../stores/userStore";

export default function AuthInit() {
  const { init, setUser } = useAuthStore();
  const { clearUser } = useUserStore();

  useEffect(() => {
    // registers callbacks that will be used to update the user store and returns unsubscribe cleanup function
    const unsubscribe = init({
      onLogin: async (authenticatedUser) => {
        try {
          const res = await fetch(`/api/users/${authenticatedUser.uid}`, {
            headers: {
              Authorization: `Bearer ${await authenticatedUser.getIdToken()}`,
            },
          });
          const appUser = await res.json();
          setUser(appUser);
        } catch (err) {
            console.error("Failed to find app user: ", err);
            // TODO
        }
      },
      onLogout: () => {
        clearUser();
      },
    });

    return unsubscribe;
  }, [init, clearUser, setUser]);

  return null;
}
