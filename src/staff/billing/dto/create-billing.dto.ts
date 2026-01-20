import { IsArray, IsEnum, IsNumber, IsPositive } from 'class-validator'

export class BillingItemDto {
  @IsNumber()
  productId: number

  @IsNumber()
  @IsPositive()
  quantity: number

  @IsNumber()
  price: number
}

export class CreateBillingDto {
  @IsArray()
  items: BillingItemDto[]

  @IsEnum(['CASH', 'UPI', 'CARD'])
  paymentMode: 'CASH' | 'UPI' | 'CARD'

  @IsNumber()
  totalAmount: number

  discount?: number
  discountType?: 'FLAT' | 'PERCENT'
}

