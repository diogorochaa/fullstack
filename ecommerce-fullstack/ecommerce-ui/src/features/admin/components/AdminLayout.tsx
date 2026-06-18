import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Bot,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Users,
} from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/produtos', label: 'Produtos', icon: ShoppingBag },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/pedidos', label: 'Pedidos', icon: Package },
  { to: '/admin/assistente', label: 'Assistente IA', icon: Bot },
] as const

export function AdminLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="shrink-0 border-b border-border px-5 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Shopmax
          </p>
          <h1 className="text-lg font-bold">Painel Admin</h1>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to)
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="shrink-0 border-t border-border bg-background p-3">
          <Button variant="outline" className="w-full" render={<Link to="/" />}>
            <Store className="size-4" />
            Voltar à loja
          </Button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-border bg-background px-4 py-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-bold">Painel Admin</h1>
            <Button variant="outline" size="sm" render={<Link to="/" />}>
              Loja
            </Button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1 text-xs font-medium',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
