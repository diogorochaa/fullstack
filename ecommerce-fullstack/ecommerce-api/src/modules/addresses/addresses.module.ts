import { Module } from '@nestjs/common';
import { CreateAddressUseCase } from 'src/modules/addresses/application/use-cases/create-address/create-address.usecase';
import { DeleteAddressUseCase } from 'src/modules/addresses/application/use-cases/delete-address/delete-address.usecase';
import { ListAddressesUseCase } from 'src/modules/addresses/application/use-cases/list-addresses/list-addresses.usecase';
import { UpdateAddressUseCase } from 'src/modules/addresses/application/use-cases/update-address/update-address.usecase';
import { ADDRESS_REPOSITORY } from 'src/modules/addresses/domain/constants/address.tokens';
import { PrismaAddressRepository } from 'src/modules/addresses/infrastructure/repositories/prisma-address.repository';
import { AddressesController } from 'src/modules/addresses/presentation/controllers/addresses.controller';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AddressesController],
  providers: [
    ListAddressesUseCase,
    CreateAddressUseCase,
    UpdateAddressUseCase,
    DeleteAddressUseCase,
    {
      provide: ADDRESS_REPOSITORY,
      useClass: PrismaAddressRepository,
    },
  ],
  exports: [ADDRESS_REPOSITORY],
})
export class AddressesModule {}
