import { Inject, Injectable } from '@nestjs/common';
import { UpdateAddressDto } from 'src/modules/addresses/application/dto/update-address.dto';
import { ADDRESS_REPOSITORY } from 'src/modules/addresses/domain/constants/address.tokens';
import { Address } from 'src/modules/addresses/domain/entities/address.entity';
import { AddressForbiddenException } from 'src/modules/addresses/domain/exceptions/address-forbidden.exception';
import { AddressNotFoundException } from 'src/modules/addresses/domain/exceptions/address-not-found.exception';
import { AddressRepository } from 'src/modules/addresses/domain/repositories/address.repository';

@Injectable()
export class UpdateAddressUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly repository: AddressRepository,
  ) {}

  async execute(
    userId: string,
    id: string,
    input: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.repository.findById(id);

    if (!address) {
      throw new AddressNotFoundException(id);
    }

    if (address.userId !== userId) {
      throw new AddressForbiddenException();
    }

    if (input.isDefault) {
      await this.repository.clearDefaultForUser(userId);
    }

    const updated = address.update(input);
    await this.repository.update(updated);

    return updated;
  }
}
