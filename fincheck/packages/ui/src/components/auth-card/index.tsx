import { type FormHTMLAttributes, type ReactNode } from "react";
import { Button } from "../primitives/button";

type AuthCardProps = {
  title: string;
  subtitle: string;
  footer: ReactNode;
  submitLabel: string;
  children: ReactNode;
  onSubmit?: FormHTMLAttributes<HTMLFormElement>["onSubmit"];
};

export function AuthCard({
  title,
  subtitle,
  footer,
  submitLabel,
  children,
  onSubmit,
}: AuthCardProps) {
  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

      <form className="mt-6 space-y-3" onSubmit={onSubmit} noValidate>
        {children}
        <Button className="mt-2" fullWidth type="submit">
          <Button.Text>{submitLabel}</Button.Text>
        </Button>
      </form>

      <div className="mt-5 text-sm text-slate-600">{footer}</div>
    </section>
  );
}
