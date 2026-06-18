import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { useAuthStore } from '@/stores/auth.store'
import { Link, Navigate } from 'react-router-dom'

export function RegisterPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cadastre-se e aproveite as melhores ofertas"
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  )
}
