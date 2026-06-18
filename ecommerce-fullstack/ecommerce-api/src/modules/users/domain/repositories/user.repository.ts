import { PaginatedResult } from 'src/shared/types/paginated-result';
import { User } from '../entities/user.entity';

export abstract class UserRepository {
  abstract create(user: User): Promise<void>;
  abstract update(user: User): Promise<void>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedResult<User>>;
  abstract findAllPaginatedAdmin(
    page: number,
    limit: number,
    search?: string,
  ): Promise<
    PaginatedResult<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: Date;
    }>
  >;
  abstract delete(id: string): Promise<void>;
}
