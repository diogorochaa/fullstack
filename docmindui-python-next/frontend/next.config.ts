import type { NextConfig } from "next"

/** ESLint em build: suportado em runtime; tipos do Next 16 podem não expor a chave. */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
} as NextConfig

export default nextConfig
