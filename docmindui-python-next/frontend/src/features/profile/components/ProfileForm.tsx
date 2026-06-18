"use client"

import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"

import { GradientButton } from "@/components/shared/GradientButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/features/auth/context"
import {
  fetchProfile,
  lookupCep,
  type ProfileData,
  updateProfile,
} from "@/features/profile/api/profile-api"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { handleApiError } from "@/lib/handle-api-error"

export function ProfileForm() {
  const { session } = useAuth()
  const token = session?.accessToken
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [form, setForm] = useState<Partial<ProfileData>>({})
  const debouncedCep = useDebouncedValue(form.cep ?? "", 500)
  const lastCepLookup = useState({ current: "" })[0]

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const profile = await fetchProfile(token)
      setForm(profile)
    } catch (error) {
      handleApiError(error, { fallback: "Não foi possível carregar o perfil." })
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const digits = debouncedCep.replace(/\D/g, "")
    if (digits.length !== 8 || !token || lastCepLookup.current === digits) return

    let cancelled = false
    setCepLoading(true)
    lookupCep(token, digits)
      .then((data) => {
        if (cancelled) return
        lastCepLookup.current = digits
        setForm((prev) => ({
          ...prev,
          rua: data.rua,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep,
        }))
      })
      .catch(() => {
        if (!cancelled) toast.warn("CEP não encontrado.")
      })
      .finally(() => {
        if (!cancelled) setCepLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedCep, token, lastCepLookup])

  function updateField(field: keyof ProfileData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    try {
      const saved = await updateProfile(token, {
        nome: form.nome ?? undefined,
        email: form.email ?? undefined,
        telefone: form.telefone ?? undefined,
        cep: form.cep ?? undefined,
        rua: form.rua ?? undefined,
        numero: form.numero ?? undefined,
        bairro: form.bairro ?? undefined,
        cidade: form.cidade ?? undefined,
        estado: form.estado ?? undefined,
      })
      setForm(saved)
      toast.success("Perfil salvo com sucesso.")
    } catch (error) {
      handleApiError(error, { fallback: "Falha ao salvar o perfil." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Carregando perfil...
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          value={form.nome ?? ""}
          onChange={(e) => updateField("nome", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={form.email ?? ""}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          value={form.telefone ?? ""}
          onChange={(e) => updateField("telefone", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cep">CEP</Label>
        <div className="relative">
          <Input
            id="cep"
            value={form.cep ?? ""}
            onChange={(e) => {
              lastCepLookup.current = ""
              updateField("cep", e.target.value)
            }}
            placeholder="00000-000"
          />
          {cepLoading ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rua">Rua</Label>
        <Input
          id="rua"
          value={form.rua ?? ""}
          onChange={(e) => updateField("rua", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="numero">Número</Label>
        <Input
          id="numero"
          value={form.numero ?? ""}
          onChange={(e) => updateField("numero", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            id="bairro"
            value={form.bairro ?? ""}
            onChange={(e) => updateField("bairro", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            value={form.cidade ?? ""}
            onChange={(e) => updateField("cidade", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="estado">Estado</Label>
        <Input
          id="estado"
          maxLength={2}
          value={form.estado ?? ""}
          onChange={(e) => updateField("estado", e.target.value.toUpperCase())}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <GradientButton type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar perfil"}
        </GradientButton>
        <Button type="button" variant="outline" asChild>
          <Link href="/">Voltar ao chat</Link>
        </Button>
      </div>
    </form>
  )
}
