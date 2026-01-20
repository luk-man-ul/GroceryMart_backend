import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { AddStockDto } from './dto/add-stock.dto'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../../auth/roles.guard'
import { Roles } from '../../auth/roles.decorator'

@Controller('staff/inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('INVENTORY_STAFF')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // GET /staff/inventory/products
  @Get('products')
  getProducts() {
    return this.inventoryService.getAllProducts()
  }

  // PATCH /staff/inventory/:id/add-stock
  @Patch(':id/add-stock')
  addStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddStockDto,
    @Req() req,
  ) {
    return this.inventoryService.addStock(
      id,
      req.user.id,
      dto.quantity,
    )
  }

  // GET /staff/inventory/low-stock
  @Get('low-stock')
  getLowStock() {
    return this.inventoryService.getLowStockProducts()
  }
}
