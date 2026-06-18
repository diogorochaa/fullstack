import { cn } from "@/lib/utils"

type AppLogoProps = {
  size?: "sm" | "md" | "lg"
  className?: string
  /** When true, hides the logo from assistive tech (use beside visible "DocMind" text). */
  decorative?: boolean
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
}

export function AppLogo({ size = "md", className, decorative = false }: AppLogoProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow",
        sizeMap[size],
        className,
      )}
      aria-hidden={decorative || undefined}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-[55%] w-[55%] text-white"
        fill="currentColor"
        role={decorative ? "presentation" : "img"}
        aria-label={decorative ? undefined : "DocMind"}
        aria-hidden={decorative || undefined}
      >
        {!decorative ? <title>DocMind</title> : null}
        <path d="M16 4c-2 4-6 5-8 8 3-1 6 0 8 3-2-5-1-9 0-11zm0 24c2-4 6-5 8-8-3 1-6 0-8-3 2 5 1 9 0 11zM4 16c4-2 5-6 8-8-1 3 0 6 3 8-5-2-9-1-11 0zm24 0c-4 2-5 6-8 8 1-3 0-6-3-8 5 2 9 1 11 0z" />
      </svg>
    </div>
  )
}
