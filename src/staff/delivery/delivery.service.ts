import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { OrderStatus } from '@prisma/client'

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // GET ONLINE ORDERS
  // =========================
  async getAssignedOrders() {
    return this.prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.PLACED, OrderStatus.PROCESSING],
        },
      },
      select: {
        id: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  }

  // =========================
  // UPDATE DELIVERY STATUS
  // =========================
  async updateStatus(
    orderId: number,
    newStatus: OrderStatus,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    // ❌ Invalid transitions
    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Order already delivered',
      )
    }

    if (
      newStatus === OrderStatus.PLACED
    ) {
      throw new BadRequestException(
        'Invalid status update',
      )
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    })
  }
}
