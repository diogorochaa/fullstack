"use client"

import Link from "next/link"

import { Separator } from "@/components/ui/separator"

type AuthCardLinksFooterProps = {
  leadingText: string
  linkHref: string
  linkLabel: string
}

export function AuthCardLinksFooter({
  leadingText,
  linkHref,
  linkLabel,
}: AuthCardLinksFooterProps) {
  return (
    <>
      <div className="flex w-full items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs uppercase text-muted-foreground">ou</span>
        <Separator className="flex-1" />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {leadingText}{" "}
        <Link
          href={linkHref}
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          {linkLabel}
        </Link>
      </p>
    </>
  )
}
