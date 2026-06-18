"use client"

import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import { GradientButton } from "@/components/shared/GradientButton"

export function RegisterSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <GradientButton type="submit" fullWidth disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" />
          Cadastrando...
        </>
      ) : (
        "Cadastrar"
      )}
    </GradientButton>
  )
}
