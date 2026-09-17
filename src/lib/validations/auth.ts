import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(1, "Informe seu nome"),
  email: z.email("Email inválido"),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
})

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "Informe sua senha"),
})
