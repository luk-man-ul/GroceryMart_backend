import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../../auth/roles.guard'
import { Roles } from '../../auth/roles.decorator'
import { AdminSalesService } from './admin-sales.service'

@Controller('admin/sales')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminSalesController {
  constructor(
    private readonly salesService: AdminSalesService,
  ) {}

  /**
   * GET /admin/sales/summary
   *
   * Supported:
   *  - /summary                → today
   *  - /summary?type=weekly
   *  - /summary?type=monthly
   *  - /summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   */
  @Get('summary')
  getSalesSummary(
    @Query('type') type?: 'daily' | 'weekly' | 'monthly',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.salesService.getSalesSummary({
      type,
      startDate,
      endDate,
    })
  }
}
