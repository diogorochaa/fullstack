import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAddressDto } from 'src/modules/addresses/application/dto/create-address.dto';
import { UpdateAddressDto } from 'src/modules/addresses/application/dto/update-address.dto';
import { CreateAddressUseCase } from 'src/modules/addresses/application/use-cases/create-address/create-address.usecase';
import { DeleteAddressUseCase } from 'src/modules/addresses/application/use-cases/delete-address/delete-address.usecase';
import { ListAddressesUseCase } from 'src/modules/addresses/application/use-cases/list-addresses/list-addresses.usecase';
import { UpdateAddressUseCase } from 'src/modules/addresses/application/use-cases/update-address/update-address.usecase';
import { AddressResponse } from 'src/modules/addresses/presentation/responses/address.response';
import type { AuthenticatedUser } from 'src/modules/auth/domain/types/authenticated-user';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';

@ApiTags('addresses')
@ApiBearerAuth('access-token')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(
    private readonly listAddresses: ListAddressesUseCase,
    private readonly createAddress: CreateAddressUseCase,
    private readonly updateAddress: UpdateAddressUseCase,
    private readonly deleteAddress: DeleteAddressUseCase,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AddressResponse[]> {
    const addresses = await this.listAddresses.execute(user.userId);
    return addresses.map((address) => AddressResponse.fromEntity(address));
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateAddressDto,
  ): Promise<AddressResponse> {
    const address = await this.createAddress.execute(user.userId, body);
    return AddressResponse.fromEntity(address);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateAddressDto,
  ): Promise<AddressResponse> {
    const address = await this.updateAddress.execute(user.userId, id, body);
    return AddressResponse.fromEntity(address);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.deleteAddress.execute(user.userId, id);
  }
}
