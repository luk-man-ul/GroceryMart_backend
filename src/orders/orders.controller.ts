import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private service: OrdersService) {}

  // USER → Place Order
  @Post()
  placeOrder(@Req() req) {
    return this.service.placeOrder(req.user.sub);
  }

  // USER → View own orders
  @Get('my')
  getMyOrders(@Req() req) {
    return this.service.getMyOrders(req.user.sub);
  }

  // ADMIN → All orders
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  getAllOrders() {
    return this.service.getAllOrders();
  }

  // ADMIN → Update status
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status/:status')
  updateStatus(
    @Param('id') id: string,
    @Param('status') status: OrderStatus,
  ) {
    return this.service.updateOrderStatus(+id, status);
  }
}
