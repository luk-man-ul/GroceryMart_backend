import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service'; // Adjust path if needed

@Injectable()
export class AppService {
  // 1. Inject Prisma Service
  constructor(private prisma: PrismaService) {}

  async getHello(): Promise<string> {
    // 2. Try to connect to the DB and count users
    const userCount = await this.prisma.user.count();
    
    return `Database Connected! Current users: ${userCount}`;
  }
}