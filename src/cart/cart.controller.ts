import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { v4 as uuid } from 'uuid'
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard'

import { CartService } from './cart.service'
import { AddToCartDto } from './dto/add-to-cart.dto'
import { UpdateCartDto } from './dto/update-cart.dto'

@UseGuards(OptionalJwtAuthGuard)
@Controller('cart')
export class CartController {

  constructor(private service: CartService) {}

  // =========================
  // ADD TO CART (GUEST / USER)
  // =========================
  @Post('add')
  addToCart(
    @Req() req,
    @Res({ passthrough: true }) res,
    @Body() dto: AddToCartDto,
  ) {
    const userId = req.user?.sub ?? null
    let guestId = req.cookies?.guestId

    // 🔑 Create guestId ONLY for public users
    if (!userId && !guestId) {
      guestId = uuid()
      res.cookie('guestId', guestId, {
        httpOnly: true,
        sameSite: 'lax',
      })
    }

    return this.service.addToCart({ userId, guestId, dto })
  }

  // =========================
  // UPDATE CART ITEM
  // =========================
  @Put('update')
  updateCart(@Req() req, @Body() dto: UpdateCartDto) {
    const userId = req.user?.sub ?? null
    const guestId = userId ? undefined : req.cookies?.guestId

    return this.service.updateCart({ userId, guestId, dto })
  }

  // =========================
  // REMOVE CART ITEM
  // =========================
  @Delete('remove')
  removeFromCart(@Req() req, @Body('productId') productId: number) {
    const userId = req.user?.sub ?? null
    const guestId = userId ? undefined : req.cookies?.guestId

    return this.service.removeFromCart({ userId, guestId, productId })
  }

// =========================
// GET CART (GUEST / USER)
// =========================
@Get()
getCart(
  @Req() req,
  @Res({ passthrough: true }) res,
) {
  const userId = req.user?.sub ?? null
  let guestId = userId ? undefined : req.cookies?.guestId

  // 🔥 FIX: ensure guestId exists BEFORE reading cart
  if (!userId && !guestId) {
    guestId = uuid()
    res.cookie('guestId', guestId, {
      httpOnly: true,
      sameSite: 'lax',
    })
  }

  return this.service.getCart({ userId, guestId })
}
  // =========================
  // MERGE GUEST CART → USER CART
  // =========================
  @UseGuards(AuthGuard('jwt'))
  @Post('merge')
  async mergeGuestCart(
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    const userId = req.user.sub
    const guestId = req.cookies?.guestId

    if (!guestId) {
      return { message: 'No guest cart to merge' }
    }

    const result = await this.service.mergeGuestCart(userId, guestId)

    // 🔥 CRITICAL: remove guest identity AFTER merge
    res.clearCookie('guestId')

    return result
  }
}
