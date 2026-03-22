/**
 * Curriculum Management Service Tests
 * Tests the business logic layer (Repository → Service)
 *
 * Run with: npx ts-node tests/curriculum-management-service.test.ts
 */

import { curriculumManagementService } from "../features/curriculum-management/curriculumManagement.service";
import { Role } from "../types/prisma-enums";
import prisma from "../lib/db/prisma";

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// Mock service contexts
const adminContext = {
  userId: "admin-user-id",
  role: Role.ADMIN,
};

const headTeacherContext = {
  userId: "head-teacher-user-id",
  role: Role.HEAD_TEACHER,
};

const teacherContext = {
  userId: "teacher-user-id",
  role: Role.TEACHER,
};

/**
 * Test Suite: Authorization Tests
 */
async function testAuthorization() {
  console.log("\n=== Authorization Tests ===\n");

  // Test 1: ADMIN can view curriculum
  try {
    await curriculumManagementService.getAllGradesWithSubjects(adminContext);
    results.push({
      test: "Authorization - ADMIN can view curriculum",
      passed: true,
      message: "ADMIN successfully accessed getAllGradesWithSubjects",
    });
  } catch (error: any) {
    results.push({
      test: "Authorization - ADMIN can view curriculum",
      passed: false,
      message: `ADMIN denied access: ${error.message}`,
    });
  }

  // Test 2: HEAD_TEACHER can view curriculum
  try {
    await curriculumManagementService.getAllGradesWithSubjects(
      headTeacherContext
    );
    results.push({
      test: "Authorization - HEAD_TEACHER can view curriculum",
      passed: true,
      message: "HEAD_TEACHER successfully accessed getAllGradesWithSubjects",
    });
  } catch (error: any) {
    results.push({
      test: "Authorization - HEAD_TEACHER can view curriculum",
      passed: false,
      message: `HEAD_TEACHER denied access: ${error.message}`,
    });
  }

  // Test 3: TEACHER cannot view curriculum
  try {
    await curriculumManagementService.getAllGradesWithSubjects(teacherContext);
    results.push({
      test: "Authorization - TEACHER cannot view curriculum",
      passed: false,
      message: "TEACHER should not have access but did",
    });
  } catch (error: any) {
    const correctlyDenied = error.message.includes("Insufficient permissions");
    results.push({
      test: "Authorization - TEACHER cannot view curriculum",
      passed: correctlyDenied,
      message: correctlyDenied
        ? "TEACHER correctly denied access"
        : `Unexpected error: ${error.message}`,
    });
  }

  // Test 4: Only ADMIN can modify curriculum
  let testGradeId: string | undefined;
  let testSubjectId: string | undefined;

  // Get test data
  const grades = await curriculumManagementService.getAllGrades(adminContext);
  const subjects =
    await curriculumManagementService.getAllSubjects(adminContext);

  if (grades.length > 0 && subjects.length > 0) {
    testGradeId = grades[0].id;
    testSubjectId = subjects[0].id;

    // Test HEAD_TEACHER cannot modify
    try {
      await curriculumManagementService.assignSubjectToGrade(
        { gradeId: testGradeId, subjectId: testSubjectId, isCore: true },
        headTeacherContext
      );
      results.push({
        test: "Authorization - HEAD_TEACHER cannot modify curriculum",
        passed: false,
        message: "HEAD_TEACHER should not be able to modify but did",
      });
    } catch (error: any) {
      const correctlyDenied = error.message.includes("Only ADMIN");
      results.push({
        test: "Authorization - HEAD_TEACHER cannot modify curriculum",
        passed: correctlyDenied,
        message: correctlyDenied
          ? "HEAD_TEACHER correctly denied modification"
          : `Unexpected error: ${error.message}`,
      });
    }
  }
}

/**
 * Test Suite: Validation Tests
 */
