/**
 * RolePermission Repository Validation Script
 */

import { rolePermissionRepository } from "@/features/permissions/rolePermission.repository";
import prisma from "@/lib/db/prisma";
import { Role, Permission } from "@prisma/client";

const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateRolePermissionRepository() {
  let createdId: string | null = null;

  try {
    log.step("Starting RolePermission Repository Validation");

    // Create
    log.step("Creating role permission");
    const newRP = await rolePermissionRepository.create({
      role: "TEACHER" as Role,
      permission: "READ_STUDENT" as Permission,
    });
    createdId = newRP.id;
    log.info(`Created: ${createdId}`);

    // Find by role
    log.step("Finding permissions by role");
    const byRole = await rolePermissionRepository.findByRole("TEACHER" as Role);
    log.info(`Permissions for TEACHER: ${byRole.length}`);

    // Find by permission
    log.step("Finding roles by permission");
    const byPermission = await rolePermissionRepository.findByPermission("READ_STUDENT" as Permission);
    log.info(`Roles with READ_STUDENT: ${byPermission.length}`);

    // Find by unique
    const unique = await rolePermissionRepository.findByRoleAndPermission(
      "TEACHER" as Role,
      "READ_STUDENT" as Permission
    );
    if (!unique) throw new Error("Should find by unique");
    log.info("✓ Found by unique constraint");

    // Check permission
    const hasPermission = await rolePermissionRepository.hasPermission(
      "TEACHER" as Role,
      "READ_STUDENT" as Permission
    );
    if (!hasPermission) throw new Error("Should have permission");
    log.info("✓ Role has permission");

    // Get all permissions
    const permissions = await rolePermissionRepository.getPermissions("TEACHER" as Role);
    log.info(`Total permissions for TEACHER: ${permissions.length}`);

    // Delete
    log.step("Deleting role permission");
    await rolePermissionRepository.delete(createdId);
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

validateRolePermissionRepository();
