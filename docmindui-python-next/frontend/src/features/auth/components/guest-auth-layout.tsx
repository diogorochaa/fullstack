"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { type ReactNode, useEffect } from "react"

import { useAuth } from "@/features/auth/context"
import { fadeIn } from "@/lib/motion-variants"

import { AuthFullscreenLoading } from "./auth-fullscreen-loading"

export function GuestAuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { session, ready } = useAuth()

  useEffect(() => {
    if (ready && session) {
      router.replace("/")
    }
  }, [ready, session, router])

  if (!ready) {
    return <AuthFullscreenLoading />
  }

  if (session) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="guest-auth"
        variants={fadeIn}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
