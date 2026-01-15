import {
  BadRequestException,
  Injectable,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AddToCartDto } from './dto/add-to-cart.dto'
import { UpdateCartDto } from './dto/update-cart.dto'

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Get or Create Cart (USER or GUEST) — PRISMA SAFE
  private async getOrCreateCart(
    userId: number | null,
    guestId?: string,
  ) {
    let where: any = {}

    if (userId !== null) {
      where = { userId }
    } else if (guestId) {
      where = { guestId }
    }

    let cart = await this.prisma.cart.findFirst({
      where,
    })

    if (cart) {
      return cart
    }

    const data: any = {}

    if (userId !== null) {
      data.userId = userId
    }

    if (guestId) {
      data.guestId = guestId
    }

    return this.prisma.cart.create({
      data,
    })
  }

  // 🔹 Add to Cart
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

    const cart = await this.getOrCreateCart(userId, guestId)

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
      },
    })

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + dto.quantity,
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

  // 🔹 Update Quantity
  async updateCart(params: {
    userId: number | null
    guestId?: string
    dto: UpdateCartDto
  }) {
    const { userId, guestId, dto } = params

    const cart = await this.getOrCreateCart(userId, guestId)

    const item = await this.prisma.cartItem.findFirst({
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

  // 🔹 Remove Item
  async removeFromCart(params: {
    userId: number | null
    guestId?: string
    productId: number
  }) {
    const { userId, guestId, productId } = params

    const cart = await this.getOrCreateCart(userId, guestId)

    const item = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    })

    if (!item) {
      throw new BadRequestException('Item not found in cart')
    }

    return this.prisma.cartItem.delete({
      where: { id: item.id },
    })
  }

  // 🔹 View Cart (FIXED: return cartItem id + productId)
  async getCart(params: {
    userId: number | null
    guestId?: string
  }) {
    const { userId, guestId } = params

    const cart = await this.getOrCreateCart(userId, guestId)

   const items = await this.prisma.cartItem.findMany({
  where: { cartId: cart.id },
  orderBy: { id: 'asc' }, // ✅ STABLE ORDER
  include: { product: true },
})

    const formattedItems = items.map(item => {
      const price =
        item.product.offerPrice ?? item.product.price

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

  async mergeGuestCart(userId: number, guestId: string) {
  const guestCart = await this.prisma.cart.findFirst({
    where: { guestId },
    include: { items: true },
  })

  if (!guestCart || guestCart.items.length === 0) {
    return { message: 'Guest cart empty' }
  }

  const userCart = await this.getOrCreateCart(userId)

  for (const item of guestCart.items) {
    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId: userCart.id,
        productId: item.productId,
      },
    })

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + item.quantity,
        },
      })
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          quantity: item.quantity,
        },
      })
    }
  }

  // clear guest cart
  await this.prisma.cartItem.deleteMany({
    where: { cartId: guestCart.id },
  })

  await this.prisma.cart.delete({
    where: { id: guestCart.id },
  })

  return { message: 'Guest cart merged into user cart' }
}

}
