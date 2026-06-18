import { Address } from 'src/modules/addresses/domain/entities/address.entity';

export class AddressResponse {
  constructor(
    public readonly id: string,
    public readonly street: string,
    public readonly number: string,
    public readonly complement: string | null,
    public readonly city: string,
    public readonly state: string,
    public readonly zip: string,
    public readonly isDefault: boolean,
  ) {}

  static fromEntity(address: Address): AddressResponse {
    return new AddressResponse(
      address.id,
      address.street,
      address.number,
      address.complement,
      address.city,
      address.state,
      address.zip,
      address.isDefault,
    );
  }
}
