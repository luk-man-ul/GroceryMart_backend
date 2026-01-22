import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

 async placeOrder(userId: number) {
  return this.prisma.$transaction(async tx => {
    const cart = await tx.cart.findFirst({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
    })

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty')
    }

    let totalPrice = 0

    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        throw new BadRequestException(
          `Insufficient stock for ${item.product.name}`,
        )
      }

      totalPrice +=
        (item.product.offerPrice ?? item.product.price) *
        item.quantity
    }

    const order = await tx.order.create({
      data: { userId, totalPrice },
    })

    await Promise.all(
      cart.items.map(item =>
        Promise.all([
          tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price:
                item.product.offerPrice ?? item.product.price,
            },
          }),
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          }),
        ]),
      ),
    )

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    return { orderId: order.id }
  })
}


  // 🔹 User Orders
  async getMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

 // 🔹 Admin: All Orders (FIXED FOR RELOAD CONSISTENCY)
async getAllOrders() {
  return this.prisma.order.findMany({
    include: {
      user: true,

      // ✅ INCLUDE DELIVERY STAFF (CRITICAL FIX)
      deliveryStaff: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

  // 🔹 Admin: Update Status
  async updateOrderStatus(orderId: number, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  // 🔹 Delivery Staff: Get assigned orders
async getOrdersForDeliveryStaff(deliveryStaffId: number) {
  return this.prisma.order.findMany({
    where: {
      deliveryStaffId,
      status: {
        in: ['PLACED', 'PROCESSING'],
      },
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })
}

// 🔹 Delivery Staff: Update own order status
async updateDeliveryOrderStatus(
  orderId: number,
  status: OrderStatus,
  deliveryStaffId: number,
) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new BadRequestException('Order not found')
  }

  if (order.deliveryStaffId !== deliveryStaffId) {
    throw new BadRequestException(
      'You are not assigned to this order',
    )
  }

  // Optional: enforce valid transitions
  if (
    order.status === 'DELIVERED' ||
    status === 'PLACED'
  ) {
    throw new BadRequestException(
      'Invalid status transition',
    )
  }

  return this.prisma.order.update({
    where: { id: orderId },
    data: { status },
  })
}


// =========================
// ADMIN → ASSIGN DELIVERY STAFF
// =========================
async assignDeliveryStaff(orderId: number, staffId: number) {
  // 1️⃣ Validate order
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new BadRequestException('Order not found')
  }

  // ❌ Block assignment if already delivered
  if (order.status === 'DELIVERED') {
    throw new BadRequestException(
      'Cannot assign delivery staff to a delivered order',
    )
  }

  // ❌ Block reassignment
  if (order.deliveryStaffId) {
    throw new BadRequestException(
      'Delivery staff already assigned',
    )
  }

  // 2️⃣ Validate staff
  const staff = await this.prisma.user.findUnique({
    where: { id: staffId },
  })

  if (!staff || staff.role !== 'DELIVERY_STAFF') {
    throw new BadRequestException(
      'Invalid delivery staff',
    )
  }

  if (!staff.isActive) {
    throw new BadRequestException(
      'Delivery staff is inactive',
    )
  }

  // 3️⃣ Assign staff (ONE-TIME, TRANSACTIONALLY SAFE)
  return this.prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryStaffId: staffId,
      status: 'PROCESSING',
    },
  })
}

}
