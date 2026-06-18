import { clearAppQueryCache } from '@/app/providers'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/features/account/components/UserAvatar'
import { useAuthStore } from '@/stores/auth.store'
import { LayoutDashboard, LogOut, Package, Settings, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function UserMenu() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  if (!user) return null

  function goTo(path: string) {
    navigate(path)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2"
            aria-haspopup="menu"
            aria-label={`Menu de ${user.name}`}
          >
            <UserAvatar user={user} size="sm" />
            <span className="max-w-28 truncate text-sm font-medium">
              {user.name}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => goTo('/conta/perfil')}>
          <User />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => goTo('/conta/configuracoes')}>
          <Settings />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => goTo('/pedidos')}>
          <Package />
          Pedidos
        </DropdownMenuItem>
        {user.role === 'ADMIN' ? (
          <DropdownMenuItem onClick={() => goTo('/admin/dashboard')}>
            <LayoutDashboard />
            Painel admin
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            logout()
            clearAppQueryCache()
            navigate('/')
          }}
        >
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
