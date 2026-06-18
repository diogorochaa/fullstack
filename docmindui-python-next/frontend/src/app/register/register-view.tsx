"use client"

import { useRouter } from "next/navigation"
import { useActionState } from "react"

import { registerAction } from "@/features/auth/actions"
import { AuthCardLinksFooter } from "@/features/auth/components/auth-card-links-footer"
import { AuthFormCard } from "@/features/auth/components/auth-form-card"
import { useAuth } from "@/features/auth/context"
import { toastError, toastSuccess, toastWarning } from "@/lib/toast"

import { RegisterForm } from "./register-form"

export function RegisterView() {
  const router = useRouter()
  const { setSession } = useAuth()

  const [errorMessage, formAction, isPending] = useActionState<string | null, FormData>(
    async (_prev, formData) => {
      const email = String(formData.get("email") ?? "").trim()
      const password = String(formData.get("password") ?? "")
      const confirm = String(formData.get("confirm") ?? "")
      if (password.length < 8) {
        const msg = "A senha deve ter pelo menos 8 caracteres."
        toastWarning(msg)
        return msg
      }
      if (password !== confirm) {
        const msg = "As senhas não coincidem."
        toastWarning(msg)
        return msg
      }
      try {
        const data = await registerAction(email, password)
        setSession({ accessToken: data.accessToken, email: data.email })
        toastSuccess("Conta criada com sucesso. Bem-vindo ao DocMind!")
        router.push("/")
        router.refresh()
        return null
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao cadastrar."
        toastError(msg)
        return msg
      }
    },
    null,
  )

  return (
    <AuthFormCard
      title="Criar conta"
      description="Cadastre-se para usar o DocMind"
      footer={
        <AuthCardLinksFooter leadingText="Já tem conta?" linkHref="/login" linkLabel="Entrar" />
      }
    >
      <RegisterForm formAction={formAction} errorMessage={errorMessage} isPending={isPending} />
    </AuthFormCard>
  )
}
