import { Address } from '../entities/address.entity';

export abstract class AddressRepository {
  abstract create(address: Address): Promise<void>;
  abstract update(address: Address): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<Address | null>;
  abstract findByUserId(userId: string): Promise<Address[]>;
  abstract clearDefaultForUser(userId: string): Promise<void>;
}
