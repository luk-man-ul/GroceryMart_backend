import { IsString, MinLength, IsOptional, IsBoolean } from 'class-validator'

export class CreateAddressDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsString()
  @MinLength(10)
  phone: string

  @IsString()
  @MinLength(2)
  house: string

  @IsString()
  @MinLength(3)
  street: string

  @IsString()
  @MinLength(2)
  city: string

  @IsString()
  @MinLength(6)
  pincode: string

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}
