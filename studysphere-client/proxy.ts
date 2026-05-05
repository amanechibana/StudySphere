import { NextRequest, NextResponse } from "next/server";
import { firebaseAdmin } from "./app/firebase/firebaseAdmin";

export async function proxy(req: NextRequest) {
  const onboarded = req.cookies.get("onboarded")?.value === "true";
  const token = req.cookies.get("firebaseToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = await firebaseAdmin.verifyIdToken(token);

    if (!onboarded) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${decoded.uid}`,
      );

      if (res.status === 404) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }

      const response = NextResponse.next();
      response.cookies.set("onboarded", "true", {
        path: "/",
        sameSite: "strict",
      });
      return response;
    }
  } catch (err) {
    console.error("Error verifying Firebase token:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/rooms/:path*", "/room/:path*"],
};
