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
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let totalPrice = 0;

    // Validate stock & calculate total
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        throw new BadRequestException(
          `Insufficient stock for ${item.product.name}`,
        );
      }

      const price =
        item.product.offerPrice ?? item.product.price;

      totalPrice += price * item.quantity;
    }

    // Transaction (VERY IMPORTANT)
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Create Order
      const order = await tx.order.create({
        data: {
          userId,
          totalPrice,
          status: 'PLACED',
        },
      });

      // 2️⃣ Create Order Items
      for (const item of cart.items) {
        const price =
          item.product.offerPrice ?? item.product.price;

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price,
          },
        });

        // 3️⃣ Reduce Stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 4️⃣ Clear Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return {
        message: 'Order placed successfully',
        orderId: order.id,
      };
    });
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

  // 🔹 Admin: All Orders
  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: true,
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

  // 🔹 Admin: Update Status
  async updateOrderStatus(orderId: number, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
