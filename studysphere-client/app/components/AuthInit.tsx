"use client";

import { useEffect, useRef } from "react";
import useAuthStore from "../stores/authStore";
import useUserStore from "../stores/userStore";
import { usePathname, useRouter } from "next/navigation";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseSetup";
import { userApi } from "../api/user";

export default function AuthInit() {
  const { init, initialized } = useAuthStore();
  const { clearUser, setUser: setAppUser, setFetchError } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  const isProtectedPath =
    pathname === "/rooms" ||
    pathname.startsWith("/rooms/") ||
    pathname.startsWith("/room/") ||
    pathname === "/onboarding";

  const isProtectedPathRef = useRef(isProtectedPath);
  isProtectedPathRef.current = isProtectedPath;

  useEffect(() => {
    const unsubscribe = init({
      onLogin: async () => {
        console.log("[Auth Init] Fetching user data");
        try {
          const appUserData = await userApi.getMe();
          setAppUser(appUserData);
        } catch (err) {
          const message = err instanceof Error ? err.message : "";
          if (message.startsWith("404")) {
            router.push("/onboarding");
          } else {
            console.error("Failed to find app user: ", err);
            setFetchError(true);
          }
        }
      },
      onLogout: () => {
        console.log("user logging out");
        clearUser();

        const isInitialized = useAuthStore.getState().initialized;
        if (isInitialized && isProtectedPathRef.current) {
          router.push("/");
        }
      },
    });

    return unsubscribe;
  }, [init, router, setAppUser, clearUser, setFetchError]);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        console.log(user);
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
