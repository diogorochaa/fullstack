import { zodResolver } from '@hookform/resolvers/zod'
import { type UseFormProps, useForm } from 'react-hook-form'
import type { z } from 'zod'

export function useFormSchema<S extends z.ZodTypeAny>(
  schema: S,
  options?: Omit<UseFormProps<z.infer<S>>, 'resolver'>,
) {
  return useForm<z.infer<S>>({
    resolver: zodResolver(schema),
    ...options,
  })
}
