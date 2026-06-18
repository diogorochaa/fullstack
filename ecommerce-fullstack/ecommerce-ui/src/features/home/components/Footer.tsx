import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-foreground text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xl font-bold">shopmax</p>
          <p className="mt-1 text-sm text-primary-foreground/70">
            Moda, tecnologia e lifestyle em um só lugar.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-primary-foreground/80">
          <Link to="/" className="hover:text-brand">
            Produtos
          </Link>
          <Link to="/login" className="hover:text-brand">
            Entrar
          </Link>
          <Link to="/register" className="hover:text-brand">
            Criar conta
          </Link>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} shopmax. Todos os direitos reservados.
      </div>
    </footer>
  )
}
