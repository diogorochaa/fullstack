import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseAppError } from '@/lib/api-error'
import { adminService } from '@/services/admin.service'
import { useAuthStore } from '@/stores/auth.store'
import type { AdminUser } from '@/types/admin'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Shield, ShieldOff, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function AdminUsersPage() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const currentUser = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () =>
      adminService.listUsers(accessToken ?? '', 1, 50, search || undefined),
    enabled: Boolean(accessToken),
  })

  const roleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string
      role: 'CUSTOMER' | 'ADMIN'
    }) => adminService.updateUserRole(accessToken ?? '', userId, role),
    onSuccess: () => {
      setActionError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err) => {
      setActionError(parseAppError(err, 'api').message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: string) =>
      adminService.deleteUser(accessToken ?? '', userId),
    onSuccess: () => {
      setActionError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err) => {
      setActionError(parseAppError(err, 'api').message)
    },
  })

  const users = data?.data ?? []

  function toggleRole(user: AdminUser) {
    const nextRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'
    const action =
      nextRole === 'ADMIN'
        ? 'conceder acesso de admin'
        : 'remover acesso de admin'

    if (window.confirm(`Deseja ${action} para ${user.name}?`)) {
      roleMutation.mutate({ userId: user.id, role: nextRole })
    }
  }

  function removeUser(user: AdminUser) {
    if (
      window.confirm(
        `Excluir ${user.name} da plataforma? Usuários com pedidos não podem ser removidos.`,
      )
    ) {
      deleteMutation.mutate(user.id)
    }
  }

  if (isError) {
    return (
      <ErrorState
        error={parseAppError(error, 'api')}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie contas, permissões de administrador e exclusões.
        </p>
      </div>

      {actionError ? <ErrorAlert error={actionError} /> : null}

      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando usuários...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Papel</th>
                <th className="px-4 py-3 font-medium">Cadastro</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === currentUser?.id
                return (
                  <tr key={user.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                        {isSelf ? ' · você' : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={user.role === 'ADMIN' ? 'default' : 'outline'}
                      >
                        {user.role === 'ADMIN' ? 'Admin' : 'Cliente'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSelf || roleMutation.isPending}
                          onClick={() => toggleRole(user)}
                        >
                          {user.role === 'ADMIN' ? (
                            <>
                              <ShieldOff />
                              Remover admin
                            </>
                          ) : (
                            <>
                              <Shield />
                              Tornar admin
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          disabled={isSelf || deleteMutation.isPending}
                          onClick={() => removeUser(user)}
                          aria-label={`Excluir ${user.name}`}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
