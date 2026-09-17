import "server-only"

import { auth } from "@/auth"

export async function requireActiveUser() {
  const session = await auth()
  if (!session?.user || session.user.subscriptionStatus !== "ACTIVE") {
    throw new Error("Não autorizado")
  }
  return session
}
