-- AlterTable
ALTER TABLE "departments" ADD COLUMN "hodId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "departments_hodId_key" ON "departments"("hodId");

-- CreateIndex
CREATE INDEX "departments_hodId_idx" ON "departments"("hodId");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