async function testValidation() {
  console.log("\n=== Validation Tests ===\n");

  // Test 1: Reject invalid grade ID
  try {
    await curriculumManagementService.getSubjectsByGrade(
      "invalid-grade-id",
      adminContext
    );
    results.push({
      test: "Validation - Reject invalid grade ID",
      passed: false,
      message: "Invalid grade ID should be rejected but wasn't",
    });
  } catch (error: any) {
    const correctlyRejected = error.message.includes("not found");
    results.push({
      test: "Validation - Reject invalid grade ID",
      passed: correctlyRejected,
      message: correctlyRejected
        ? "Invalid grade ID correctly rejected"
        : `Unexpected error: ${error.message}`,
    });
  }

  // Test 2: Reject invalid subject ID
  const grades = await curriculumManagementService.getAllGrades(adminContext);
  if (grades.length > 0) {
    try {
      await curriculumManagementService.assignSubjectToGrade(
        {
          gradeId: grades[0].id,
          subjectId: "invalid-subject-id",
          isCore: true,
        },
        adminContext
      );
      results.push({
        test: "Validation - Reject invalid subject ID",
        passed: false,
        message: "Invalid subject ID should be rejected but wasn't",
      });
    } catch (error: any) {
      const correctlyRejected = error.message.includes("not found");
      results.push({
        test: "Validation - Reject invalid subject ID",
        passed: correctlyRejected,
        message: correctlyRejected
          ? "Invalid subject ID correctly rejected"
          : `Unexpected error: ${error.message}`,
      });
    }
  }

  // Test 3: Reject duplicate assignment
  const subjects =
    await curriculumManagementService.getAllSubjects(adminContext);
  if (grades.length > 0 && subjects.length > 0) {
    const testGradeId = grades[0].id;
    const testSubjectId = subjects[0].id;

    // First assignment
    try {
      await curriculumManagementService.assignSubjectToGrade(
        { gradeId: testGradeId, subjectId: testSubjectId, isCore: true },
        adminContext
      );
    } catch (error) {
      // Already assigned, that's okay
    }

    // Try duplicate
    try {
      await curriculumManagementService.assignSubjectToGrade(
        { gradeId: testGradeId, subjectId: testSubjectId, isCore: true },
        adminContext
      );
      results.push({
        test: "Validation - Reject duplicate assignment",
        passed: false,
        message: "Duplicate assignment should be rejected but wasn't",
      });
    } catch (error: any) {
      const correctlyRejected = error.message.includes("already assigned");
      results.push({
        test: "Validation - Reject duplicate assignment",
        passed: correctlyRejected,
        message: correctlyRejected
          ? "Duplicate assignment correctly rejected"
          : `Unexpected error: ${error.message}`,
      });
    }
  }
}

/**
 * Test Suite: Business Logic Tests
 */
