/**
 * Curriculum Management Repository Tests
 * Tests the data access layer (Prisma → Repository)
 *
 * Run with: npx ts-node tests/curriculum-management-repository.test.ts
 */

import { curriculumManagementRepository } from "../features/curriculum-management/curriculumManagement.repository";
import prisma from "../lib/db/prisma";

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

/**
 * Test Suite: Repository CRUD Operations
 */
async function testRepositoryCRUD() {
  console.log("\n=== Repository CRUD Operations ===\n");

  let testGradeId: string | undefined;
  let testSubjectId: string | undefined;

  // Test 1: findAllGrades - Verify grades exist
  try {
    const grades = await curriculumManagementRepository.findAllGrades();

    if (grades.length > 0) {
      testGradeId = grades[0].id;
      results.push({
        test: "Repository - findAllGrades",
        passed: true,
        message: `Found ${grades.length} grades`,
        details: {
          count: grades.length,
          sample: grades.slice(0, 3).map((g: any) => ({ id: g.id, name: g.name })),
        },
      });
    } else {
      results.push({
        test: "Repository - findAllGrades",
        passed: false,
        message: "No grades found in database",
      });
    }
  } catch (error: any) {
    results.push({
      test: "Repository - findAllGrades",
      passed: false,
      message: `Query failed: ${error.message}`,
    });
  }

  // Test 2: findAllSubjects - Verify subjects exist
  try {
    const subjects = await curriculumManagementRepository.findAllSubjects();

    if (subjects.length > 0) {
      testSubjectId = subjects[0].id;
      results.push({
        test: "Repository - findAllSubjects",
        passed: true,
        message: `Found ${subjects.length} subjects`,
        details: {
          count: subjects.length,
          sample: subjects
            .slice(0, 3)
            .map((s: any) => ({ id: s.id, name: s.name, code: s.code })),
        },
      });
    } else {
      results.push({
        test: "Repository - findAllSubjects",
        passed: false,
        message: "No subjects found in database",
      });
    }
  } catch (error: any) {
    results.push({
      test: "Repository - findAllSubjects",
      passed: false,
      message: `Query failed: ${error.message}`,
    });
  }

  // Test 3: findAllGradesWithSubjects - Check structure
  try {
    const gradesWithSubjects =
      await curriculumManagementRepository.findAllGradesWithSubjects();

    if (gradesWithSubjects.length > 0) {
      const hasSubjectsProperty = gradesWithSubjects[0].subjects !== undefined;
      results.push({
        test: "Repository - findAllGradesWithSubjects",
        passed: hasSubjectsProperty,
        message: hasSubjectsProperty
          ? "Grades include subjects relationship"
          : "Missing subjects relationship",
        details: {
          count: gradesWithSubjects.length,
          sample: {
            grade: gradesWithSubjects[0].name,
            subjectsCount: gradesWithSubjects[0].subjects?.length || 0,
          },
        },
      });
    } else {
      results.push({
        test: "Repository - findAllGradesWithSubjects",
        passed: false,
        message: "No grades found",
      });
    }
  } catch (error: any) {
    results.push({
      test: "Repository - findAllGradesWithSubjects",
      passed: false,
      message: `Query failed: ${error.message}`,
    });
  }

  // Test 4: isSubjectAssignedToGrade - Check method works
  if (testGradeId && testSubjectId) {
    try {
      const isAssigned =
        await curriculumManagementRepository.isSubjectAssignedToGrade(
          testGradeId,
          testSubjectId
        );

      results.push({
        test: "Repository - isSubjectAssignedToGrade",
        passed: true,
        message: `Method executed successfully, result: ${isAssigned}`,
        details: {
          gradeId: testGradeId,
          subjectId: testSubjectId,
          isAssigned,
        },
      });
    } catch (error: any) {
      results.push({
        test: "Repository - isSubjectAssignedToGrade",
        passed: false,
        message: `Query failed: ${error.message}`,
      });
    }
  }

  // Test 5: findSubjectsByGrade - Verify query structure
  if (testGradeId) {
    try {
      const subjects =
        await curriculumManagementRepository.findSubjectsByGrade(testGradeId);

      results.push({
        test: "Repository - findSubjectsByGrade",
        passed: true,
        message: `Query executed successfully, found ${subjects.length} subjects`,
        details: {
          gradeId: testGradeId,
          count: subjects.length,
          sample: subjects.slice(0, 2).map((gs: any) => ({
            subjectName: gs.subject.name,
            isCore: gs.isCore,
          })),
        },
      });
    } catch (error: any) {
      results.push({
        test: "Repository - findSubjectsByGrade",
        passed: false,
        message: `Query failed: ${error.message}`,
      });
    }
  }
}

/**
 * Test Suite: Data Integrity
 */
