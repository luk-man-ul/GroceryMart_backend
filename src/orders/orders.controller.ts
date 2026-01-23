import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import { OrdersService } from './orders.service'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { OrderStatus } from '@prisma/client'
import { PlaceOrderDto } from './dto/place-order.dto'

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private service: OrdersService) {}

  // ================= USER → Place Order =================
  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order placed successfully',
  })
  placeOrder(
    @Req() req,
    @Body() dto: PlaceOrderDto,
  ) {
    return this.service.placeOrder(
      req.user.userId,
      dto,
    )
  }

  // ================= USER → View own orders =================
  @Get('my')
  @ApiOperation({ summary: 'Get logged-in user orders' })
  @ApiResponse({
    status: 200,
    description: 'List of user orders',
  })
  getMyOrders(@Req() req) {
    return this.service.getMyOrders(req.user.userId)
  }

  // ================= USER → View single order details =================
  @Get(':id')
  @ApiOperation({ summary: 'Get single order details (User)' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Order details',
  })
  getOrderById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    return this.service.getOrderById(
      id,
      req.user.userId,
    )
  }

  // ================= ADMIN → All orders =================
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all orders',
  })
  getAllOrders() {
    return this.service.getAllOrders()
  }

  // ================= ADMIN → Update status =================
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiParam({
    name: 'status',
    enum: OrderStatus,
    description: 'New order status',
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  updateStatus(
    @Param('id') id: string,
    @Param('status') status: OrderStatus,
  ) {
    return this.service.updateOrderStatus(+id, status)
  }

  // ================= DELIVERY STAFF → Get assigned orders =================
  @UseGuards(RolesGuard)
  @Roles('DELIVERY_STAFF')
  @Get('delivery/my')
  getMyDeliveryOrders(@Req() req) {
    return this.service.getOrdersForDeliveryStaff(
      req.user.userId,
    )
  }

  // ================= DELIVERY STAFF → Update own order status =================
  @UseGuards(RolesGuard)
  @Roles('DELIVERY_STAFF')
  @Patch('delivery/:id/status')
  updateDeliveryStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Req() req,
  ) {
    return this.service.updateDeliveryOrderStatus(
      +id,
      status,
      req.user.userId,
    )
  }

  // ================= ADMIN → Assign delivery staff =================
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/assign-delivery/:staffId')
  assignDeliveryStaff(
    @Param('id', ParseIntPipe) orderId: number,
    @Param('staffId', ParseIntPipe) staffId: number,
  ) {
    return this.service.assignDeliveryStaff(orderId, staffId)
  }
}
