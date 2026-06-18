import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { PageTransition } from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserAvatar } from '@/features/account/components/UserAvatar'
import { type AppErrorDetails, parseAppError } from '@/lib/api-error'
import { usersService } from '@/services/users.service'
import { useAuthStore } from '@/stores/auth.store'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const updateUser = useAuthStore((s) => s.updateUser)
  const [name, setName] = useState(user?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<AppErrorDetails | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!accessToken || name.trim().length < 3) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const updated = await usersService.updateMe(accessToken, {
        name: name.trim(),
      })
      updateUser(updated)
      setSuccess(true)
    } catch (err) {
      setError(parseAppError(err, 'api'))
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <PageTransition className="mx-auto max-w-lg px-4 py-10">
      <Link
        to="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar para a loja
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <UserAvatar user={user} />
        <div>
          <h1 className="text-2xl font-bold">Meu perfil</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={3}
            className="h-11"
          />
        </div>

        {error && <ErrorAlert error={error} />}
        {success && (
          <output className="block text-sm text-emerald-600">
            Perfil atualizado com sucesso.
          </output>
        )}

        <Button
          type="submit"
          disabled={saving || name.trim().length < 3}
          className="h-11 rounded-full bg-brand text-white hover:bg-brand/90"
        >
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>
    </PageTransition>
  )
}
