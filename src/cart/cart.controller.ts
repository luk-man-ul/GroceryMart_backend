import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private service: CartService) {}

  @Post('add')
  addToCart(@Req() req, @Body() dto: AddToCartDto) {
    return this.service.addToCart(req.user.sub, dto);
  }

  @Put('update')
  updateCart(@Req() req, @Body() dto: UpdateCartDto) {
    return this.service.updateCart(req.user.sub, dto);
  }

  @Delete('remove')
  removeFromCart(@Req() req, @Body('productId') productId: number) {
    return this.service.removeFromCart(req.user.sub, productId);
  }

  @Get()
  getCart(@Req() req) {
    return this.service.getCart(req.user.sub);
  }
}
