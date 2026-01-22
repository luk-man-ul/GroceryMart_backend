import {
  BadRequestException,
  Injectable,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AddToCartDto } from './dto/add-to-cart.dto'
import { UpdateCartDto } from './dto/update-cart.dto'
import { Cart } from '@prisma/client' // 🔥 IMPORTANT

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // GET OR CREATE CART
  // =========================
  private async getOrCreateCart(
    userId: number | null,
    guestId?: string,
  ): Promise<Cart> {
    // ✅ EXPLICIT TYPE — FIXES TS2322 FOREVER
    let cart: Cart | null = null

    if (userId !== null) {
      cart = await this.prisma.cart.findUnique({
        where: { userId },
      })
    } else if (guestId) {
      cart = await this.prisma.cart.findUnique({
        where: { guestId },
      })
    }

    if (cart) return cart

    return this.prisma.cart.create({
      data: {
        userId: userId ?? undefined,
        guestId: guestId ?? undefined,
      },
    })
  }

  // =========================
  // ADD TO CART
  // =========================
  async addToCart(params: {
    userId: number | null
    guestId?: string
    dto: AddToCartDto
  }) {
    const { userId, guestId, dto } = params

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    })

    if (!product || product.trash) {
      throw new BadRequestException('Product not found')
    }

    if (dto.quantity > product.stock) {
      throw new BadRequestException('Insufficient stock')
    }

    const cart = await this.getOrCreateCart(
      userId,
      guestId,
    )

    const existingItem =
      await this.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: dto.productId,
        },
      })

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity:
            existingItem.quantity + dto.quantity,
        },
      })
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    })
  }

  // =========================
  // UPDATE CART ITEM
  // =========================
  async updateCart(params: {
    userId: number | null
    guestId?: string
    dto: UpdateCartDto
  }) {
    const { userId, guestId, dto } = params

    const cart = await this.getOrCreateCart(
      userId,
      guestId,
    )

    const item =
      await this.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: dto.productId,
        },
      })

    if (!item) {
      throw new BadRequestException('Item not in cart')
    }

    return this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: dto.quantity },
    })
  }

  // =========================
  // REMOVE CART ITEM
  // =========================
  async removeFromCart(params: {
    userId: number | null
    guestId?: string
    productId: number
  }) {
    const { userId, guestId, productId } = params

    const cart = await this.getOrCreateCart(
      userId,
      guestId,
    )

    const item =
      await this.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      })

    if (!item) {
      throw new BadRequestException(
        'Item not found in cart',
      )
    }

    return this.prisma.cartItem.delete({
      where: { id: item.id },
    })
  }

  // =========================
  // GET CART
  // =========================
  async getCart(params: {
    userId: number | null
    guestId?: string
  }) {
    const { userId, guestId } = params

    const cart = await this.getOrCreateCart(
      userId,
      guestId,
    )

    const items =
      await this.prisma.cartItem.findMany({
        where: { cartId: cart.id },
        include: { product: true },
        orderBy: { id: 'asc' },
      })

    const formattedItems = items.map(item => {
      const price =
        item.product.offerPrice ??
        item.product.price

      return {
        id: item.id,
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        total: price * item.quantity,
      }
    })

    const totalPrice = formattedItems.reduce(
      (sum, item) => sum + item.total,
      0,
    )

    return {
      id: cart.id,
      items: formattedItems,
      totalPrice,
    }
  }

  // =========================
  // MERGE GUEST CART → USER
  // =========================
  async mergeGuestCart(userId: number, guestId: string) {
    return this.prisma.$transaction(async tx => {
      const guestCart = await tx.cart.findUnique({
        where: { guestId },
        include: { items: true },
      })

      if (
        !guestCart ||
        guestCart.items.length === 0
      ) {
        return { message: 'Guest cart empty' }
      }

      const userCart: Cart =
        (await tx.cart.findUnique({
          where: { userId },
        })) ??
        (await tx.cart.create({
          data: { userId },
        }))

      for (const item of guestCart.items) {
        await tx.cartItem.upsert({
          where: {
            cartId_productId: {
              cartId: userCart.id,
              productId: item.productId,
            },
          },
          update: {
            quantity: { increment: item.quantity },
          },
          create: {
            cartId: userCart.id,
            productId: item.productId,
            quantity: item.quantity,
          },
        })
      }

      await tx.cartItem.deleteMany({
        where: { cartId: guestCart.id },
      })

      await tx.cart.delete({
        where: { id: guestCart.id },
      })

      return { message: 'Cart merged successfully' }
    })
  }
}
