-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "defaultCityId" TEXT,
ADD COLUMN     "preferredLocale" TEXT NOT NULL DEFAULT 'pt';

-- CreateIndex
CREATE INDEX "users_defaultCityId_idx" ON "users"("defaultCityId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_defaultCityId_fkey" FOREIGN KEY ("defaultCityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
