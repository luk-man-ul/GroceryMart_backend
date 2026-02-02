import { Module } from '@nestjs/common'
import { AdminProductsController } from './admin-products.controller'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [AdminProductsController],
})
export class AdminProductsModule {}
