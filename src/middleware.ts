import { getSession } from "@/lib/auth-client";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });
  if (!session) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  if (
    session?.data?.user &&
    (request.nextUrl.pathname === "/signin" ||
      request.nextUrl.pathname === "/sign-up" ||
      request.nextUrl.pathname === "/forgot-password" ||
      request.nextUrl.pathname === "/reset-password" ||
      request.nextUrl.pathname === "/verify-email" ||
      request.nextUrl.pathname === "/verify-email-otp" ||
      request.nextUrl.pathname === "/verify-email-otp-resend")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // App routes
    "/",
  ],
};
