import { Module } from '@nestjs/common'
import { StaffController } from './admin-staff.controller'
import { StaffService } from './admin-staff.service'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [StaffController],
  providers: [StaffService],
})
export class AdminStaffModule {}
