import NextAuth from "next-auth"
import { NextResponse } from "next/server"

import { authConfig } from "@/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isSubscribed = req.auth?.user.subscriptionStatus === "ACTIVE"
  const isSubscribePage = pathname.startsWith("/subscribe")

  if (!isSubscribed && !isSubscribePage) {
    return NextResponse.redirect(new URL("/subscribe", req.nextUrl))
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/subscribe/:path*"],
}
