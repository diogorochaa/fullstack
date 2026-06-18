import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuthStore } from '@/stores/auth.store'
import { Link, Navigate } from 'react-router-dom'

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre na sua conta para continuar comprando"
      footer={
        <>
          Não tem conta?{' '}
          <Link
            to="/register"
            className="font-medium text-brand hover:underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
