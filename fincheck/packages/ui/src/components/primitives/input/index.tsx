import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type RootProps = {
  children: ReactNode;
  className?: string;
};

type FieldProps = InputHTMLAttributes<HTMLInputElement>;

function Root({ children, className }: RootProps) {
  return (
    <label className={["block space-y-1", className ?? ""].join(" ")}>
      {children}
    </label>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="fc-label">{children}</span>;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={["fc-input", className ?? ""].join(" ")}
      {...props}
    />
  );
});

function Helper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={["text-xs", className ?? "text-slate-500"].join(" ")}>
      {children}
    </p>
  );
}

export const Input = Object.assign(Root, {
  Label,
  Field,
  Helper,
});
