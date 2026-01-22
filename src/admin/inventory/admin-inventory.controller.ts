import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../../auth/roles.guard'
import { Roles } from '../../auth/roles.decorator'
import { AdminInventoryService } from './admin-inventory.service'

@Controller('admin/inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminInventoryController {
  constructor(
    private readonly inventoryService: AdminInventoryService,
  ) {}

  // GET /admin/inventory/logs
  @Get('logs')
  getInventoryLogs() {
    return this.inventoryService.getStockLogs()
  }
}
