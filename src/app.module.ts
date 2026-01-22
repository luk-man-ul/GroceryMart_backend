import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AdminStaffModule } from './admin/staff/admin-staff.module';
import { StaffBillingModule } from './staff/billing/staff-billing.module'
import { AdminInventoryModule } from './admin/inventory/admin-inventory.module'
import { AdminSalesModule } from './admin/sales/admin-sales.module'
import { DeliveryModule } from './staff/delivery/delivery.module'
import { InventoryModule } from './staff/inventory/inventory.module'
@Module({
  imports: [PrismaModule, AuthModule, CategoriesModule, ProductsModule, CartModule,
     OrdersModule, AdminSalesModule, AdminStaffModule,StaffBillingModule,DeliveryModule,InventoryModule, AdminInventoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
