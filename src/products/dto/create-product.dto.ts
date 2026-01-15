import { IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateProductDto {
  @IsString()
  name: string

  @IsNumber()
  price: number

  @IsOptional()
  @IsNumber()
  offerPrice?: number | null

  @IsOptional()
  @IsString()
  image?: string | null

  @IsNumber()
  stock: number

  @IsString()
  stockType: string

  @IsNumber()
  categoryId: number
}
