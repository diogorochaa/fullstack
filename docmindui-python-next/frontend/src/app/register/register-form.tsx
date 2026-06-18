"use client"

import type { ComponentProps } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { AuthFormAlert } from "@/features/auth/components/auth-form-alert"

import { RegisterSubmitButton } from "./register-submit-button"

type RegisterFormProps = {
  formAction: NonNullable<ComponentProps<"form">["action"]>
  errorMessage: string | null
  isPending: boolean
}

export function RegisterForm({ formAction, errorMessage, isPending }: RegisterFormProps) {
  return (
    <form action={formAction} className="space-y-4">
      <AuthFormAlert message={errorMessage} />
      <div className="space-y-2">
        <Label htmlFor="register-email">E-mail</Label>
        <Input
          id="register-email"
          name="email"
          placeholder="nome@empresa.com"
          type="email"
          required
          autoComplete="email"
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Senha</Label>
        <PasswordInput
          id="register-password"
          name="password"
          placeholder="Mínimo 8 caracteres"
          required
          autoComplete="new-password"
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-confirm">Confirmar senha</Label>
        <PasswordInput
          id="register-confirm"
          name="confirm"
          placeholder="Repita a senha"
          required
          autoComplete="new-password"
          disabled={isPending}
        />
      </div>
      <RegisterSubmitButton />
    </form>
  )
}
