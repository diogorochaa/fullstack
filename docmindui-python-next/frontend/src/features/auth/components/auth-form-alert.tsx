"use client"

import { motion } from "framer-motion"

type AuthFormAlertProps = {
  message: string | null
}

export function AuthFormAlert({ message }: AuthFormAlertProps) {
  if (!message) {
    return null
  }

  return (
    <motion.p
      role="alert"
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-sm text-destructive"
    >
      {message}
    </motion.p>
  )
}
