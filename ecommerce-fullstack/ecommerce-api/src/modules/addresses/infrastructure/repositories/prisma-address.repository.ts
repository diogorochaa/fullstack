import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Address } from '../../domain/entities/address.entity';
import { AddressRepository } from '../../domain/repositories/address.repository';
import { AddressMapper } from '../mappers/address.mapper';

@Injectable()
export class PrismaAddressRepository implements AddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(address: Address): Promise<void> {
    await this.prisma.address.create({
      data: AddressMapper.toPersistence(address),
    });
  }

  async update(address: Address): Promise<void> {
    const { id, ...data } = AddressMapper.toPersistence(address);

    await this.prisma.address.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.address.delete({ where: { id } });
  }

  async findById(id: string): Promise<Address | null> {
    const address = await this.prisma.address.findUnique({ where: { id } });

    if (!address) {
      return null;
    }

    return AddressMapper.toDomain(address);
  }

  async findByUserId(userId: string): Promise<Address[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses.map((record) => AddressMapper.toDomain(record));
  }

  async clearDefaultForUser(userId: string): Promise<void> {
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }
}
