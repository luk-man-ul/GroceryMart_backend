import { Module } from '@nestjs/common'
import { StaffBillingController } from './staff-billing.controller'
import { StaffBillingService } from './staff-billing.service'
import { PrismaService } from '../../prisma/prisma.service'

@Module({
  controllers: [StaffBillingController],
  providers: [StaffBillingService, PrismaService],
})
export class StaffBillingModule {}
