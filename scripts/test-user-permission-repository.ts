/**
 * UserPermission Repository Validation Script
 */

import { userPermissionRepository } from "@/features/permissions/userPermission.repository";
import { teacherRepository } from "@/features/teachers/teacher.repository";
import prisma from "@/lib/db/prisma";
import { Permission } from "@prisma/client";

const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateUserPermissionRepository() {
  let createdId: string | null = null;
  let userId: string | null = null;
  let teacherId: string | null = null;

  try {
    log.step("Starting UserPermission Repository Validation");

    // Get user and teacher
    const users = await prisma.user.findMany({ take: 1 });
    const teachers = await teacherRepository.findMany({ take: 1 });

    if (users.length === 0 || teachers.length === 0) {
      throw new Error("Need users and teachers");
    }

    userId = users[0].id;
    teacherId = teachers[0].id;
    log.info(`Using user: ${users[0].email}`);

    // Create
    log.step("Creating user permission");
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const newUP = await userPermissionRepository.create({
      user: { connect: { id: userId } },
      permission: "MANAGE_PERMISSIONS" as Permission,
      grantedBy: { connect: { id: teacherId } },
      expiresAt: futureDate,
      reason: "Temporary admin access",
    });
    createdId = newUP.id;
    log.info(`Created: ${createdId}`);

    // Find by user
    log.step("Finding permissions by user");
    const byUser = await userPermissionRepository.findByUser(userId);
    log.info(`Permissions for user: ${byUser.length}`);

    // Find active by user
    log.step("Finding active permissions");
    const active = await userPermissionRepository.findActiveByUser(userId);
    log.info(`Active permissions: ${active.length}`);

    // Find by unique
    const unique = await userPermissionRepository.findByUserAndPermission(
      userId,
      "MANAGE_PERMISSIONS" as Permission
    );
    if (!unique) throw new Error("Should find by unique");
    log.info("✓ Found by unique constraint");

    // Check active permission
    const hasActive = await userPermissionRepository.hasActivePermission(
      userId,
      "MANAGE_PERMISSIONS" as Permission
    );
    if (!hasActive) throw new Error("Should have active permission");
    log.info("✓ User has active permission");

    // Get all active permissions
    const permissions = await userPermissionRepository.getActivePermissions(userId);
    log.info(`Total active permissions: ${permissions.length}`);

    // Update
    log.step("Updating permission");
    await userPermissionRepository.update(createdId, { reason: "Extended access" });
    log.info("✓ Updated");

    // Delete
    log.step("Deleting user permission");
    await userPermissionRepository.delete(createdId);
    log.info("✓ Deleted");

    log.success("✓ All operations validated successfully");

  } catch (error) {
    log.error("Validation failed");
    if (error instanceof Error) {
      log.error(error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

validateUserPermissionRepository();
