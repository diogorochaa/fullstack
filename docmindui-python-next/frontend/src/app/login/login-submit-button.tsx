"use client"

import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import { GradientButton } from "@/components/shared/GradientButton"

export function LoginSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <GradientButton type="submit" fullWidth disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" />
          Entrando...
        </>
      ) : (
        "Entrar"
      )}
    </GradientButton>
  )
}
