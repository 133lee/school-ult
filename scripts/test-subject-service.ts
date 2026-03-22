import {
  subjectService,
  ServiceContext,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "@/features/subjects/subject.service";
import prisma from "@/lib/db/prisma";

/**
 * Test script for Subject Service
 *
 * Tests business logic, validation, and authorization in the subject service.
 *
 * Run with: npx tsx scripts/test-subject-service.ts
 */

let createdSubjectId: string | null = null;
let testDepartmentId: string | null = null;

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

async function testSubjectService() {
  console.log("=".repeat(60));
  console.log("Subject Service Test");
  console.log("=".repeat(60));
  console.log();

  try {
    // ==================== SETUP: CREATE TEST DEPARTMENT ====================
    console.log("⚙️  SETUP: Creating test department...");

    const testDepartment = await prisma.department.create({
      data: {
        name: "Test Mathematics Department",
        code: "TESTMATH",
      },
    });
    testDepartmentId = testDepartment.id;

    console.log("✅ Test department created");
    console.log();

    // ==================== TEST 1: CREATE WITH ADMIN ====================
    console.log("📝 TEST 1: Create subject with ADMIN role");

    const subject = await subjectService.createSubject(
      {
        name: "Advanced Mathematics",
        code: "ADVMATH",
        description: "Advanced level mathematics",
        departmentId: testDepartmentId,
      },
      adminContext
    );

    createdSubjectId = subject.id;

    console.log("✅ Subject created with ADMIN");
    console.log(`   Name: ${subject.name}`);
    console.log(`   Code: ${subject.code}`);
    console.log();

    // ==================== TEST 2: CREATE WITH HEAD_TEACHER ====================
    console.log("📝 TEST 2: Create subject with HEAD_TEACHER role");

    const subject2 = await subjectService.createSubject(
      {
        name: "Basic Physics",
        code: "BASPHYS",
      },
      headTeacherContext
    );

    console.log("✅ Subject created with HEAD_TEACHER");
    console.log(`   Name: ${subject2.name}`);
    console.log();

    // Cleanup second subject
    await prisma.subject.delete({ where: { id: subject2.id } });

    // ==================== TEST 3: AUTHORIZATION DENIAL ====================
    console.log("🚫 TEST 3: Authorization denial (TEACHER cannot create)");

    try {
      await subjectService.createSubject(
        {
          name: "Test Subject",
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

    // ==================== TEST 4-7: VALIDATION TESTS ====================
    console.log("🚫 TEST 4: Name validation (empty name)");

    try {
      await subjectService.createSubject({ name: "", code: "EMPTY" }, adminContext);
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log("✅ Validation error caught");
      } else {
        throw error;
      }
    }
    console.log();

    console.log("🚫 TEST 5: Code validation (too short)");

    try {
      await subjectService.createSubject({ name: "Test", code: "A" }, adminContext);
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log("✅ Validation error caught");
      } else {
        throw error;
      }
    }
    console.log();

    console.log("🚫 TEST 6: Duplicate name validation");

    try {
      await subjectService.createSubject(
        { name: "Advanced Mathematics", code: "ADVMATH2" },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log("✅ Duplicate name validation passed");
      } else {
        throw error;
      }
    }
    console.log();

    console.log("🚫 TEST 7: Duplicate code validation");

    try {
      await subjectService.createSubject(
        { name: "Another Mathematics", code: "ADVMATH" },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log("✅ Duplicate code validation passed");
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 8: GET SUBJECTS ====================
    console.log("📋 TEST 8: Get subjects with filters and pagination");

    const result = await subjectService.getSubjects(
      {},
      { page: 1, pageSize: 10 },
      adminContext
    );

    console.log("✅ Subjects retrieved");
    console.log(`   Total: ${result.meta.total}`);
    console.log();

    // ==================== TEST 9: UPDATE SUBJECT ====================
    console.log("✏️  TEST 9: Update subject");

    const updated = await subjectService.updateSubject(
      createdSubjectId!,
      { description: "Updated: Very advanced mathematics" },
      adminContext
    );

    console.log("✅ Subject updated");
    console.log(`   Description: ${updated.description}`);
    console.log();

    // ==================== TEST 10: GET STATISTICS ====================
    console.log("📊 TEST 10: Get subject statistics");

    const stats = await subjectService.getSubjectStatistics(
      createdSubjectId!,
      adminContext
    );

    console.log("✅ Statistics retrieved");
    console.log(`   Teachers: ${stats.statistics.teacherCount}`);
    console.log(`   Grades: ${stats.statistics.gradeCount}`);
    console.log();

    // ==================== TEST 11: DELETE AUTHORIZATION ====================
    console.log("🚫 TEST 11: Delete authorization (HEAD_TEACHER cannot delete)");

    try {
      await subjectService.deleteSubject(createdSubjectId!, headTeacherContext);
      throw new Error("Should have thrown UnauthorizedError");
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        console.log("✅ Delete authorization correctly enforced");
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 12: DELETE SUBJECT ====================
    console.log("🗑️  TEST 12: Delete subject (ADMIN only)");

    const deleted = await subjectService.deleteSubject(
      createdSubjectId!,
      adminContext
    );

    console.log("✅ Subject deleted");
    console.log(`   Deleted: ${deleted.name}`);
    console.log();

    // ==================== TEST 13: VERIFY DELETION ====================
    console.log("🔍 TEST 13: Verify deletion");

    try {
      await subjectService.getSubjectById(createdSubjectId!, adminContext);
      throw new Error("Should have thrown NotFoundError");
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.log("✅ Deletion confirmed");
      } else {
        throw error;
      }
    }

    createdSubjectId = null;
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
    console.log("  ✓ Code validation (too short)");
    console.log("  ✓ Duplicate name validation");
    console.log("  ✓ Duplicate code validation");
    console.log("  ✓ Get subjects with filters");
    console.log("  ✓ Update subject");
    console.log("  ✓ Get statistics");
    console.log("  ✓ Delete authorization (ADMIN only)");
    console.log("  ✓ Delete subject");
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
    // Cleanup
    if (createdSubjectId) {
      try {
        await prisma.subject.delete({ where: { id: createdSubjectId } });
      } catch {}
    }

    if (testDepartmentId) {
      try {
        await prisma.department.delete({ where: { id: testDepartmentId } });
      } catch {}
    }

    await prisma.$disconnect();
  }
}

// Execute the test
testSubjectService();
