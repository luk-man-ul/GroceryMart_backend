import { IsOptional, IsString, IsNumber } from 'class-validator'

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsNumber()
  price?: number

  @IsOptional()
  @IsNumber()
  offerPrice?: number | null

  @IsOptional()
  @IsString()
  stockType?: string

  @IsOptional()
  @IsNumber()
  categoryId?: number

  @IsOptional()
  @IsString()
  image?: string | null
}
