import * as LabelPrimitive from "@radix-ui/react-label"
import type * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ref, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  )
}

Label.displayName = LabelPrimitive.Root.displayName

export { Label }
