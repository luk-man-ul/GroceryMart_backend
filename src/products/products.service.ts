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

 async findAll(
  search?: string,
  categoryId?: number,
  showTrash = false,
  cursor?: number,
  limit = 10,
) {
  const products = await this.prisma.product.findMany({
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    where: {
      trash: showTrash,
      name: search
        ? { contains: search, mode: 'insensitive' }
        : undefined,
      categoryId: categoryId || undefined,
    },
    include: { category: true },
    orderBy: { id: 'desc' },
  })

  let hasMore = false

  if (products.length > limit) {
    hasMore = true
    products.pop() // remove extra item
  }

  const nextCursor =
    products.length > 0
      ? products[products.length - 1].id
      : null

  return {
    data: products,
    meta: {
      nextCursor,
      hasMore,
    },
  }
}

// ✅ GET ALL PRODUCTS FOR BILLING POS (NO PAGINATION)
// ✅ Get ALL products for Billing POS (NO pagination)
async findAllForBillingPOS() {
  return this.prisma.product.findMany({
    where: {
      trash: false,
    },
    orderBy: {
      id: 'desc',
    },
  })
}





  findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }
  
  update(id: number, dto: any) {
  return this.prisma.product.update({
    where: { id },
    data: dto,
  })
}


  remove(id: number) {
    return this.prisma.product.update({
      where: { id },
      data: { trash: true },
    });
  }

  restore(id: number) {
  return this.prisma.product.update({
    where: { id },
    data: { trash: false },
  })
}



}


