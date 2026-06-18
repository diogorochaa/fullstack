import { Inject, Injectable } from '@nestjs/common';
import { ADDRESS_REPOSITORY } from 'src/modules/addresses/domain/constants/address.tokens';
import { AddressForbiddenException } from 'src/modules/addresses/domain/exceptions/address-forbidden.exception';
import { AddressNotFoundException } from 'src/modules/addresses/domain/exceptions/address-not-found.exception';
import { AddressRepository } from 'src/modules/addresses/domain/repositories/address.repository';

@Injectable()
export class DeleteAddressUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly repository: AddressRepository,
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    const address = await this.repository.findById(id);

    if (!address) {
      throw new AddressNotFoundException(id);
    }

    if (address.userId !== userId) {
      throw new AddressForbiddenException();
    }

    await this.repository.delete(id);
  }
}
