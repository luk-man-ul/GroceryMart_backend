import {
  Injectable,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAddressDto } from './dto/create-address.dto'
import { UpdateAddressDto } from './dto/update-address.dto'

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  // ================= CREATE =================
  async create(userId: number, dto: CreateAddressDto) {
    // Rule: only ONE default address per user
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    return this.prisma.address.create({
      data: {
        userId,
        name: dto.name,
        phone: dto.phone,
        house: dto.house,
        street: dto.street,
        city: dto.city,
        pincode: dto.pincode,
        isDefault: dto.isDefault ?? false,
      },
    })
  }

  // ================= LIST =================
  async findAll(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    })
  }

  // ================= UPDATE / SET DEFAULT =================
  async update(
    userId: number,
    addressId: number,
    dto: UpdateAddressDto,
  ) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    })

    if (!address) {
      throw new BadRequestException(
        'Address not found',
      )
    }

    // If setting as default → unset others
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data: {
        name: dto.name,
        phone: dto.phone,
        house: dto.house,
        street: dto.street,
        city: dto.city,
        pincode: dto.pincode,
        isDefault: dto.isDefault,
      },
    })
  }

  // ================= DELETE (SAFE) =================
  async remove(userId: number, addressId: number) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
      include: { orders: true },
    })

    if (!address) {
      throw new BadRequestException(
        'Address not found',
      )
    }

    if (address.orders.length > 0) {
      throw new BadRequestException(
        'Address used in orders cannot be deleted',
      )
    }

    return this.prisma.address.delete({
      where: { id: addressId },
    })
  }
}
