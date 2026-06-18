import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  type LoginFormValues,
  loginSchema,
} from '@/features/auth/schemas/auth.schema'
import { useFormSchema } from '@/hooks/use-form-schema'
import { type AppErrorDetails, parseAppError } from '@/lib/api-error'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginPayload } from '@/types/auth'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [error, setError] = useState<AppErrorDetails | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormSchema(loginSchema)

  async function onSubmit(values: LoginFormValues): Promise<void> {
    setError(null)
    try {
      await login(values as LoginPayload)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/', { replace: true })
    } catch (err) {
      setError(parseAppError(err, 'auth'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          className="h-11"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="h-11"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {error && <ErrorAlert error={error} />}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-full bg-brand text-white hover:bg-brand/90"
      >
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
