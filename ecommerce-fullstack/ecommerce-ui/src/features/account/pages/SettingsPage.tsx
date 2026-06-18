import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { PageTransition } from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type AppErrorDetails, parseAppError } from '@/lib/api-error'
import { usersService } from '@/services/users.service'
import { useAuthStore } from '@/stores/auth.store'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const updateUser = useAuthStore((s) => s.updateUser)
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<AppErrorDetails | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!accessToken) return

    const payload: { email?: string; password?: string } = {}
    if (email.trim() && email !== user?.email) payload.email = email.trim()
    if (password.trim()) payload.password = password

    if (Object.keys(payload).length === 0) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const updated = await usersService.updateMe(accessToken, payload)
      updateUser(updated)
      setPassword('')
      setSuccess(true)
    } catch (err) {
      setError(parseAppError(err, 'api'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageTransition className="mx-auto max-w-lg px-4 py-10">
      <Link
        to="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar para a loja
      </Link>

      <h1 className="mt-6 text-2xl font-bold">Configurações</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Atualize seu e-mail e senha de acesso.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Deixe em branco para não alterar"
            className="h-11"
            minLength={6}
          />
        </div>

        {error && <ErrorAlert error={error} />}
        {success && (
          <output className="block text-sm text-emerald-600">
            Configurações salvas com sucesso.
          </output>
        )}

        <Button
          type="submit"
          disabled={saving}
          className="h-11 rounded-full bg-brand text-white hover:bg-brand/90"
        >
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </Button>
      </form>
    </PageTransition>
  )
}
