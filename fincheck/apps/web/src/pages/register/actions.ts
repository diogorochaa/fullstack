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
import { signup } from "../../services/api";
import { queryKeys } from "../../services/query-keys";

const registerSchema = z.object({
  name: z.string().min(1, "Informe seu nome").min(2, "Digite um nome valido"),
  email: z
    .string()
    .min(1, "Informe seu email")
    .email("Informe um email valido"),
  password: z
    .string()
    .min(1, "Informe sua senha")
    .min(8, "A senha deve ter ao menos 8 caracteres"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export type RegisterPageActions = {
  title: string;
  subtitle: string;
  submitLabel: string;
  register: UseFormRegister<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
  isSubmitting: boolean;
  requestError: string | null;
  onSubmit: FormHTMLAttributes<HTMLFormElement>["onSubmit"];
};

export function useRegisterPageActions(): RegisterPageActions {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: signup,
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
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  return {
    title: "Crie sua conta",
    subtitle: "Comece a organizar sua vida financeira",
    submitLabel: "Cadastrar",
    register,
    errors,
    isSubmitting: signupMutation.isPending,
    requestError: signupMutation.isError
      ? getApiErrorMessage(signupMutation.error)
      : null,
    onSubmit: (event) => {
      void handleSubmit(async (data) => {
        try {
          await signupMutation.mutateAsync(data);
        } catch {
          // Error state is handled by TanStack Query and shown in the form.
        }
      })(event);
    },
  };
}
