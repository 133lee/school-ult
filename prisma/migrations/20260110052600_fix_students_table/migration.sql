-- Add missing columns to students table
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "vulnerability" "VulnerabilityStatus" NOT NULL DEFAULT 'NOT_VULNERABLE';

-- Remove vulnerability from guardians (it was incorrectly placed there)
ALTER TABLE "guardians" DROP COLUMN IF EXISTS "vulnerability";

-- Add index for vulnerability on students
CREATE INDEX IF NOT EXISTS "students_vulnerability_idx" ON "students"("vulnerability");
