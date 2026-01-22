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

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'

@ApiTags('Cart')
@UseGuards(OptionalJwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private service: CartService) {}

  // =========================
  // ADD TO CART (GUEST / USER)
  // =========================
  @Post('add')
  @ApiOperation({ summary: 'Add product to cart (guest or user)' })
  @ApiResponse({ status: 201, description: 'Product added to cart' })
  addToCart(
    @Req() req,
    @Res({ passthrough: true }) res,
    @Body() dto: AddToCartDto,
  ) {
    // ✅ FIXED
    const userId = req.user?.userId ?? null
    let guestId = req.cookies?.guestId

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
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart updated successfully' })
  updateCart(@Req() req, @Body() dto: UpdateCartDto) {
    // ✅ FIXED
    const userId = req.user?.userId ?? null
    const guestId = userId ? undefined : req.cookies?.guestId

    return this.service.updateCart({ userId, guestId, dto })
  }

  // =========================
  // REMOVE CART ITEM
  // =========================
  @Delete('remove')
  @ApiOperation({ summary: 'Remove product from cart' })
  @ApiResponse({ status: 200, description: 'Product removed from cart' })
  removeFromCart(@Req() req, @Body('productId') productId: number) {
    // ✅ FIXED
    const userId = req.user?.userId ?? null
    const guestId = userId ? undefined : req.cookies?.guestId

    return this.service.removeFromCart({ userId, guestId, productId })
  }

  // =========================
  // GET CART (GUEST / USER)
  // =========================
  @Get()
  @ApiOperation({ summary: 'Get current cart (guest or user)' })
  @ApiResponse({ status: 200, description: 'Current cart details' })
  getCart(@Req() req, @Res({ passthrough: true }) res) {
    // ✅ FIXED
    const userId = req.user?.userId ?? null
    let guestId = userId ? undefined : req.cookies?.guestId

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
  @ApiBearerAuth()
  @Post('merge')
  @ApiOperation({ summary: 'Merge guest cart into user cart' })
  @ApiResponse({ status: 200, description: 'Guest cart merged successfully' })
  async mergeGuestCart(
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    // ✅ FIXED
    const userId = req.user.userId
    const guestId = req.cookies?.guestId

    if (!guestId) {
      return { message: 'No guest cart to merge' }
    }

    const result = await this.service.mergeGuestCart(userId, guestId)

    res.clearCookie('guestId')
    return result
  }
}
