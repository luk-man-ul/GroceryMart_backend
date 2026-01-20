import { Module } from '@nestjs/common'
import { StaffBillingModule } from './billing/staff-billing.module'
import { InventoryModule } from './inventory/inventory.module'
import { DeliveryModule } from './delivery/delivery.module'

@Module({
  imports: [
    StaffBillingModule,
    InventoryModule,
    DeliveryModule,
  ],
})
export class StaffModule {}
