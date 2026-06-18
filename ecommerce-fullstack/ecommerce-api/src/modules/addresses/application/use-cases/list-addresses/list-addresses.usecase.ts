import { Inject, Injectable } from '@nestjs/common';
import { ADDRESS_REPOSITORY } from 'src/modules/addresses/domain/constants/address.tokens';
import { AddressRepository } from 'src/modules/addresses/domain/repositories/address.repository';

@Injectable()
export class ListAddressesUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly repository: AddressRepository,
  ) {}

  async execute(userId: string) {
    return this.repository.findByUserId(userId);
  }
}
