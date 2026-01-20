import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import { DeliveryService } from './delivery.service'
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../../auth/roles.guard'
import { Roles } from '../../auth/roles.decorator'

@Controller('staff/delivery')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('DELIVERY_STAFF')
export class DeliveryController {
  constructor(
    private readonly deliveryService: DeliveryService,
  ) {}

  // GET /staff/delivery/orders
  @Get('orders')
  getOrders() {
    return this.deliveryService.getAssignedOrders()
  }

  // PATCH /staff/delivery/:id/status
  @Patch(':id/status')
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDeliveryStatusDto,
  ) {
    return this.deliveryService.updateStatus(
      id,
      dto.status,
    )
  }
}
