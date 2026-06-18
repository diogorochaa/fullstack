import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const required = [
  "src/app/login/page.tsx",
  "src/app/register/page.tsx",
  "src/features/auth/actions.ts",
  "src/features/auth/context.tsx",
]

let failed = false
for (const rel of required) {
  const abs = resolve(root, rel)
  if (!existsSync(abs)) {
    console.error(`Missing: ${rel}`)
    failed = true
  }
}

if (failed) {
  process.exit(1)
}

console.log("Auth pages and modules present:", required.join(", "))
