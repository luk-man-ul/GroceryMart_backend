import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;

  offerPrice?: number;

  image?: string;

  @IsInt()
  stock: number;

  @IsNotEmpty()
  stockType: string; // quantity / kg

  @IsInt()
  categoryId: number;
}
