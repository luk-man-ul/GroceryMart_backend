import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AdminSalesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Sales Summary
   * type: daily | weekly | monthly
   * OR custom startDate + endDate
   */
  async getSalesSummary(params: {
    type?: 'daily' | 'weekly' | 'monthly'
    startDate?: string
    endDate?: string
  }) {
    const { type = 'daily', startDate, endDate } = params

    let start: Date
    let end: Date
    const now = new Date()

    // =========================
    // CUSTOM DATE RANGE (HIGHEST PRIORITY)
    // =========================
    if (startDate && endDate) {
      if (
        isNaN(Date.parse(startDate)) ||
        isNaN(Date.parse(endDate))
      ) {
        throw new BadRequestException(
          'Invalid date format. Use YYYY-MM-DD',
        )
      }

      start = new Date(startDate)
      start.setHours(0, 0, 0, 0)

      end = new Date(endDate)
      end.setHours(23, 59, 59, 999)

      if (start > end) {
        throw new BadRequestException(
          'startDate cannot be after endDate',
        )
      }
    }

    // =========================
    // WEEKLY (MONDAY → SUNDAY)
    // =========================
    else if (type === 'weekly') {
      const day = now.getDay() || 7 // Sunday = 7
      start = new Date(now)
      start.setDate(now.getDate() - day + 1)
      start.setHours(0, 0, 0, 0)

      end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
    }

    // =========================
    // MONTHLY
    // =========================
    else if (type === 'monthly') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      start.setHours(0, 0, 0, 0)

      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
    }

    // =========================
    // DAILY (DEFAULT)
    // =========================
    else {
      start = new Date(now)
      start.setHours(0, 0, 0, 0)

      end = new Date(now)
      end.setHours(23, 59, 59, 999)
    }

    // =========================
    // LOCAL POS SALES
    // =========================
    const localSales = await this.prisma.localSale.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    })

    // =========================
    // ONLINE SALES (DELIVERED)
    // =========================
    const onlineSales = await this.prisma.order.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'DELIVERED',
      },
    })

    const localRevenue = localSales._sum.totalAmount ?? 0
    const onlineRevenue = onlineSales._sum.totalPrice ?? 0

    return {
      range: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
      local: {
        revenue: localRevenue,
        bills: localSales._count.id,
      },
      online: {
        revenue: onlineRevenue,
        orders: onlineSales._count.id,
      },
      totalRevenue: localRevenue + onlineRevenue,
    }
  }
}
