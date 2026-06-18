import { User } from 'src/modules/users/domain/entities/user.entity';
import { PaginatedResult } from 'src/shared/types/paginated-result';

export class AdminUserResponse {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly role: string,
    public readonly createdAt: string,
  ) {}

  static fromRecord(record: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
  }): AdminUserResponse {
    return new AdminUserResponse(
      record.id,
      record.name,
      record.email,
      record.role,
      record.createdAt.toISOString(),
    );
  }

  static fromUser(user: User): AdminUserResponse {
    return new AdminUserResponse(
      user.id,
      user.name,
      user.email.getValue(),
      user.role,
      new Date().toISOString(),
    );
  }
}

export class PaginatedAdminUserResponse {
  constructor(
    public readonly data: AdminUserResponse[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
    public readonly totalPages: number,
  ) {}

  static fromResult(
    result: PaginatedResult<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: Date;
    }>,
  ): PaginatedAdminUserResponse {
    return new PaginatedAdminUserResponse(
      result.data.map((user) => AdminUserResponse.fromRecord(user)),
      result.total,
      result.page,
      result.limit,
      result.totalPages,
    );
  }
}
