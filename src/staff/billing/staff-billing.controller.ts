import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../../auth/roles.guard'
import { Roles } from '../../auth/roles.decorator'
import { CreateBillingDto } from './dto/create-billing.dto'
import { StaffBillingService } from './staff-billing.service'

@Controller('staff')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('SHOP_STAFF')
export class StaffBillingController {
  constructor(
    private readonly billingService: StaffBillingService,
  ) {}

  @Post('billing')
  createBilling(@Req() req: any, @Body() dto: CreateBillingDto) {
    const staffId = req.user?.userId ?? req.user?.sub

    if (!staffId) {
      throw new Error('Staff ID missing from JWT')
    }

    return this.billingService.createBilling(
      staffId,
      dto,
    )
  }
}
