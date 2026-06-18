import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <Link to="/" className="mb-8 text-2xl font-bold">
          shopmax
        </Link>
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-foreground lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/90 to-foreground" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <p className="text-3xl font-bold">shopmax</p>
          <div>
            <p className="text-sm font-semibold tracking-widest text-brand-foreground/80 uppercase">
              Bem-vindo
            </p>
            <h2 className="mt-4 text-4xl leading-tight font-bold">
              Estilo que te <span className="text-brand">acompanha</span>
            </h2>
            <p className="mt-4 max-w-sm text-primary-foreground/70">
              Acesse sua conta para acompanhar pedidos, salvar favoritos e
              receber ofertas exclusivas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
