import { NextRequest, NextResponse } from "next/server";
import { firebaseAdmin } from "./app/firebase/firebaseAdmin";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("firebaseToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = await firebaseAdmin.verifyIdToken(token);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/firebase/${decoded.uid}`,
    );

    if (res.status === 404) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    
  } catch (err) {
    console.error("Error verifying Firebase token:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }

    return NextResponse.next();
}


export const config = {
      matcher: ["/((?!login|signup|_next|favicon.ico).*)"],
}