async function testBusinessLogic() {
  console.log("\n=== Business Logic Tests ===\n");

  const grades = await curriculumManagementService.getAllGrades(adminContext);
  const subjects =
    await curriculumManagementService.getAllSubjects(adminContext);

  if (grades.length === 0 || subjects.length === 0) {
    results.push({
      test: "Business Logic - Skipped (no test data)",
      passed: true,
      message: "No grades or subjects available for testing",
    });
    return;
  }

  const testGradeId = grades[grades.length - 1].id; // Use last grade to avoid conflicts
  const testSubjectIds = subjects.slice(0, 3).map((s) => s.id);

  // Test 1: Bulk assign subjects (clear and create)
  try {
    await curriculumManagementService.bulkAssignSubjectsToGrade(
      {
        gradeId: testGradeId,
        subjects: testSubjectIds.map((id) => ({ subjectId: id, isCore: true })),
      },
      adminContext
    );

    const assigned = await curriculumManagementService.getSubjectsByGrade(
      testGradeId,
      adminContext
    );

    const correctCount = assigned.length === testSubjectIds.length;
    results.push({
      test: "Business Logic - Bulk assign subjects",
      passed: correctCount,
      message: correctCount
        ? `Successfully assigned ${assigned.length} subjects`
        : `Expected ${testSubjectIds.length}, got ${assigned.length}`,
      details: {
        expected: testSubjectIds.length,
        actual: assigned.length,
      },
    });
  } catch (error: any) {
    results.push({
      test: "Business Logic - Bulk assign subjects",
      passed: false,
      message: `Bulk assign failed: ${error.message}`,
    });
  }

  // Test 2: Update isCore flag
  if (testSubjectIds.length > 0) {
    try {
      await curriculumManagementService.updateSubjectCoreStatus(
        testGradeId,
        testSubjectIds[0],
        false,
        adminContext
      );

      const assigned = await curriculumManagementService.getSubjectsByGrade(
        testGradeId,
        adminContext
      );

      const updatedAssignment = assigned.find(
        (a) => a.subject.id === testSubjectIds[0]
      );
      const correctlyUpdated = updatedAssignment?.isCore === false;

      results.push({
        test: "Business Logic - Update isCore flag",
        passed: correctlyUpdated,
        message: correctlyUpdated
          ? "isCore flag updated successfully"
          : "isCore flag not updated correctly",
        details: {
          expected: false,
          actual: updatedAssignment?.isCore,
        },
      });
    } catch (error: any) {
      results.push({
        test: "Business Logic - Update isCore flag",
        passed: false,
        message: `Update failed: ${error.message}`,
      });
    }
  }

  // Test 3: Remove subject from grade
  if (testSubjectIds.length > 0) {
    try {
      await curriculumManagementService.removeSubjectFromGrade(
        testGradeId,
        testSubjectIds[0],
        adminContext
      );

      const assigned = await curriculumManagementService.getSubjectsByGrade(
        testGradeId,
        adminContext
      );

      const stillExists = assigned.some((a) => a.subject.id === testSubjectIds[0]);
      const correctlyRemoved = !stillExists;

      results.push({
        test: "Business Logic - Remove subject from grade",
        passed: correctlyRemoved,
        message: correctlyRemoved
          ? "Subject removed successfully"
          : "Subject still exists after removal",
      });
    } catch (error: any) {
      results.push({
        test: "Business Logic - Remove subject from grade",
        passed: false,
        message: `Remove failed: ${error.message}`,
      });
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║   Curriculum Management Service Tests                ║");
  console.log("╚═══════════════════════════════════════════════════════╝");

  try {
    await testAuthorization();
    await testValidation();
    await testBusinessLogic();

    // Print results
    console.log("\n╔═══════════════════════════════════════════════════════╗");
    console.log("║                    TEST RESULTS                       ║");
    console.log("╚═══════════════════════════════════════════════════════╝\n");

    let passed = 0;
    let failed = 0;

    results.forEach((result) => {
      const status = result.passed ? "✅ PASS" : "❌ FAIL";
      const color = result.passed ? "\x1b[32m" : "\x1b[31m";
      const reset = "\x1b[0m";

      console.log(`${color}${status}${reset} - ${result.test}`);
      console.log(`   ${result.message}`);

      if (result.details) {
        console.log(
          `   Details: ${JSON.stringify(result.details, null, 2).substring(0, 200)}...`
        );
      }

      console.log("");

      if (result.passed) {
        passed++;
      } else {
        failed++;
      }
    });

    // Summary
    console.log("═══════════════════════════════════════════════════════");
    console.log(`Total Tests: ${results.length}`);
    console.log(`\x1b[32mPassed: ${passed}\x1b[0m`);
    console.log(`\x1b[31mFailed: ${failed}\x1b[0m`);
    console.log("═══════════════════════════════════════════════════════\n");

    if (failed > 0) {
      console.log("⚠️  SOME TESTS FAILED - Review issues above");
      console.log("⚠️  Check service authorization and validation logic\n");
      process.exit(1);
    } else {
      console.log("✅ ALL SERVICE TESTS PASSED");
      console.log("✅ Repository → Service layer verified\n");
      process.exit(0);
    }
  } catch (error: any) {
    console.error("\n❌ Test suite failed to run:");
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
runTests();
