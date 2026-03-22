import prisma from "../lib/db/prisma";
import { subjectPeriodRequirementRepository } from "../features/timetables/subjectPeriodRequirement.repository";

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
let testGradeId: string;
let testClassId: string;
let testSubject1Id: string;
let testSubject2Id: string;
let testSubject3Id: string;
let testTermId: string;
let testAcademicYearId: string;
let createdRequirementIds: string[] = [];

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

    logSuccess("Setup completed successfully");
  } catch (error: any) {
    logError(`Setup failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Create period requirement
 */
async function testCreate() {
  logSection("TEST: Create Period Requirement");

  try {
    const requirement = await subjectPeriodRequirementRepository.create({
      grade: { connect: { id: testGradeId } },
      subject: { connect: { id: testSubject1Id } },
      periodsPerWeek: 5,
    });

    createdRequirementIds.push(requirement.id);
    logSuccess(
      `Created requirement: ${requirement.subject.name} = ${requirement.periodsPerWeek} periods/week`
    );
    logSuccess("Create works correctly");
  } catch (error: any) {
    logError(`Failed to create: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Find requirements by grade
 */
async function testFindByGrade() {
  logSection("TEST: Find Requirements by Grade");

  try {
    const requirements = await subjectPeriodRequirementRepository.findByGrade(
      testGradeId
    );

    logInfo(`Found ${requirements.length} requirements`);
    requirements.forEach((req) => {
      logSuccess(`${req.subject.name}: ${req.periodsPerWeek} periods/week`);
    });

    if (requirements.length === 0) {
      throw new Error("Expected at least 1 requirement");
    }

    logSuccess("Find by grade works correctly");
  } catch (error: any) {
    logError(`Failed to find by grade: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Find specific grade-subject requirement
 */
async function testFindByGradeAndSubject() {
  logSection("TEST: Find Specific Grade-Subject Requirement");

  try {
    const requirement =
      await subjectPeriodRequirementRepository.findByGradeAndSubject(
        testGradeId,
        testSubject1Id
      );

    if (!requirement) {
      throw new Error("Requirement not found");
    }

    logSuccess(
      `Found: ${requirement.subject.name} = ${requirement.periodsPerWeek} periods/week`
    );
    logSuccess("Find by grade and subject works correctly");
  } catch (error: any) {
    logError(`Failed to find by grade and subject: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Find requirements by subject (across grades)
 */
async function testFindBySubject() {
  logSection("TEST: Find Requirements by Subject");

  try {
    const requirements = await subjectPeriodRequirementRepository.findBySubject(
      testSubject1Id
    );

    logInfo(`Found ${requirements.length} requirements for subject`);
    if (requirements.length === 0) {
      throw new Error("Expected at least 1 requirement");
    }

    logSuccess("Find by subject works correctly");
  } catch (error: any) {
    logError(`Failed to find by subject: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Update requirement
 */
async function testUpdate() {
  logSection("TEST: Update Requirement");

  try {
    const id = createdRequirementIds[0];
    const updated = await subjectPeriodRequirementRepository.update(id, {
      periodsPerWeek: 6,
    });

    if (updated.periodsPerWeek !== 6) {
      throw new Error("Requirement not updated");
    }

    logSuccess(`Updated periods to: ${updated.periodsPerWeek}`);

    // Revert change
    await subjectPeriodRequirementRepository.update(id, {
      periodsPerWeek: 5,
    });

    logSuccess("Update works correctly");
  } catch (error: any) {
    logError(`Failed to update: ${error.message}`);
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
      { subjectId: testSubject2Id, periodsPerWeek: 5 },
      { subjectId: testSubject3Id, periodsPerWeek: 4 },
    ];

    const count = await subjectPeriodRequirementRepository.bulkCreateForGrade(
      testGradeId,
      requirements
    );

    logSuccess(`Bulk created ${count} requirements`);

    if (count !== 2) {
      throw new Error(`Expected 2 requirements, got ${count}`);
    }

    logSuccess("Bulk create works correctly");
  } catch (error: any) {
    logError(`Failed to bulk create: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Get total periods for grade
 */
async function testGetTotalPeriods() {
  logSection("TEST: Get Total Periods for Grade");

  try {
    const total =
      await subjectPeriodRequirementRepository.getTotalPeriodsForGrade(
        testGradeId
      );

    logSuccess(`Total periods required: ${total}`);

    // Should be 5 (Math) + 5 (English) + 4 (Science) = 14
    if (total !== 14) {
      throw new Error(`Expected 14 total periods, got ${total}`);
    }

    logSuccess("Get total periods works correctly");
  } catch (error: any) {
    logError(`Failed to get total periods: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Validate timetable against requirements
 */
async function testValidateTimetable() {
  logSection("TEST: Validate Timetable Against Requirements");

  try {
    // Create some timetable entries (fewer than required)
    const timeSlot = await prisma.timeSlot.create({
      data: {
        startTime: "08:00",
        endTime: "08:40",
        label: "Period 1",
      },
    });

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

    // Create assignment
    await prisma.subjectTeacherAssignment.create({
      data: {
        teacherId: teacher.id,
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
          teacherId: teacher.id,
          timeSlotId: timeSlot.id,
          academicYearId: testAcademicYearId,
          dayOfWeek: ["MONDAY", "TUESDAY", "WEDNESDAY"][i] as any,
        },
      });
    }

    // Validate (should find discrepancies)
    const discrepancies =
      await subjectPeriodRequirementRepository.validateTimetable(
        testClassId,
        testTermId,
        false // secondary
      );

    logInfo(`Found ${discrepancies.length} discrepancies`);
    discrepancies.forEach((disc) => {
      logInfo(
        `Subject ${disc.subjectId}: Required ${disc.required}, Actual ${disc.actual}`
      );
    });

    // Should have discrepancies for all 3 subjects
    if (discrepancies.length !== 3) {
      throw new Error(`Expected 3 discrepancies, got ${discrepancies.length}`);
    }

    // Math should have actual=3, required=5
    const mathDisc = discrepancies.find(
      (d) => d.subjectId === testSubject1Id
    );
    if (!mathDisc || mathDisc.actual !== 3 || mathDisc.required !== 5) {
      throw new Error("Math discrepancy incorrect");
    }

    logSuccess("Validate timetable works correctly");
  } catch (error: any) {
    logError(`Failed to validate timetable: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Duplicate prevention
 */
async function testDuplicatePrevention() {
  logSection("TEST: Duplicate Prevention");

  try {
    // Try to create duplicate requirement (same grade, subject)
    await subjectPeriodRequirementRepository.create({
      grade: { connect: { id: testGradeId } },
      subject: { connect: { id: testSubject1Id } },
      periodsPerWeek: 10,
    });

    logError("Duplicate creation should have failed but didn't");
    throw new Error("Duplicate prevention not working");
  } catch (error: any) {
    if (
      error.message.includes("already exists") ||
      error.message.includes("Unique constraint")
    ) {
      logSuccess("Duplicate prevention works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Delete requirement
 */
async function testDelete() {
  logSection("TEST: Delete Requirement");

  try {
    // Create a temporary requirement for deletion
    const tempSubject = await prisma.subject.create({
      data: {
        name: "Art",
        code: "ART",
        category: "OPTIONAL",
      },
    });

    const tempReq = await subjectPeriodRequirementRepository.create({
      grade: { connect: { id: testGradeId } },
      subject: { connect: { id: tempSubject.id } },
      periodsPerWeek: 2,
    });

    logSuccess(`Created temporary requirement: ${tempReq.periodsPerWeek} periods`);

    // Delete it
    await subjectPeriodRequirementRepository.delete(tempReq.id);
    logSuccess("Deleted temporary requirement");

    // Verify deletion
    const found = await subjectPeriodRequirementRepository.findByGradeAndSubject(
      testGradeId,
      tempSubject.id
    );
    if (found) {
      throw new Error("Requirement still exists after deletion");
    }

    logSuccess("Delete works correctly");
  } catch (error: any) {
    logError(`Failed to delete: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Count requirements
 */
async function testCount() {
  logSection("TEST: Count Requirements");

  try {
    const count = await subjectPeriodRequirementRepository.count({
      gradeId: testGradeId,
    });

    logSuccess(`Count: ${count} requirements`);

    if (count === 0) {
      throw new Error("Expected at least 1 requirement");
    }

    logSuccess("Count works correctly");
  } catch (error: any) {
    logError(`Failed to count: ${error.message}`);
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
    await prisma.secondaryTimetable.deleteMany({
      where: { classId: testClassId },
    });

    // Delete subject-teacher assignments
    await prisma.subjectTeacherAssignment.deleteMany({
      where: { academicYearId: testAcademicYearId },
    });

    // Delete period requirements
    await prisma.subjectPeriodRequirement.deleteMany({
      where: { gradeId: testGradeId },
    });

    // Delete teacher
    await prisma.teacherProfile.deleteMany({});

    // Delete time slots
    await prisma.timeSlot.deleteMany({});

    // Delete subjects
    await prisma.subject.deleteMany({
      where: {
        id: {
          in: [testSubject1Id, testSubject2Id, testSubject3Id],
        },
      },
    });

    // Delete subject Art if exists
    await prisma.subject.deleteMany({
      where: { code: "ART" },
    });

    // Delete term
    await prisma.term.deleteMany({
      where: { academicYearId: testAcademicYearId },
    });

    // Delete class
    await prisma.class.delete({ where: { id: testClassId } });

    // Delete grade
    await prisma.grade.delete({ where: { id: testGradeId } });

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
    await testCreate();
    await testFindByGrade();
    await testFindByGradeAndSubject();
    await testFindBySubject();
    await testUpdate();
    await testBulkCreateForGrade();
    await testGetTotalPeriods();
    await testValidateTimetable();
    await testDuplicatePrevention();
    await testDelete();
    await testCount();

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
