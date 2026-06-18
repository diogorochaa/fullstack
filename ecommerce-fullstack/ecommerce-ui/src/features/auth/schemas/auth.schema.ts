import { z } from 'zod'

const emailField = z
  .string()
  .min(1, 'E-mail obrigatório')
  .email('E-mail inválido')

const passwordField = z
  .string()
  .min(1, 'Senha obrigatória')
  .min(6, 'Mínimo 6 caracteres')
  .max(72, 'Máximo 72 caracteres')

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome obrigatório')
    .min(3, 'Mínimo 3 caracteres')
    .max(80, 'Máximo 80 caracteres'),
  email: emailField,
  password: passwordField,
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
