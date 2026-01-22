import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AdminInventoryController } from './admin-inventory.controller'
import { AdminInventoryService } from './admin-inventory.service'

@Module({
  controllers: [AdminInventoryController],
  providers: [AdminInventoryService, PrismaService],
})
export class AdminInventoryModule {}
