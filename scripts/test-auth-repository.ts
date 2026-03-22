/**
 * Auth Repository Validation Script
 *
 * Purpose: Validate CRUD operations on the User/Auth table
 *
 * Architecture: Tests repository layer only (no services, no API, no validation)
 * Database: Uses real Prisma client with actual database
 *
 * Run with: npx tsx scripts/test-auth-repository.ts
 */

import { authRepository } from "@/features/auth/auth.repository";
import prisma from "@/lib/db/prisma";
import { Role } from "@prisma/client";

// Logging utilities
const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  data: (label: string, data: any) => console.log(`  ${label}:`, JSON.stringify(data, null, 2)),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateAuthRepository() {
  let createdUserId: string | null = null;
  let createdTeacherProfileId: string | null = null;

  try {
    log.step("Starting Auth Repository Validation");

    // ========================================
    // STEP 0: Create Test User
    // ========================================
    log.step("Creating test user for validation");

    const testUser = await prisma.user.create({
      data: {
        email: "test.auth.repo@school.test",
        passwordHash: "$2a$10$test.hash.for.validation.only", // Fake hash
        role: Role.TEACHER,
        isActive: true,
      },
    });

    createdUserId = testUser.id;

    log.info(`Created test user: ${testUser.email} (${testUser.id})`);

    // Create teacher profile for the user
    const testProfile = await prisma.teacherProfile.create({
      data: {
        userId: testUser.id,
        staffNumber: "TEST-AUTH-001",
        firstName: "Test",
        lastName: "AuthRepo",
        dateOfBirth: new Date("1985-05-15"),
        gender: "MALE",
        phone: "+260977000001",
        qualification: "DEGREE",
        yearsExperience: 5,
        hireDate: new Date("2020-01-15"),
      },
    });

    createdTeacherProfileId = testProfile.id;

    log.info(`Created teacher profile: ${testProfile.firstName} ${testProfile.lastName}`);

    // ========================================
    // STEP 1: Find User by Email
    // ========================================
    log.step("Finding user by email");

    const userByEmail = await authRepository.findUserByEmail("test.auth.repo@school.test");

    if (!userByEmail) {
      throw new Error("Failed to find user by email");
    }

    log.data("Found User", {
      id: userByEmail.id,
      email: userByEmail.email,
      role: userByEmail.role,
      isActive: userByEmail.isActive,
      hasProfile: !!userByEmail.profile,
      profileName: userByEmail.profile
        ? `${userByEmail.profile.firstName} ${userByEmail.profile.lastName}`
        : null,
    });

    // ========================================
    // STEP 2: Find User by ID
    // ========================================
    log.step(`Finding user by ID: ${createdUserId}`);

    const userById = await authRepository.findUserById(createdUserId);

    if (!userById) {
      throw new Error("Failed to find user by ID");
    }

    log.data("Retrieved User", {
      id: userById.id,
      email: userById.email,
      role: userById.role,
      profile: userById.profile ? {
        staffNumber: userById.profile.staffNumber,
        name: `${userById.profile.firstName} ${userById.profile.lastName}`,
      } : null,
    });

    // ========================================
    // STEP 3: Update Last Login
    // ========================================
    log.step("Updating last login timestamp");

    const beforeUpdate = await prisma.user.findUnique({
      where: { id: createdUserId },
      select: { lastLogin: true },
    });

    await authRepository.updateLastLogin(createdUserId);

    const afterUpdate = await prisma.user.findUnique({
      where: { id: createdUserId },
      select: { lastLogin: true },
    });

    log.data("Last Login Update", {
      before: beforeUpdate?.lastLogin,
      after: afterUpdate?.lastLogin,
    });

    if (!afterUpdate?.lastLogin) {
      throw new Error("Last login was not updated");
    }

    log.info("✓ Verified: Last login timestamp updated");

    // ========================================
    // STEP 4: Check User Active Status
    // ========================================
    log.step("Checking if user is active");

    const isActive = await authRepository.isUserActive(createdUserId);

    log.info(`User is active: ${isActive ? 'Yes' : 'No'}`);

    if (!isActive) {
      throw new Error("User should be active");
    }

    // Test with inactive user
    await prisma.user.update({
      where: { id: createdUserId },
      data: { isActive: false },
    });

    const isStillActive = await authRepository.isUserActive(createdUserId);

    log.info(`After deactivation, user is active: ${isStillActive ? 'Yes (unexpected)' : 'No (expected)'}`);

    if (isStillActive) {
      throw new Error("User should not be active after deactivation");
    }

    // Reactivate for remaining tests
    await prisma.user.update({
      where: { id: createdUserId },
      data: { isActive: true },
    });

    log.info("✓ Verified: Active status check working");

    // ========================================
    // STEP 5: Create Role Permissions
    // ========================================
    log.step("Creating role permissions for TEACHER");

    await prisma.rolePermission.createMany({
      data: [
        { role: Role.TEACHER, permission: "READ_STUDENT" },
        { role: Role.TEACHER, permission: "CREATE_ASSESSMENT" },
        { role: Role.TEACHER, permission: "ENTER_RESULTS" },
      ],
      skipDuplicates: true,
    });

    log.info("Created 3 role permissions for TEACHER");

    // ========================================
    // STEP 6: Create User-Specific Permission
    // ========================================
    log.step("Creating user-specific permission");

    const userPermission = await prisma.userPermission.create({
      data: {
        userId: createdUserId,
        permission: "MANAGE_TIMETABLE",
        grantedById: createdTeacherProfileId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        reason: "Temporary timetable management access for testing",
      },
    });

    log.data("Created User Permission", {
      permission: userPermission.permission,
      expiresAt: userPermission.expiresAt,
      reason: userPermission.reason,
    });

    // ========================================
    // STEP 7: Get User Permissions
    // ========================================
    log.step("Fetching all user permissions (role + user-specific)");

    const permissions = await authRepository.getUserPermissions(createdUserId, Role.TEACHER);

    log.info(`Total permissions for user: ${permissions.length}`);
    log.data("Permissions", permissions);

    // Verify we have both role and user-specific permissions
    const hasRolePermission = permissions.includes("READ_STUDENT");
    const hasUserPermission = permissions.includes("MANAGE_TIMETABLE");

    if (!hasRolePermission) {
      throw new Error("Missing role-based permission");
    }

    if (!hasUserPermission) {
      throw new Error("Missing user-specific permission");
    }

    log.info("✓ Verified: Both role and user-specific permissions retrieved");

    // ========================================
    // STEP 8: Test Expired Permission
    // ========================================
    log.step("Testing expired permission filtering");

    // Create an expired permission
    await prisma.userPermission.create({
      data: {
        userId: createdUserId,
        permission: "DELETE_STUDENT",
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        reason: "Expired permission test",
      },
    });

    const permissionsAfterExpired = await authRepository.getUserPermissions(createdUserId, Role.TEACHER);

    const hasExpiredPermission = permissionsAfterExpired.includes("DELETE_STUDENT");

    log.info(`Expired permission included: ${hasExpiredPermission ? 'Yes (unexpected)' : 'No (expected)'}`);

    if (hasExpiredPermission) {
      throw new Error("Expired permission should not be included");
    }

    log.info("✓ Verified: Expired permissions are filtered out");

    // ========================================
    // STEP 9: Test with Non-Existent User
    // ========================================
    log.step("Testing with non-existent user");

    const nonExistentUser = await authRepository.findUserByEmail("nonexistent@example.com");

    log.info(`Non-existent user found: ${nonExistentUser ? 'Yes (unexpected)' : 'No (expected)'}`);

    if (nonExistentUser) {
      throw new Error("Should not find non-existent user");
    }

    const isNonExistentActive = await authRepository.isUserActive("invalid-user-id-12345");

    log.info(`Invalid user is active: ${isNonExistentActive ? 'Yes (unexpected)' : 'No (expected)'}`);

    if (isNonExistentActive) {
      throw new Error("Invalid user should not be active");
    }

    log.info("✓ Verified: Non-existent user handling working");

    // ========================================
    // SUCCESS
    // ========================================
    log.success("✓ All repository operations validated successfully");
    log.info("Summary:");
    log.info("  - Find by Email: ✓");
    log.info("  - Find by ID: ✓");
    log.info("  - Update Last Login: ✓");
    log.info("  - Check Active Status: ✓");
    log.info("  - Get User Permissions (role-based): ✓");
    log.info("  - Get User Permissions (user-specific): ✓");
    log.info("  - Expired Permission Filtering: ✓");
    log.info("  - Non-existent User Handling: ✓");

  } catch (error) {
    log.error("Validation failed");
    if (error instanceof Error) {
      log.error(error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  } finally {
    // ========================================
    // CLEANUP: Delete Test Data
    // ========================================
    if (createdUserId) {
      log.step("Cleaning up test data");

      // Delete user permissions
      await prisma.userPermission.deleteMany({
        where: { userId: createdUserId },
      });

      // Delete teacher profile
      if (createdTeacherProfileId) {
        await prisma.teacherProfile.delete({
          where: { id: createdTeacherProfileId },
        });
      }

      // Delete user
      await prisma.user.delete({
        where: { id: createdUserId },
      });

      log.info("✓ Test data cleaned up");
    }

    // Clean up role permissions created during test
    await prisma.rolePermission.deleteMany({
      where: {
        role: Role.TEACHER,
        permission: {
          in: ["READ_STUDENT", "CREATE_ASSESSMENT", "ENTER_RESULTS"],
        },
      },
    });

    // ========================================
    // CLEANUP: Close Prisma Connection
    // ========================================
    await prisma.$disconnect();
    log.info("\n→ Prisma connection closed");
  }
}

// Execute validation
validateAuthRepository();
