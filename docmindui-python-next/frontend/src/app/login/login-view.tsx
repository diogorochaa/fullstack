"use client"

import { useRouter } from "next/navigation"
import { useActionState } from "react"

import { loginAction } from "@/features/auth/actions"
import { AuthCardLinksFooter } from "@/features/auth/components/auth-card-links-footer"
import { AuthFormCard } from "@/features/auth/components/auth-form-card"
import { useAuth } from "@/features/auth/context"
import { toastError, toastSuccess } from "@/lib/toast"

import { LoginForm } from "./login-form"

export function LoginView() {
  const router = useRouter()
  const { setSession } = useAuth()

  const [errorMessage, formAction, isPending] = useActionState<string | null, FormData>(
    async (_prev, formData) => {
      const email = String(formData.get("email") ?? "").trim()
      const password = String(formData.get("password") ?? "")
      try {
        const data = await loginAction(email, password)
        setSession({ accessToken: data.accessToken, email: data.email })
        toastSuccess("Login realizado com sucesso.")
        router.push("/")
        router.refresh()
        return null
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao entrar."
        toastError(msg)
        return msg
      }
    },
    null,
  )

  return (
    <AuthFormCard
      title="Entrar"
      description="Acesse o DocMind com sua conta"
      footer={
        <AuthCardLinksFooter
          leadingText="Ainda não tem conta?"
          linkHref="/register"
          linkLabel="Criar conta"
        />
      }
    >
      <LoginForm formAction={formAction} errorMessage={errorMessage} isPending={isPending} />
    </AuthFormCard>
  )
}
