import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class InventoryService {
  private LOW_STOCK_THRESHOLD = 10

  constructor(private prisma: PrismaService) {}

  // =========================
  // VIEW PRODUCTS + STOCK
  // =========================
  async getAllProducts() {
    const products = await this.prisma.product.findMany({
      where: { trash: false },
      select: {
        id: true,
        name: true,
        stock: true,
        stockType: true,
      },
      orderBy: { name: 'asc' },
    })

    return products.map(p => ({
      ...p,
      lowStock: p.stock < this.LOW_STOCK_THRESHOLD,
    }))
  }

  // =========================
  // ADD STOCK (ONLY ADD)
  // =========================
  async addStock(
    productId: number,
    staffId: number,
    quantity: number,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const oldStock = product.stock
    const newStock = oldStock + quantity

    return this.prisma.$transaction(async tx => {
      // 1️⃣ Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      })

      // 2️⃣ Log stock history
      await tx.stockLog.create({
        data: {
          productId,
          staffId,
          oldStock,
          addedQty: quantity,
          newStock,
        },
      })

      return {
        message: 'Stock added successfully',
        product: updatedProduct,
      }
    })
  }

  // =========================
  // LOW STOCK PRODUCTS
  // =========================
  async getLowStockProducts() {
    return this.prisma.product.findMany({
      where: {
        trash: false,
        stock: { lt: this.LOW_STOCK_THRESHOLD },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        stockType: true,
      },
    })
  }
}
