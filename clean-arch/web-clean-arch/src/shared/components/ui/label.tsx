// biome-ignore-all lint/a11y/noLabelWithoutControl: Label association is provided by consumers.

import type * as React from "react";
import { cn } from "@/shared/lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
