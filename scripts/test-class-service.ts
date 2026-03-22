import { ClassStatus } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import {
  classService,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "@/features/classes/class.service";

/**
 * Test script for Class Service validation
 *
 * This script validates the service layer by testing business logic,
 * validation rules, and role-based authorization.
 *
 * Run with: npx tsx scripts/test-class-service.ts
 */

// Test contexts for different roles
const adminContext = {
  userId: "test-admin-001",
  role: "ADMIN" as const,
};

const headTeacherContext = {
  userId: "test-head-teacher-001",
  role: "HEAD_TEACHER" as const,
};

const teacherContext = {
  userId: "test-teacher-001",
  role: "TEACHER" as const,
};

async function testClassService() {
  console.log("=".repeat(60));
  console.log("Class Service Validation Test");
  console.log("=".repeat(60));
  console.log();

  let createdClassId: string | null = null;
  let testGradeId: string | null = null;

  try {
    // ==================== SETUP: GET OR CREATE TEST GRADE ====================
    console.log("⚙️  SETUP: Getting or creating test grade...");

    let testGrade = await prisma.grade.findFirst({
      where: { level: "GRADE_1" },
    });

    if (!testGrade) {
      testGrade = await prisma.grade.create({
        data: {
          level: "GRADE_1",
          name: "Grade 1",
          schoolLevel: "PRIMARY",
          sequence: 1,
        },
      });
    }

    testGradeId = testGrade.id;

    console.log("✅ Test grade ready");
    console.log(`   Grade ID: ${testGradeId}`);
    console.log();

    // ==================== TEST 1: CREATE CLASS (SUCCESS) ====================
    console.log("📝 TEST 1: Creating a class with ADMIN role...");

    const newClass = await classService.createClass(
      {
        gradeId: testGradeId,
        name: "Service Test A",
        capacity: 40,
      },
      adminContext
    );

    createdClassId = newClass.id;

    console.log("✅ Class created successfully");
    console.log(`   ID: ${newClass.id}`);
    console.log(`   Name: ${newClass.name}`);
    console.log(`   Capacity: ${newClass.capacity}`);
    console.log(`   Status: ${newClass.status}`);
    console.log();

    // ==================== TEST 2: HEAD_TEACHER CAN CREATE ====================
    console.log("📝 TEST 2: Verifying HEAD_TEACHER role can create classes...");

    const headTeacherClass = await classService.createClass(
      {
        gradeId: testGradeId,
        name: "Service Test B",
        capacity: 35,
      },
      headTeacherContext
    );

    console.log("✅ HEAD_TEACHER successfully created class");
    console.log(`   Class Name: ${headTeacherClass.name}`);
    console.log();

    // Cleanup head teacher's class
    await classService.deleteClass(headTeacherClass.id, adminContext);

    // ==================== TEST 3: TEACHER CANNOT CREATE ====================
    console.log("🚫 TEST 3: Verifying TEACHER role cannot create classes...");

    try {
      await classService.createClass(
        {
          gradeId: testGradeId,
          name: "Should Fail",
          capacity: 40,
        },
        teacherContext
      );
      throw new Error("TEACHER should not be able to create classes");
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        console.log("✅ TEACHER correctly denied permission to create");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 4: CAPACITY VALIDATION (TOO LOW) ====================
    console.log("🔍 TEST 4: Testing capacity validation (too low)...");

    try {
      await classService.createClass(
        {
          gradeId: testGradeId,
          name: "Too Small",
          capacity: 5, // Below minimum of 10
        },
        adminContext
      );
      throw new Error("Should reject capacity below 10");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("capacity")) {
        console.log("✅ Capacity validation working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 5: CAPACITY VALIDATION (TOO HIGH) ====================
    console.log("🔍 TEST 5: Testing capacity validation (too high)...");

    try {
      await classService.createClass(
        {
          gradeId: testGradeId,
          name: "Too Large",
          capacity: 150, // Above maximum of 100
        },
        adminContext
      );
      throw new Error("Should reject capacity above 100");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("capacity")) {
        console.log("✅ Capacity validation working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 6: NAME VALIDATION (INVALID CHARACTERS) ====================
    console.log("🔍 TEST 6: Testing class name validation (invalid characters)...");

    try {
      await classService.createClass(
        {
          gradeId: testGradeId,
          name: "Class@#$%", // Invalid characters
          capacity: 40,
        },
        adminContext
      );
      throw new Error("Should reject invalid class name");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("name")) {
        console.log("✅ Name validation working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 7: DUPLICATE CLASS NAME ====================
    console.log("🔍 TEST 7: Testing duplicate class name validation...");

    try {
      await classService.createClass(
        {
          gradeId: testGradeId,
          name: "Service Test A", // Same name as first class
          capacity: 40,
        },
        adminContext
      );
      throw new Error("Should reject duplicate class name in same grade");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("already exists")) {
        console.log("✅ Duplicate name validation working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 8: GET CLASSES WITH FILTERS ====================
    console.log("📋 TEST 8: Getting classes with filters and pagination...");

    const result = await classService.getClasses(
      { status: ClassStatus.ACTIVE },
      { page: 1, pageSize: 10 },
      adminContext
    );

    console.log("✅ Classes retrieved successfully");
    console.log(`   Total: ${result.meta.total}`);
    console.log(`   Page: ${result.meta.page}`);
    console.log(`   Retrieved: ${result.data.length} class(es)`);
    console.log();

    // ==================== TEST 9: GET CLASS BY ID ====================
    console.log("🔍 TEST 9: Getting class by ID...");

    const retrievedClass = await classService.getClassById(
      createdClassId,
      adminContext
    );

    console.log("✅ Class retrieved successfully");
    console.log(`   ID: ${retrievedClass?.id}`);
    console.log(`   Name: ${retrievedClass?.name}`);
    console.log();

    // ==================== TEST 10: GET CLASS BY GRADE AND NAME ====================
    console.log("🔍 TEST 10: Getting class by grade and name...");

    const foundClass = await classService.getClassByGradeAndName(
      testGradeId,
      "Service Test A",
      adminContext
    );

    console.log("✅ Class found by grade and name");
    console.log(`   ID: ${foundClass?.id}`);
    console.log(`   Name: ${foundClass?.name}`);
    console.log();

    // ==================== TEST 11: UPDATE CLASS ====================
    console.log("✏️  TEST 11: Updating class...");

    const updatedClass = await classService.updateClass(
      createdClassId,
      {
        capacity: 45,
      },
      adminContext
    );

    console.log("✅ Class updated successfully");
    console.log(`   New Capacity: ${updatedClass.capacity}`);
    console.log();

    // ==================== TEST 12: ARCHIVED CLASS BUSINESS RULE ====================
    console.log("🔒 TEST 12: Testing archived class cannot be modified...");

    // First archive the class
    await classService.changeClassStatus(
      createdClassId,
      ClassStatus.ARCHIVED,
      adminContext
    );

    try {
      await classService.updateClass(
        createdClassId,
        { capacity: 50 },
        adminContext
      );
      throw new Error("Should not be able to modify archived class");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("archived")) {
        console.log("✅ Archived class protection working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 13: CANNOT REACTIVATE ARCHIVED CLASS ====================
    console.log("🔒 TEST 13: Testing cannot reactivate archived class...");

    try {
      await classService.changeClassStatus(
        createdClassId,
        ClassStatus.ACTIVE,
        adminContext
      );
      throw new Error("Should not be able to reactivate archived class");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("reactivate")) {
        console.log("✅ Reactivation protection working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 14: DELETE AUTHORIZATION (ADMIN ONLY) ====================
    console.log("🔐 TEST 14: Verifying only ADMIN can delete classes...");

    try {
      await classService.deleteClass(createdClassId, headTeacherContext);
      throw new Error("HEAD_TEACHER should not be able to delete classes");
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        console.log("✅ DELETE authorization working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 15: DELETE CLASS ====================
    console.log("🗑️  TEST 15: Deleting class (ADMIN)...");

    const deletedClass = await classService.deleteClass(createdClassId, adminContext);

    console.log("✅ Class deleted successfully");
    console.log(`   Deleted: ${deletedClass.name}`);
    console.log();

    // ==================== TEST 16: VERIFY DELETION ====================
    console.log("🔍 TEST 16: Verifying deletion...");

    try {
      await classService.getClassById(createdClassId, adminContext);
      throw new Error("Class should not exist after deletion");
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.log("✅ Deletion verified - class no longer exists");
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All service tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Create with ADMIN role");
    console.log("  ✓ Create with HEAD_TEACHER role");
    console.log("  ✓ Authorization denial (TEACHER cannot create)");
    console.log("  ✓ Capacity validation (too low)");
    console.log("  ✓ Capacity validation (too high)");
    console.log("  ✓ Class name validation (invalid characters)");
    console.log("  ✓ Duplicate class name validation");
    console.log("  ✓ Get classes with filters/pagination");
    console.log("  ✓ Get class by ID");
    console.log("  ✓ Get class by grade and name");
    console.log("  ✓ Update class");
    console.log("  ✓ Archived class business rule");
    console.log("  ✓ Cannot reactivate archived class");
    console.log("  ✓ Delete authorization (ADMIN only)");
    console.log("  ✓ Delete operation");
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
    // Cleanup: Remove test class if it still exists
    if (createdClassId) {
      try {
        await prisma.class.deleteMany({
          where: { id: createdClassId },
        });
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    await prisma.$disconnect();
  }
}

// Execute the test
testClassService();
