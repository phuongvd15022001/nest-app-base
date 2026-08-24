-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Product_userId_deletedAt_idx" ON "Product"("userId", "deletedAt");
