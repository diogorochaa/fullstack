import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { CreateAddressDto } from 'src/modules/addresses/application/dto/create-address.dto';
import { ADDRESS_REPOSITORY } from 'src/modules/addresses/domain/constants/address.tokens';
import { Address } from 'src/modules/addresses/domain/entities/address.entity';
import { AddressRepository } from 'src/modules/addresses/domain/repositories/address.repository';

@Injectable()
export class CreateAddressUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly repository: AddressRepository,
  ) {}

  async execute(userId: string, input: CreateAddressDto): Promise<Address> {
    if (input.isDefault) {
      await this.repository.clearDefaultForUser(userId);
    }

    const address = Address.create({
      id: randomUUID(),
      userId,
      street: input.street,
      number: input.number,
      complement: input.complement,
      city: input.city,
      state: input.state,
      zip: input.zip,
      isDefault: input.isDefault,
    });

    await this.repository.create(address);

    return address;
  }
}
