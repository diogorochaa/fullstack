import type { User } from "../../domain/entity/user";
import type { UserResponseDto } from "../dtos/user-response-dto";

export function userToResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
