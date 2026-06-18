"use client"

import { useEffect, useRef, useState } from "react"

import { lookupCep } from "@/features/profile/api/profile-api"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"

type AddressFields = {
  rua: string
  bairro: string
  cidade: string
  estado: string
}

export function useCepLookup(token: string | undefined, cep: string) {
  const debouncedCep = useDebouncedValue(cep, 400)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastFetched = useRef("")

  useEffect(() => {
    const digits = debouncedCep.replace(/\D/g, "")
    if (digits.length !== 8 || !token) return
    if (lastFetched.current === digits) return

    let cancelled = false
    setLoading(true)
    setError(null)

    lookupCep(token, digits)
      .then((data) => {
        if (cancelled) return
        lastFetched.current = digits
        return data
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "CEP inválido")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedCep, token])

  async function fetchNow(): Promise<AddressFields | null> {
    const digits = cep.replace(/\D/g, "")
    if (digits.length !== 8 || !token) return null
    setLoading(true)
    setError(null)
    try {
      const data = await lookupCep(token, digits)
      lastFetched.current = digits
      return {
        rua: data.rua,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "CEP inválido")
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, fetchNow }
}
