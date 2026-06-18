import { Address } from '../../domain/entities/address.entity';

type AddressRecord = {
  id: string;
  userId: string;
  street: string;
  number: string;
  complement: string | null;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

export class AddressMapper {
  static toPersistence(address: Address): AddressRecord {
    return {
      id: address.id,
      userId: address.userId,
      street: address.street,
      number: address.number,
      complement: address.complement,
      city: address.city,
      state: address.state,
      zip: address.zip,
      isDefault: address.isDefault,
    };
  }

  static toDomain(record: AddressRecord): Address {
    return Address.create({
      id: record.id,
      userId: record.userId,
      street: record.street,
      number: record.number,
      complement: record.complement,
      city: record.city,
      state: record.state,
      zip: record.zip,
      isDefault: record.isDefault,
    });
  }
}
