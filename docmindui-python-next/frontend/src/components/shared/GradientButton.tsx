"use client"

import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const gradientButtonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold text-white shadow-soft transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-xs",
        icon: "h-10 w-10 rounded-full p-0",
        lg: "h-12 px-6 text-base",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      size: "default",
      fullWidth: false,
    },
  },
)

export type GradientButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof gradientButtonVariants> & {
    asChild?: boolean
  }

export function GradientButton({
  className,
  size,
  fullWidth,
  asChild = false,
  ...props
}: GradientButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        gradientButtonVariants({ size, fullWidth }),
        "bg-brand-gradient hover:opacity-90",
        className,
      )}
      {...props}
    />
  )
}
