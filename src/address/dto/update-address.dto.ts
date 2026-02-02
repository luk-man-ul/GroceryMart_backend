import { IsOptional, IsString, IsBoolean, MinLength } from 'class-validator'

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string

  @IsOptional()
  @IsString()
  @MinLength(10)
  phone?: string

  @IsOptional()
  @IsString()
  house?: string

  @IsOptional()
  @IsString()
  street?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  pincode?: string

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}
