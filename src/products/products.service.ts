import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: dto,
    });
  }

  findAll(search?: string, categoryId?: number) {
    return this.prisma.product.findMany({
      where: {
        trash: false,
        name: search
          ? { contains: search, mode: 'insensitive' }
          : undefined,
        categoryId: categoryId || undefined,
      },
      include: {
        category: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  remove(id: number) {
    return this.prisma.product.update({
      where: { id },
      data: { trash: true },
    });
  }
}
