import { IsInt } from 'class-validator'

export class PlaceOrderDto {
  @IsInt()
  addressId: number
}
