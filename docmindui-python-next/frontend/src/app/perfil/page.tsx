"use client"

import { User } from "lucide-react"

import { AuthGuard } from "@/features/auth/components/AuthGuard"
import { ProfileForm } from "@/features/profile/components/ProfileForm"

export default function PerfilPage() {
  return (
    <AuthGuard>
      <div className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <header className="mb-8 flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Perfil</h1>
              <p className="text-sm text-muted-foreground">
                Dados usados pelo agente de informações do usuário
              </p>
            </div>
          </header>
          <ProfileForm />
        </div>
      </div>
    </AuthGuard>
  )
}
