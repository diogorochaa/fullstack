import { z } from 'zod'

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'] as const

export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Digite uma mensagem')
    .max(500, 'Máximo 500 caracteres'),
})

export const chatImageSchema = z.object({
  data: z.string().min(1),
  mime_type: z.enum(allowedMimeTypes),
  previewUrl: z.string().min(1),
})

export const chatSendSchema = z
  .object({
    message: z
      .string()
      .trim()
      .max(500, 'Máximo 500 caracteres')
      .optional(),
    image: chatImageSchema.optional(),
  })
  .refine(
    (value) => Boolean(value.message?.length) || value.image !== undefined,
    { message: 'Digite uma mensagem ou envie uma imagem', path: ['message'] },
  )

export type ChatMessageValues = z.infer<typeof chatMessageSchema>
export type ChatImageValues = z.infer<typeof chatImageSchema>
export type ChatSendValues = z.infer<typeof chatSendSchema>

export const chatResponseSchema = z.object({
  reply: z.string(),
  session_id: z.string(),
  sources: z
    .array(
      z.object({
        type: z.string(),
        id: z.string(),
      }),
    )
    .default([]),
})
