import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Role } from '@prisma/client'
import { CreateStaffDto } from './dto/create-staff.dto'
import { UpdateStaffRoleDto } from './dto/update-staff-role.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // GET ALL STAFF (ADMIN)
  // =========================
  async getAllStaff() {
    return this.prisma.user.findMany({
      where: {
        role: {
          in: [
            Role.SHOP_STAFF,
            Role.DELIVERY_STAFF,
            Role.INVENTORY_STAFF,
          ],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })
  }

  // =========================
  // CREATE STAFF (ADMIN)
  // =========================
  async createStaff(dto: CreateStaffDto) {
    const allowedRoles: Role[] = [
      Role.SHOP_STAFF,
      Role.DELIVERY_STAFF,
      Role.INVENTORY_STAFF,
    ]

    if (!allowedRoles.includes(dto.role as Role)) {
      throw new BadRequestException('Invalid staff role')
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (existingUser) {
      throw new BadRequestException('Email already exists')
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10)

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })
  }

  // =========================
  // UPDATE STAFF ROLE (ADMIN)
  // =========================
  async updateStaffRole(id: number, dto: UpdateStaffRoleDto) {
    const allowedRoles: Role[] = [
      Role.SHOP_STAFF,
      Role.DELIVERY_STAFF,
      Role.INVENTORY_STAFF,
    ]

    if (!allowedRoles.includes(dto.role as Role)) {
      throw new BadRequestException('Invalid staff role')
    }

    const staff = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!staff) {
      throw new NotFoundException('Staff not found')
    }

    if (staff.role === Role.ADMIN) {
      throw new BadRequestException('Cannot change admin role')
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    })
  }

  // =========================
  // ENABLE / DISABLE STAFF (ADMIN)
  // =========================
  async updateStaffStatus(id: number, isActive: boolean) {
    const staff = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!staff) {
      throw new NotFoundException('Staff not found')
    }

    if (staff.role === Role.ADMIN) {
      throw new BadRequestException('Cannot disable admin')
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    })
  }
}
