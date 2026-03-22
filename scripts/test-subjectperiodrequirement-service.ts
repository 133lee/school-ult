import prisma from "../lib/db/prisma";
import {
  subjectPeriodRequirementService,
  ValidationError,
  UnauthorizedError,
  ServiceContext,
} from "../features/timetables/subjectPeriodRequirement.service";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
};

function logSuccess(message: string) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message: string) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logInfo(message: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function logSection(message: string) {
  console.log(`\n${colors.yellow}${"=".repeat(60)}${colors.reset}`);
  console.log(`${colors.yellow}${message}${colors.reset}`);
  console.log(`${colors.yellow}${"=".repeat(60)}${colors.reset}\n`);
}

// Test data storage
let testAcademicYearId: string;
let testGradeId: string;
let testClassId: string;
let testTermId: string;
let testSubject1Id: string;
let testSubject2Id: string;
let testSubject3Id: string;
let testTeacherId: string;

// Test contexts
const adminContext: ServiceContext = {
  userId: "test-admin",
  role: "ADMIN",
};

const hodContext: ServiceContext = {
  userId: "test-hod",
  role: "HOD",
};

const teacherContext: ServiceContext = {
  userId: "test-teacher",
  role: "TEACHER",
};

/**
 * Setup: Create test data
 */
async function setup() {
  logSection("SETUP: Creating Test Data");

  try {
    // Create academic year
    const academicYear = await prisma.academicYear.create({
      data: {
        year: 2024,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        isActive: true,
      },
    });
    testAcademicYearId = academicYear.id;
    logSuccess(`Created academic year: ${academicYear.year}`);

    // Create grade
    const grade = await prisma.grade.create({
      data: {
        name: "Grade 8",
        schoolLevel: "SECONDARY",
        sequence: 8,
      },
    });
    testGradeId = grade.id;
    logSuccess(`Created grade: ${grade.name}`);

    // Create class
    const classData = await prisma.class.create({
      data: {
        name: "Grade 8A",
        gradeId: testGradeId,
        academicYearId: testAcademicYearId,
        capacity: 40,
        status: "ACTIVE",
      },
    });
    testClassId = classData.id;
    logSuccess(`Created class: ${classData.name}`);

    // Create term
    const term = await prisma.term.create({
      data: {
        name: "Term 1",
        academicYearId: testAcademicYearId,
        termType: "TERM_1",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-04-30"),
        isActive: true,
      },
    });
    testTermId = term.id;
    logSuccess(`Created term: ${term.name}`);

    // Create subjects
    const subject1 = await prisma.subject.create({
      data: {
        name: "Mathematics",
        code: "MATH",
        category: "CORE",
      },
    });
    testSubject1Id = subject1.id;
    logSuccess(`Created subject: ${subject1.name}`);

    const subject2 = await prisma.subject.create({
      data: {
        name: "English",
        code: "ENG",
        category: "CORE",
      },
    });
    testSubject2Id = subject2.id;
    logSuccess(`Created subject: ${subject2.name}`);

    const subject3 = await prisma.subject.create({
      data: {
        name: "Science",
        code: "SCI",
        category: "CORE",
      },
    });
    testSubject3Id = subject3.id;
    logSuccess(`Created subject: ${subject3.name}`);

    // Create teacher for timetable validation test
    const teacher = await prisma.teacherProfile.create({
      data: {
        firstName: "Test",
        lastName: "Teacher",
        nrcNumber: "123456/78/1",
        phoneNumber: "+260971234567",
        teacherType: "FULL_TIME",
        status: "ACTIVE",
      },
    });
    testTeacherId = teacher.id;
    logSuccess(`Created teacher: ${teacher.firstName} ${teacher.lastName}`);

    logSuccess("Setup completed successfully");
  } catch (error: any) {
    logError(`Setup failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Create requirement
 */
async function testCreateRequirement() {
  logSection("TEST: Create Requirement");

  try {
    const requirement = await subjectPeriodRequirementService.createRequirement(
      {
        gradeId: testGradeId,
        subjectId: testSubject1Id,
        periodsPerWeek: 5,
      },
      adminContext
    );

    logSuccess(
      `Created requirement: ${requirement.subject.name} = ${requirement.periodsPerWeek} periods/week`
    );
    logSuccess("Create requirement works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Validate periods per week range
 */
async function testValidatePeriodsRange() {
  logSection("TEST: Validate Periods Per Week Range");

  try {
    // Test below minimum
    await subjectPeriodRequirementService.createRequirement(
      {
        gradeId: testGradeId,
        subjectId: testSubject2Id,
        periodsPerWeek: 0, // Below minimum
      },
      adminContext
    );

    logError("Should have rejected periods below minimum");
    throw new Error("Validation not working");
  } catch (error: any) {
    if (error instanceof ValidationError) {
      logSuccess(`Correctly rejected below minimum: ${error.message}`);
    } else {
      throw error;
    }
  }

  try {
    // Test above maximum
    await subjectPeriodRequirementService.createRequirement(
      {
        gradeId: testGradeId,
        subjectId: testSubject2Id,
        periodsPerWeek: 50, // Above maximum (40)
      },
      adminContext
    );

    logError("Should have rejected periods above maximum");
    throw new Error("Validation not working");
  } catch (error: any) {
    if (error instanceof ValidationError) {
      logSuccess(`Correctly rejected above maximum: ${error.message}`);
      logSuccess("Periods range validation works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Validate total doesn't exceed available slots
 */
async function testValidateTotalPeriods() {
  logSection("TEST: Validate Total Periods Limit");

  try {
    // Math already has 5 periods
    // Try to add English with 36 periods (total would be 41 > 40)
    await subjectPeriodRequirementService.createRequirement(
      {
        gradeId: testGradeId,
        subjectId: testSubject2Id,
        periodsPerWeek: 36,
      },
      adminContext
    );

    logError("Should have rejected total exceeding limit");
    throw new Error("Total validation not working");
  } catch (error: any) {
    if (error instanceof ValidationError) {
      logSuccess(`Correctly rejected: ${error.message}`);
      logSuccess("Total periods validation works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Authorization checks
 */
async function testAuthorization() {
  logSection("TEST: Authorization Checks");

  try {
    await subjectPeriodRequirementService.createRequirement(
      {
        gradeId: testGradeId,
        subjectId: testSubject2Id,
        periodsPerWeek: 5,
      },
      teacherContext
    );

    logError("Should have rejected non-authorized user");
    throw new Error("Authorization not working");
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      logSuccess(`Correctly rejected: ${error.message}`);
      logSuccess("Authorization works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Get grade requirements
 */
async function testGetGradeRequirements() {
  logSection("TEST: Get Grade Requirements");

  try {
    const requirements = await subjectPeriodRequirementService.getGradeRequirements(
      testGradeId
    );

    logInfo(`Found ${requirements.length} requirements`);
    if (requirements.length === 0) {
      throw new Error("Expected at least 1 requirement");
    }

    requirements.forEach((req) => {
      logSuccess(`${req.subject.name}: ${req.periodsPerWeek} periods/week`);
    });

    logSuccess("Get grade requirements works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Update requirement
 */
async function testUpdateRequirement() {
  logSection("TEST: Update Requirement");

  try {
    // Get the Math requirement
    const requirement = await subjectPeriodRequirementService.getRequirement(
      testGradeId,
      testSubject1Id
    );

    if (!requirement) {
      throw new Error("Requirement not found");
    }

    // Update periods
    const updated = await subjectPeriodRequirementService.updateRequirement(
      requirement.id,
      6,
      adminContext
    );

    if (updated.periodsPerWeek !== 6) {
      throw new Error("Requirement not updated");
    }

    logSuccess(`Updated periods to: ${updated.periodsPerWeek}`);

    // Revert
    await subjectPeriodRequirementService.updateRequirement(
      requirement.id,
      5,
      adminContext
    );

    logSuccess("Update requirement works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Bulk create for grade
 */
async function testBulkCreateForGrade() {
  logSection("TEST: Bulk Create for Grade");

  try {
    const requirements = [
      { subjectId: testSubject2Id, periodsPerWeek: 5 }, // English
      { subjectId: testSubject3Id, periodsPerWeek: 4 }, // Science
    ];

    const count = await subjectPeriodRequirementService.bulkCreateForGrade(
      testGradeId,
      requirements,
      adminContext
    );

    logSuccess(`Bulk created ${count} requirements`);

    if (count !== 2) {
      throw new Error(`Expected 2 requirements, got ${count}`);
    }

    logSuccess("Bulk create works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Validate bulk total doesn't exceed limit
 */
async function testBulkValidateTotal() {
  logSection("TEST: Bulk Create Total Validation");

  try {
    // Create a new grade
    const grade2 = await prisma.grade.create({
      data: {
        name: "Grade 9",
        schoolLevel: "SECONDARY",
        sequence: 9,
      },
    });

    // Try to bulk create with total exceeding 40
    const requirements = [
      { subjectId: testSubject1Id, periodsPerWeek: 25 },
      { subjectId: testSubject2Id, periodsPerWeek: 20 }, // Total = 45 > 40
    ];

    await subjectPeriodRequirementService.bulkCreateForGrade(
      grade2.id,
      requirements,
      adminContext
    );

    logError("Should have rejected total exceeding limit");
    throw new Error("Bulk total validation not working");
  } catch (error: any) {
    if (error instanceof ValidationError) {
      logSuccess(`Correctly rejected: ${error.message}`);
      logSuccess("Bulk total validation works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Get total periods for grade
 */
async function testGetTotalPeriods() {
  logSection("TEST: Get Total Periods for Grade");

  try {
    const total = await subjectPeriodRequirementService.getTotalPeriodsForGrade(
      testGradeId
    );

    logSuccess(`Total periods required: ${total}`);

    // Should be 5 (Math) + 5 (English) + 4 (Science) = 14
    if (total !== 14) {
      throw new Error(`Expected 14 total periods, got ${total}`);
    }

    logSuccess("Get total periods works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Validate timetable compliance
 */
async function testValidateTimetableCompliance() {
  logSection("TEST: Validate Timetable Compliance");

  try {
    // Create time slot
    const timeSlot = await prisma.timeSlot.create({
      data: {
        startTime: "08:00",
        endTime: "08:40",
        label: "Period 1",
      },
    });

    // Create subject-teacher assignment
    await prisma.subjectTeacherAssignment.create({
      data: {
        teacherId: testTeacherId,
        subjectId: testSubject1Id,
        classId: testClassId,
        academicYearId: testAcademicYearId,
      },
    });

    // Create only 3 periods of Math (required: 5)
    for (let i = 0; i < 3; i++) {
      await prisma.secondaryTimetable.create({
        data: {
          classId: testClassId,
          termId: testTermId,
          subjectId: testSubject1Id,
          teacherId: testTeacherId,
          timeSlotId: timeSlot.id,
          academicYearId: testAcademicYearId,
          dayOfWeek: ["MONDAY", "TUESDAY", "WEDNESDAY"][i] as any,
        },
      });
    }

    // Validate timetable (should find discrepancies)
    const report = await subjectPeriodRequirementService.validateTimetableCompliance(
      testClassId,
      testTermId,
      false // secondary
    );

    logInfo(`Timetable valid: ${report.isValid}`);
    logInfo(`Discrepancies found: ${report.discrepancies.length}`);

    if (report.isValid) {
      throw new Error("Timetable should be invalid");
    }

    report.discrepancies.forEach((disc) => {
      logInfo(
        `  ${disc.subjectName}: Required ${disc.required}, Actual ${disc.actual}, Difference ${disc.difference}`
      );
    });

    // Should have discrepancies for all 3 subjects
    if (report.discrepancies.length !== 3) {
      throw new Error(`Expected 3 discrepancies, got ${report.discrepancies.length}`);
    }

    // Math should show actual=3, required=5, difference=-2
    const mathDisc = report.discrepancies.find(
      (d) => d.subjectName === "Mathematics"
    );
    if (!mathDisc || mathDisc.actual !== 3 || mathDisc.required !== 5) {
      throw new Error("Math discrepancy incorrect");
    }

    logSuccess("Validate timetable compliance works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Get grade compliance summary
 */
async function testGetGradeComplianceSummary() {
  logSection("TEST: Get Grade Compliance Summary");

  try {
    const summary = await subjectPeriodRequirementService.getGradeComplianceSummary(
      testGradeId,
      testTermId
    );

    logInfo(`Classes checked: ${summary.length}`);
    if (summary.length === 0) {
      throw new Error("Expected at least 1 class");
    }

    summary.forEach((result) => {
      logInfo(
        `  ${result.className}: Compliant=${result.isCompliant}, Issues=${result.issueCount}`
      );
    });

    // Our test class should NOT be compliant
    const testClassResult = summary.find((r) => r.classId === testClassId);
    if (!testClassResult) {
      throw new Error("Test class not found in summary");
    }

    if (testClassResult.isCompliant) {
      throw new Error("Test class should not be compliant");
    }

    logSuccess("Get grade compliance summary works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Delete requirement
 */
async function testDeleteRequirement() {
  logSection("TEST: Delete Requirement");

  try {
    // Create a temporary requirement
    const tempSubject = await prisma.subject.create({
      data: {
        name: "Art",
        code: "ART",
        category: "OPTIONAL",
      },
    });

    const tempReq = await subjectPeriodRequirementService.createRequirement(
      {
        gradeId: testGradeId,
        subjectId: tempSubject.id,
        periodsPerWeek: 2,
      },
      adminContext
    );

    logSuccess(`Created temporary requirement: ${tempReq.periodsPerWeek} periods`);

    // Delete it
    await subjectPeriodRequirementService.deleteRequirement(tempReq.id, adminContext);
    logSuccess("Deleted temporary requirement");

    // Verify deletion
    const found = await subjectPeriodRequirementService.getRequirement(
      testGradeId,
      tempSubject.id
    );
    if (found) {
      throw new Error("Requirement still exists after deletion");
    }

    logSuccess("Delete requirement works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Cleanup: Remove test data
 */
async function cleanup() {
  logSection("CLEANUP: Removing Test Data");

  try {
    // Delete timetable entries
    await prisma.secondaryTimetable.deleteMany({});

    // Delete subject-teacher assignments
    await prisma.subjectTeacherAssignment.deleteMany({});

    // Delete period requirements
    await prisma.subjectPeriodRequirement.deleteMany({});

    // Delete teacher
    await prisma.teacherProfile.delete({ where: { id: testTeacherId } });

    // Delete time slots
    await prisma.timeSlot.deleteMany({});

    // Delete subjects
    await prisma.subject.deleteMany({});

    // Delete term
    await prisma.term.deleteMany({
      where: { academicYearId: testAcademicYearId },
    });

    // Delete class
    await prisma.class.deleteMany({ where: { gradeId: testGradeId } });

    // Delete grades
    await prisma.grade.deleteMany({});

    // Delete academic year
    await prisma.academicYear.delete({ where: { id: testAcademicYearId } });

    logSuccess("Cleanup completed successfully");
  } catch (error: any) {
    logError(`Cleanup failed: ${error.message}`);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    await setup();
    await testCreateRequirement();
    await testValidatePeriodsRange();
    await testValidateTotalPeriods();
    await testAuthorization();
    await testGetGradeRequirements();
    await testUpdateRequirement();
    await testBulkCreateForGrade();
    await testBulkValidateTotal();
    await testGetTotalPeriods();
    await testValidateTimetableCompliance();
    await testGetGradeComplianceSummary();
    await testDeleteRequirement();

    logSection("ALL TESTS PASSED ✓");
  } catch (error: any) {
    logSection("TESTS FAILED ✗");
    console.error(error);
    process.exit(1);
  } finally {
    await cleanup();
    await prisma.$disconnect();
  }
}

// Run tests
runTests();
