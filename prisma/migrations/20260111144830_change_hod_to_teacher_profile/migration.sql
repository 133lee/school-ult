-- AlterTable: Change HOD relation from User to TeacherProfile
-- Step 1: Add new column hodTeacherId
ALTER TABLE "departments" ADD COLUMN "hodTeacherId" TEXT;

-- Step 2: Migrate existing data from hodId (User) to hodTeacherId (TeacherProfile)
-- Only migrate if the User has an associated TeacherProfile
UPDATE "departments" d
SET "hodTeacherId" = tp.id
FROM "teacher_profiles" tp
WHERE tp."userId" = d."hodId"
  AND d."hodId" IS NOT NULL;

-- Step 3: Drop the old hodId column and its index
DROP INDEX IF EXISTS "departments_hodId_key";
DROP INDEX IF EXISTS "departments_hodId_idx";
ALTER TABLE "departments" DROP COLUMN IF EXISTS "hodId";

-- Step 4: Add unique constraint on hodTeacherId
ALTER TABLE "departments" ADD CONSTRAINT "departments_hodTeacherId_key" UNIQUE ("hodTeacherId");

-- Step 5: Add foreign key constraint
ALTER TABLE "departments"
ADD CONSTRAINT "departments_hodTeacherId_fkey"
FOREIGN KEY ("hodTeacherId")
REFERENCES "teacher_profiles"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Step 6: Create index on hodTeacherId for performance
CREATE INDEX "departments_hodTeacherId_idx" ON "departments"("hodTeacherId");
