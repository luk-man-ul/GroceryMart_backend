import { IsOptional, IsString, MinLength } from 'class-validator'

export class PlaceOrderDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  phone?: string

  @IsOptional()
  @IsString()
  @MinLength(10)
  address?: string
}
