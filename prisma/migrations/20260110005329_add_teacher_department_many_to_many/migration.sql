-- CreateTable
CREATE TABLE "teacher_departments" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teacher_departments_teacherId_idx" ON "teacher_departments"("teacherId");

-- CreateIndex
CREATE INDEX "teacher_departments_departmentId_idx" ON "teacher_departments"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_departments_teacherId_departmentId_key" ON "teacher_departments"("teacherId", "departmentId");

-- AddForeignKey
ALTER TABLE "teacher_departments" ADD CONSTRAINT "teacher_departments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_departments" ADD CONSTRAINT "teacher_departments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey (remove old single department relationship)
ALTER TABLE "teacher_profiles" DROP CONSTRAINT IF EXISTS "teacher_profiles_departmentId_fkey";

-- DropIndex (remove old department index)
DROP INDEX IF EXISTS "teacher_profiles_departmentId_idx";

-- AlterTable (remove departmentId column)
ALTER TABLE "teacher_profiles" DROP COLUMN IF EXISTS "departmentId";
