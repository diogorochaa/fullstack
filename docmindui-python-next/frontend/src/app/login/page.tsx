"use client"

import { GuestAuthLayout } from "@/features/auth/components/guest-auth-layout"

import { LoginView } from "./login-view"

export default function LoginPage() {
  return (
    <GuestAuthLayout>
      <LoginView />
    </GuestAuthLayout>
  )
}
