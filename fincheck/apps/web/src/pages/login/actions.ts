import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormHTMLAttributes } from "react";
import {
  useForm,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import { setAccessToken } from "../../lib/auth-storage";
import { getApiErrorMessage } from "../../lib/http-client";
import { signin } from "../../services/api";
import { queryKeys } from "../../services/query-keys";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu email")
    .email("Informe um email valido"),
  password: z
    .string()
    .min(1, "Informe sua senha")
    .min(8, "A senha deve ter ao menos 8 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export type LoginPageActions = {
  title: string;
  subtitle: string;
  submitLabel: string;
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  isSubmitting: boolean;
  requestError: string | null;
  onSubmit: FormHTMLAttributes<HTMLFormElement>["onSubmit"];
};

export function useLoginPageActions(): LoginPageActions {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signinMutation = useMutation({
    mutationFn: signin,
    onSuccess: async ({ accessToken }) => {
      setAccessToken(accessToken);
      await queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
      navigate("/");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return {
    title: "Acesse sua conta",
    subtitle: "Entre para acompanhar suas financas no Fincheck",
    submitLabel: "Entrar",
    register,
    errors,
    isSubmitting: signinMutation.isPending,
    requestError: signinMutation.isError
      ? getApiErrorMessage(signinMutation.error)
      : null,
    onSubmit: (event) => {
      void handleSubmit(async (data) => {
        try {
          await signinMutation.mutateAsync(data);
        } catch {
          // Error state is handled by TanStack Query and shown in the form.
        }
      })(event);
    },
  };
}
