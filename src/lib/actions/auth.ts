"use server"

import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"

import { signIn } from "@/auth"
import { prisma } from "@/lib/prisma"
import { loginSchema, registerSchema } from "@/lib/validations/auth"

export type AuthActionState = {
  error?: string
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "Já existe uma conta com este email" }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: { name, email, passwordHash },
  })

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/subscribe",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Conta criada, mas não foi possível entrar automaticamente. Faça login." }
    }
    throw error
  }

  return {}
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email ou senha incorretos" }
    }
    throw error
  }

  return {}
}
