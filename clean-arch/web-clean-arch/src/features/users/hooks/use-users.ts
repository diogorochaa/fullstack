import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateUserInput } from "../api/user.schemas";
import { createUser, getUserById, listUsers } from "../api/users.service";

export const usersQueryKeys = {
  all: ["users"] as const,
  lists: () => [...usersQueryKeys.all, "list"] as const,
  detail: (id: string) => [...usersQueryKeys.all, "detail", id] as const,
};

export function useUsersQuery() {
  return useQuery({
    queryKey: usersQueryKeys.lists(),
    queryFn: listUsers,
  });
}

export function useUserByIdQuery(id: string | null) {
  return useQuery({
    queryKey: id ? usersQueryKeys.detail(id) : usersQueryKeys.detail(""),
    queryFn: () => getUserById(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
    },
  });
}
