import { Module } from '@nestjs/common'
import { AdminSalesController } from './admin-sales.controller'
import { AdminSalesService } from './admin-sales.service'
import { PrismaService } from '../../prisma/prisma.service'

@Module({
  controllers: [AdminSalesController],
  providers: [AdminSalesService, PrismaService],
})
export class AdminSalesModule {}
