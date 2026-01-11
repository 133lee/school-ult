-- Add missing fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "hasDefaultPassword" BOOLEAN NOT NULL DEFAULT false;

-- Add missing fields to teacher_profiles table
ALTER TABLE "teacher_profiles" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Add missing fields to subjects table
ALTER TABLE "subjects" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
