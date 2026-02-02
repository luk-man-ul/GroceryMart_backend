import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../../auth/roles.decorator'
import { RolesGuard } from '../../auth/roles.guard'

@Controller('admin/products')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminProductsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllProducts(
    @Query('trash') trash?: string,
  ) {
    return this.prisma.product.findMany({
      where: {
        trash: trash === 'true',
      },
      include: {
        category: true,
      },
      orderBy: {
        id: 'desc',
      },
    })
  }
}
