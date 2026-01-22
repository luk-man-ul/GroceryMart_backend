import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AdminInventoryService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // GET INVENTORY STOCK LOGS
  // =========================
  async getStockLogs() {
    return this.prisma.stockLog.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }
}