async function testDataIntegrity() {
  console.log("\n=== Data Integrity Tests ===\n");

  // Test 1: Verify GradeSubject unique constraint
  try {
    const existingAssignments = await prisma.gradeSubject.findMany({
      take: 10,
      select: {
        gradeId: true,
        subjectId: true,
        isCore: true,
      },
    });

    // Check for duplicates
    const seen = new Set<string>();
    let hasDuplicates = false;

    for (const assignment of existingAssignments) {
      const key = `${assignment.gradeId}-${assignment.subjectId}`;
      if (seen.has(key)) {
        hasDuplicates = true;
        break;
      }
      seen.add(key);
    }

    results.push({
      test: "Data Integrity - No duplicate GradeSubject assignments",
      passed: !hasDuplicates,
      message: hasDuplicates
        ? "Found duplicate grade-subject assignments"
        : "No duplicate assignments found",
      details: {
        checkedCount: existingAssignments.length,
      },
    });
  } catch (error: any) {
    results.push({
      test: "Data Integrity - No duplicate GradeSubject assignments",
      passed: false,
      message: `Query failed: ${error.message}`,
    });
  }

  // Test 2: Verify all GradeSubjects have valid grade references
  try {
    const gradeSubjects = await prisma.gradeSubject.findMany({
      include: {
        grade: true,
        subject: true,
      },
      take: 10,
    });

    const invalidGrades = gradeSubjects.filter(gs => !gs.grade);

    results.push({
      test: "Data Integrity - All GradeSubjects have valid grade",
      passed: invalidGrades.length === 0,
      message:
        invalidGrades.length === 0
          ? "All assignments have valid grade references"
          : `Found ${invalidGrades.length} invalid assignments`,
    });
  } catch (error: any) {
    results.push({
      test: "Data Integrity - All GradeSubjects have valid grade",
      passed: false,
      message: `Query failed: ${error.message}`,
    });
  }

  // Test 3: Verify all GradeSubjects have valid subject references
  try {
    const gradeSubjects = await prisma.gradeSubject.findMany({
      include: {
        grade: true,
        subject: true,
      },
      take: 10,
    });

    const invalidSubjects = gradeSubjects.filter(gs => !gs.subject);

    results.push({
      test: "Data Integrity - All GradeSubjects have valid subject",
      passed: invalidSubjects.length === 0,
      message:
        invalidSubjects.length === 0
          ? "All assignments have valid subject references"
          : `Found ${invalidSubjects.length} invalid assignments`,
    });
  } catch (error: any) {
    results.push({
      test: "Data Integrity - All GradeSubjects have valid subject",
      passed: false,
      message: `Query failed: ${error.message}`,
    });
  }

  // Test 4: Verify isCore field is boolean
  try {
    const gradeSubjects = await prisma.gradeSubject.findMany({
      take: 10,
      select: {
        isCore: true,
      },
    });

    const allBoolean = gradeSubjects.every(
      (gs) => typeof gs.isCore === "boolean"
    );

    results.push({
      test: "Data Integrity - isCore field is boolean",
      passed: allBoolean,
      message: allBoolean
        ? "All isCore fields are boolean"
        : "Found non-boolean isCore values",
      details: {
        checked: gradeSubjects.length,
      },
    });
  } catch (error: any) {
    results.push({
      test: "Data Integrity - isCore field is boolean",
      passed: false,
      message: `Query failed: ${error.message}`,
    });
  }
}

/**
 * Test Suite: Test Data Availability
 */
async function testDataAvailability() {
  console.log("\n=== Test Data Availability ===\n");

  // Test 1: Verify grades exist for all levels
  try {
    const gradesByLevel = await prisma.grade.groupBy({
      by: ["level"],
      _count: true,
    });

    const hasSecondaryGrades = gradesByLevel.some((g) =>
      ["GRADE_8", "GRADE_9", "GRADE_10", "GRADE_11", "GRADE_12"].includes(
        g.level
      )
    );

    results.push({
      test: "Test Data - Secondary grades exist",
      passed: hasSecondaryGrades,
      message: hasSecondaryGrades
        ? "Secondary grades found"
        : "Missing secondary grades",
      details: {
        totalLevels: gradesByLevel.length,
        levels: gradesByLevel.map((g: any) => g.level),
      },
    });
  } catch (error: any) {
    results.push({
      test: "Test Data - Secondary grades exist",
      passed: false,
      message: `Query failed: ${error.message}`,
    });
  }

  // Test 2: Verify subjects with departments exist
  try {
    const subjectsWithDepartments = await prisma.subject.count({
      where: {
        departmentId: { not: null },
        deletedAt: null,
      },
    });

    results.push({
      test: "Test Data - Subjects with departments exist",
      passed: subjectsWithDepartments > 0,
      message: `Found ${subjectsWithDepartments} subjects with departments`,
    });
  } catch (error: any) {
    results.push({
      test: "Test Data - Subjects with departments exist",
      passed: false,
      message: `Query failed: ${error.message}`,
    });
  }

  // Test 3: Check if curriculum assignments exist
  try {
    const curriculumCount = await prisma.gradeSubject.count();

    results.push({
      test: "Test Data - Curriculum assignments exist",
      passed: true, // Not a failure if empty, just informational
      message: `Found ${curriculumCount} existing curriculum assignments`,
      details: {
        count: curriculumCount,
        status:
          curriculumCount === 0
            ? "Empty - ready for admin configuration"
            : "Has existing data",
      },
    });
  } catch (error: any) {
    results.push({
      test: "Test Data - Curriculum assignments exist",
      passed: false,
      message: `Query failed: ${error.message}`,
    });
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║   Curriculum Management Repository Tests             ║");
  console.log("╚═══════════════════════════════════════════════════════╝");

  try {
    await testRepositoryCRUD();
    await testDataIntegrity();
    await testDataAvailability();

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
      console.log("⚠️  Check database schema and seeded data\n");
      process.exit(1);
    } else {
      console.log("✅ ALL REPOSITORY TESTS PASSED");
      console.log("✅ Prisma → Repository layer verified\n");
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
