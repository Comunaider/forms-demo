import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      subscriptionStatus: string
    } & DefaultSession["user"]
  }

  interface User {
    subscriptionStatus?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    subscriptionStatus: string
  }
}
