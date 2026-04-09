import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

type RootProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-violet-600 text-white hover:bg-violet-700",
  outline: "border border-slate-200 text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  icon: "h-10 w-10",
};

function Root({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  type = "button",
  ...props
}: RootProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:pointer-events-none disabled:opacity-50",
        variantClass[variant],
        sizeClass[size],
        fullWidth ? "w-full" : "",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center">{children}</span>
  );
}

function Text({ children }: { children: ReactNode }) {
  return <span>{children}</span>;
}

export const Button = Object.assign(Root, { Icon, Text });
