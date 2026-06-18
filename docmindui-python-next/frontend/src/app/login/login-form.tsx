"use client"

import type { ComponentProps } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { AuthFormAlert } from "@/features/auth/components/auth-form-alert"

import { LoginSubmitButton } from "./login-submit-button"

type LoginFormProps = {
  formAction: NonNullable<ComponentProps<"form">["action"]>
  errorMessage: string | null
  isPending: boolean
}

export function LoginForm({ formAction, errorMessage, isPending }: LoginFormProps) {
  return (
    <form action={formAction} className="space-y-4">
      <AuthFormAlert message={errorMessage} />
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          placeholder="nome@empresa.com"
          type="email"
          required
          autoComplete="email"
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="Sua senha"
          required
          autoComplete="current-password"
          disabled={isPending}
        />
      </div>
      <LoginSubmitButton />
    </form>
  )
}
