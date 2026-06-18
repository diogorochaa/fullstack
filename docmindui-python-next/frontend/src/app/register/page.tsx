"use client"

import { GuestAuthLayout } from "@/features/auth/components/guest-auth-layout"

import { RegisterView } from "./register-view"

export default function RegisterPage() {
  return (
    <GuestAuthLayout>
      <RegisterView />
    </GuestAuthLayout>
  )
}
