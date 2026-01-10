import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Get or Create Cart
  private async getOrCreateCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    return cart;
  }

  // 🔹 Add to Cart
  async addToCart(userId: number, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || product.trash) {
      throw new BadRequestException('Product not found');
    }

    if (dto.quantity > product.stock) {
      throw new BadRequestException('Insufficient stock');
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
      },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + dto.quantity,
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    });
  }

  // 🔹 Update Quantity
  async updateCart(userId: number, dto: UpdateCartDto) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
      },
    });

    if (!item) {
      throw new BadRequestException('Item not in cart');
    }

    return this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: dto.quantity },
    });
  }

  // 🔹 Remove Item
  async removeFromCart(userId: number, productId: number) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (!item) {
      throw new BadRequestException('Item not found in cart');
    }

    return this.prisma.cartItem.delete({
      where: { id: item.id },
    });
  }

  // 🔹 View Cart
  async getCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);

    const items = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: true,
      },
    });

    const formattedItems = items.map((item) => {
      const price =
        item.product.offerPrice ?? item.product.price;

      return {
        product: item.product,
        quantity: item.quantity,
        total: price * item.quantity,
      };
    });

    const totalPrice = formattedItems.reduce(
      (sum, item) => sum + item.total,
      0,
    );

    return {
      id: cart.id,
      items: formattedItems,
      totalPrice,
    };
  }
}
