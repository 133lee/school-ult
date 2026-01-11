-- Remove HOD from Role enum
-- HOD is a position (Department.hodTeacherId), not a system role

-- Step 1: Safety check - ensure no users have HOD role
-- This will fail the migration if any users have role = 'HOD'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE role = 'HOD') THEN
    RAISE EXCEPTION 'Cannot remove HOD from Role enum: users with HOD role still exist. Please update them to TEACHER role first.';
  END IF;
END $$;

-- Step 2: Delete any HOD role permissions (if any exist)
DELETE FROM "role_permissions" WHERE role = 'HOD';

-- Step 3: Drop the defaults temporarily
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

-- Step 4: Remove HOD value from the Role enum
ALTER TYPE "Role" RENAME TO "Role_old";

CREATE TYPE "Role" AS ENUM ('ADMIN', 'HEAD_TEACHER', 'DEPUTY_HEAD', 'TEACHER', 'CLERK');

-- Update both tables that use the Role enum
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role");
ALTER TABLE "role_permissions" ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role");

DROP TYPE "Role_old";

-- Step 5: Restore the default
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'TEACHER';
