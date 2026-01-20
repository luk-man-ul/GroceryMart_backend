import { IsEnum } from 'class-validator'
import { Role } from '@prisma/client'

export class UpdateStaffRoleDto {
  @IsEnum(Role)
  role: Role
}
