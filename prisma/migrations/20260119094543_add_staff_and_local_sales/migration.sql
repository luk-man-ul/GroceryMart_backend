-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'SHOP_STAFF';
ALTER TYPE "Role" ADD VALUE 'DELIVERY_STAFF';
ALTER TYPE "Role" ADD VALUE 'INVENTORY_STAFF';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryStaffId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "LocalSale" (
    "id" SERIAL NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "staffId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalSaleItem" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtSale" DOUBLE PRECISION NOT NULL,
    "localSaleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "LocalSaleItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryStaffId_fkey" FOREIGN KEY ("deliveryStaffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalSale" ADD CONSTRAINT "LocalSale_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalSaleItem" ADD CONSTRAINT "LocalSaleItem_localSaleId_fkey" FOREIGN KEY ("localSaleId") REFERENCES "LocalSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalSaleItem" ADD CONSTRAINT "LocalSaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
