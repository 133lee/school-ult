import { DepartmentStatus } from "@prisma/client";
import {
  departmentService,
  ServiceContext,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "@/features/departments/department.service";
import prisma from "@/lib/db/prisma";

/**
 * Test script for Department Service
 *
 * Tests business logic, validation, and authorization in the department service.
 *
 * Run with: npx tsx scripts/test-department-service.ts
 */

let createdDepartmentId: string | null = null;

// Test contexts
const adminContext: ServiceContext = {
  userId: "admin-user-id",
  role: "ADMIN",
};

const headTeacherContext: ServiceContext = {
  userId: "headteacher-user-id",
  role: "HEAD_TEACHER",
};

const teacherContext: ServiceContext = {
  userId: "teacher-user-id",
  role: "TEACHER",
};

async function testDepartmentService() {
  console.log("=".repeat(60));
  console.log("Department Service Test");
  console.log("=".repeat(60));
  console.log();

  try {
    // ==================== TEST 1: CREATE WITH ADMIN ====================
    console.log("📝 TEST 1: Create department with ADMIN role");

    const department = await departmentService.createDepartment(
      {
        name: "Science Department",
        code: "SCI",
        description: "Handles all science subjects",
      },
      adminContext
    );

    createdDepartmentId = department.id;

    console.log("✅ Department created with ADMIN");
    console.log(`   Name: ${department.name}`);
    console.log(`   Code: ${department.code}`);
    console.log();

    // ==================== TEST 2: CREATE WITH HEAD_TEACHER ====================
    console.log("📝 TEST 2: Create department with HEAD_TEACHER role");

    const department2 = await departmentService.createDepartment(
      {
        name: "Languages Department",
        code: "LANG",
      },
      headTeacherContext
    );

    console.log("✅ Department created with HEAD_TEACHER");
    console.log(`   Name: ${department2.name}`);
    console.log();

    // Cleanup second department
    await prisma.department.delete({ where: { id: department2.id } });

    // ==================== TEST 3: AUTHORIZATION DENIAL ====================
    console.log("🚫 TEST 3: Authorization denial (TEACHER cannot create)");

    try {
      await departmentService.createDepartment(
        {
          name: "Test Department",
          code: "TEST",
        },
        teacherContext
      );
      throw new Error("Should have thrown UnauthorizedError");
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        console.log("✅ Authorization correctly denied");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 4: NAME VALIDATION (EMPTY) ====================
    console.log("🚫 TEST 4: Name validation (empty name)");

    try {
      await departmentService.createDepartment(
        {
          name: "",
          code: "EMPTY",
        },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log("✅ Validation error caught");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 5: NAME VALIDATION (TOO LONG) ====================
    console.log("🚫 TEST 5: Name validation (name too long)");

    try {
      await departmentService.createDepartment(
        {
          name: "A".repeat(101),
          code: "LONG",
        },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log("✅ Validation error caught");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 6: CODE VALIDATION (INVALID FORMAT) ====================
    console.log("🚫 TEST 6: Code validation (invalid characters)");

    try {
      await departmentService.createDepartment(
        {
          name: "Test Department",
          code: "test@123",
        },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log("✅ Validation error caught");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 7: CODE VALIDATION (TOO SHORT) ====================
    console.log("🚫 TEST 7: Code validation (too short)");

    try {
      await departmentService.createDepartment(
        {
          name: "Test Department",
          code: "A",
        },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log("✅ Validation error caught");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 8: DUPLICATE NAME VALIDATION ====================
    console.log("🚫 TEST 8: Duplicate name validation");

    try {
      await departmentService.createDepartment(
        {
          name: "Science Department",
          code: "SCI2",
        },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log("✅ Duplicate name validation passed");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 9: DUPLICATE CODE VALIDATION ====================
    console.log("🚫 TEST 9: Duplicate code validation");

    try {
      await departmentService.createDepartment(
        {
          name: "Another Science Department",
          code: "SCI",
        },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log("✅ Duplicate code validation passed");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 10: GET DEPARTMENTS ====================
    console.log("📋 TEST 10: Get departments with filters and pagination");

    const result = await departmentService.getDepartments(
      { status: DepartmentStatus.ACTIVE },
      { page: 1, pageSize: 10 },
      adminContext
    );

    console.log("✅ Departments retrieved");
    console.log(`   Total: ${result.meta.total}`);
    console.log(`   Page: ${result.meta.page}`);
    console.log();

    // ==================== TEST 11: GET BY ID ====================
    console.log("🔍 TEST 11: Get department by ID");

    const foundDept = await departmentService.getDepartmentById(
      createdDepartmentId!,
      adminContext
    );

    console.log("✅ Department found");
    console.log(`   Name: ${foundDept.name}`);
    console.log();

    // ==================== TEST 12: GET BY CODE ====================
    console.log("🔍 TEST 12: Get department by code");

    const foundByCode = await departmentService.getDepartmentByCode(
      "SCI",
      adminContext
    );

    console.log("✅ Department found by code");
    console.log(`   Name: ${foundByCode?.name}`);
    console.log();

    // ==================== TEST 13: UPDATE DEPARTMENT ====================
    console.log("✏️  TEST 13: Update department");

    const updated = await departmentService.updateDepartment(
      createdDepartmentId!,
      {
        description: "Updated: Handles all science and technology subjects",
      },
      adminContext
    );

    console.log("✅ Department updated");
    console.log(`   Description: ${updated.description}`);
    console.log();

    // ==================== TEST 14: ARCHIVED DEPARTMENT RULE ====================
    console.log("🚫 TEST 14: Archived department business rule");

    // First archive the department
    await prisma.department.update({
      where: { id: createdDepartmentId! },
      data: { status: DepartmentStatus.ARCHIVED },
    });

    try {
      await departmentService.updateDepartment(
        createdDepartmentId!,
        { description: "Trying to update archived dept" },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log("✅ Archived department rule enforced");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }

    // Restore to active for further tests
    await prisma.department.update({
      where: { id: createdDepartmentId! },
      data: { status: DepartmentStatus.ACTIVE },
    });
    console.log();

    // ==================== TEST 15: CANNOT REACTIVATE ARCHIVED ====================
    console.log("🚫 TEST 15: Cannot reactivate archived department");

    // Archive again
    await prisma.department.update({
      where: { id: createdDepartmentId! },
      data: { status: DepartmentStatus.ARCHIVED },
    });

    try {
      await departmentService.changeDepartmentStatus(
        createdDepartmentId!,
        DepartmentStatus.ACTIVE,
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log("✅ Reactivation correctly prevented");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }

    // Restore to active
    await prisma.department.update({
      where: { id: createdDepartmentId! },
      data: { status: DepartmentStatus.ACTIVE },
    });
    console.log();

    // ==================== TEST 16: GET STATISTICS ====================
    console.log("📊 TEST 16: Get department statistics");

    const stats = await departmentService.getDepartmentStatistics(
      createdDepartmentId!,
      adminContext
    );

    console.log("✅ Statistics retrieved");
    console.log(`   Subjects: ${stats.statistics.subjectCount}`);
    console.log(`   Teachers: ${stats.statistics.teacherCount}`);
    console.log();

    // ==================== TEST 17: DELETE AUTHORIZATION ====================
    console.log("🚫 TEST 17: Delete authorization (HEAD_TEACHER cannot delete)");

    try {
      await departmentService.deleteDepartment(
        createdDepartmentId!,
        headTeacherContext
      );
      throw new Error("Should have thrown UnauthorizedError");
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        console.log("✅ Delete authorization correctly enforced");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 18: DELETE DEPARTMENT ====================
    console.log("🗑️  TEST 18: Delete department (ADMIN only)");

    const deleted = await departmentService.deleteDepartment(
      createdDepartmentId!,
      adminContext
    );

    console.log("✅ Department deleted");
    console.log(`   Deleted: ${deleted.name}`);
    console.log();

    // ==================== TEST 19: VERIFY DELETION ====================
    console.log("🔍 TEST 19: Verify deletion");

    try {
      await departmentService.getDepartmentById(
        createdDepartmentId!,
        adminContext
      );
      throw new Error("Should have thrown NotFoundError");
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.log("✅ Deletion confirmed");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }

    createdDepartmentId = null; // Prevent cleanup attempt
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All service tests passed!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Create with ADMIN role");
    console.log("  ✓ Create with HEAD_TEACHER role");
    console.log("  ✓ Authorization denial (TEACHER)");
    console.log("  ✓ Name validation (empty)");
    console.log("  ✓ Name validation (too long)");
    console.log("  ✓ Code validation (invalid format)");
    console.log("  ✓ Code validation (too short)");
    console.log("  ✓ Duplicate name validation");
    console.log("  ✓ Duplicate code validation");
    console.log("  ✓ Get departments with filters");
    console.log("  ✓ Get by ID");
    console.log("  ✓ Get by code");
    console.log("  ✓ Update department");
    console.log("  ✓ Archived department rule");
    console.log("  ✓ Cannot reactivate archived");
    console.log("  ✓ Get statistics");
    console.log("  ✓ Delete authorization (ADMIN only)");
    console.log("  ✓ Delete department");
    console.log("  ✓ Deletion verification");
    console.log();
  } catch (error) {
    console.error();
    console.error("=".repeat(60));
    console.error("❌ Test Failed");
    console.error("=".repeat(60));
    console.error();

    if (error instanceof Error) {
      console.error("Error:", error.message);
      console.error();
      if (error.stack) {
        console.error("Stack trace:");
        console.error(error.stack);
      }
    } else {
      console.error("Unknown error:", error);
    }

    process.exit(1);
  } finally {
    // Cleanup: Delete test department if it still exists
    if (createdDepartmentId) {
      try {
        await prisma.department.delete({
          where: { id: createdDepartmentId },
        });
      } catch {
        // Already deleted
      }
    }

    await prisma.$disconnect();
  }
}

// Execute the test
testDepartmentService();
