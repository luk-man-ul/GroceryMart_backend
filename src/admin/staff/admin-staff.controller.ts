import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import { StaffService } from './admin-staff.service'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../../auth/roles.decorator'
import { RolesGuard } from '../../auth/roles.guard'
import { CreateStaffDto } from './dto/create-staff.dto'
import { UpdateStaffRoleDto } from './dto/update-staff-role.dto'
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto'

@Controller('admin/staff')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // GET /admin/staff
  @Get()
  getAllStaff() {
    return this.staffService.getAllStaff()
  }

  // POST /admin/staff
  @Post()
  createStaff(@Body() dto: CreateStaffDto) {
    return this.staffService.createStaff(dto)
  }

  // PATCH /admin/staff/:id/role
  @Patch(':id/role')
  updateStaffRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffRoleDto,
  ) {
    return this.staffService.updateStaffRole(id, dto)
  }

  // PATCH /admin/staff/:id/status
  @Patch(':id/status')
  updateStaffStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffStatusDto,
  ) {
    return this.staffService.updateStaffStatus(id, dto.isActive)
  }
}
