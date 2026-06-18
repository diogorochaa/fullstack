import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_IA_API_URL: z.string().url(),
  VITE_SOCKET_URL: z.string().url(),
})

export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  VITE_IA_API_URL: import.meta.env.VITE_IA_API_URL ?? 'http://localhost:8100',
  VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000',
})
