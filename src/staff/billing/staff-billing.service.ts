import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateBillingDto } from './dto/create-billing.dto'

@Injectable()
export class StaffBillingService {
  constructor(private prisma: PrismaService) {}

  async createBilling(staffId: number, dto: CreateBillingDto) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.localSale.create({
        data: {
          staffId,
          totalAmount: dto.totalAmount,
          paymentMode: dto.paymentMode,
        },
      })

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        })

        if (!product || product.stock < item.quantity) {
          throw new BadRequestException('Stock issue')
        }

        await tx.localSaleItem.create({
          data: {
            localSaleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtSale: item.price,
          },
        })

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      return { message: 'Sale completed', saleId: sale.id }
    })
  }
}
