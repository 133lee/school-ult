import prisma from "../lib/db/prisma";
import {
  secondaryTimetableService,
  ValidationError,
  UnauthorizedError,
  ClashError,
  ServiceContext,
} from "../features/timetables/secondaryTimetable.service";
import { DayOfWeek } from "@prisma/client";

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
let testSecondaryGradeId: string;
let testPrimaryGradeId: string;
let testSecondaryClassId: string;
let testSecondaryClass2Id: string;
let testPrimaryClassId: string;
let testTermId: string;
let testSubject1Id: string;
let testSubject2Id: string;
let testTimeSlot1Id: string;
let testTimeSlot2Id: string;
let testTeacher1Id: string;
let testTeacher2Id: string;

// Test contexts
const adminContext: ServiceContext = {
  userId: "test-admin",
  role: "ADMIN",
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

    // Create SECONDARY grade
    const secondaryGrade = await prisma.grade.create({
      data: {
        name: "Grade 10",
        schoolLevel: "SECONDARY",
        sequence: 10,
      },
    });
    testSecondaryGradeId = secondaryGrade.id;
    logSuccess(`Created SECONDARY grade: ${secondaryGrade.name}`);

    // Create PRIMARY grade (for negative test)
    const primaryGrade = await prisma.grade.create({
      data: {
        name: "Grade 5",
        schoolLevel: "PRIMARY",
        sequence: 5,
      },
    });
    testPrimaryGradeId = primaryGrade.id;
    logSuccess(`Created PRIMARY grade: ${primaryGrade.name}`);

    // Create SECONDARY classes
    const secondaryClass1 = await prisma.class.create({
      data: {
        name: "Grade 10A",
        gradeId: testSecondaryGradeId,
        academicYearId: testAcademicYearId,
        capacity: 40,
        status: "ACTIVE",
      },
    });
    testSecondaryClassId = secondaryClass1.id;
    logSuccess(`Created SECONDARY class: ${secondaryClass1.name}`);

    const secondaryClass2 = await prisma.class.create({
      data: {
        name: "Grade 10B",
        gradeId: testSecondaryGradeId,
        academicYearId: testAcademicYearId,
        capacity: 40,
        status: "ACTIVE",
      },
    });
    testSecondaryClass2Id = secondaryClass2.id;
    logSuccess(`Created SECONDARY class: ${secondaryClass2.name}`);

    // Create PRIMARY class (for negative test)
    const primaryClass = await prisma.class.create({
      data: {
        name: "Grade 5A",
        gradeId: testPrimaryGradeId,
        academicYearId: testAcademicYearId,
        capacity: 40,
        status: "ACTIVE",
      },
    });
    testPrimaryClassId = primaryClass.id;
    logSuccess(`Created PRIMARY class: ${primaryClass.name}`);

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
        name: "Physics",
        code: "PHY",
        category: "CORE",
      },
    });
    testSubject1Id = subject1.id;
    logSuccess(`Created subject: ${subject1.name}`);

    const subject2 = await prisma.subject.create({
      data: {
        name: "Chemistry",
        code: "CHEM",
        category: "CORE",
      },
    });
    testSubject2Id = subject2.id;
    logSuccess(`Created subject: ${subject2.name}`);

    // Create time slots
    const timeSlot1 = await prisma.timeSlot.create({
      data: {
        startTime: "08:00",
        endTime: "08:40",
        label: "Period 1",
      },
    });
    testTimeSlot1Id = timeSlot1.id;
    logSuccess(`Created time slot: ${timeSlot1.label}`);

    const timeSlot2 = await prisma.timeSlot.create({
      data: {
        startTime: "08:40",
        endTime: "09:20",
        label: "Period 2",
      },
    });
    testTimeSlot2Id = timeSlot2.id;
    logSuccess(`Created time slot: ${timeSlot2.label}`);

    // Create teachers
    const teacher1 = await prisma.teacherProfile.create({
      data: {
        firstName: "John",
        lastName: "Smith",
        nrcNumber: "123456/78/1",
        phoneNumber: "+260971234567",
        teacherType: "FULL_TIME",
        status: "ACTIVE",
      },
    });
    testTeacher1Id = teacher1.id;
    logSuccess(`Created teacher: ${teacher1.firstName} ${teacher1.lastName}`);

    const teacher2 = await prisma.teacherProfile.create({
      data: {
        firstName: "Jane",
        lastName: "Doe",
        nrcNumber: "123456/78/2",
        phoneNumber: "+260971234568",
        teacherType: "FULL_TIME",
        status: "ACTIVE",
      },
    });
    testTeacher2Id = teacher2.id;
    logSuccess(`Created teacher: ${teacher2.firstName} ${teacher2.lastName}`);

    // Create subject-teacher assignments
    await prisma.subjectTeacherAssignment.create({
      data: {
        teacherId: testTeacher1Id,
        subjectId: testSubject1Id,
        classId: testSecondaryClassId,
        academicYearId: testAcademicYearId,
      },
    });
    logSuccess("Created assignment: Teacher1 -> Physics -> Class 10A");

    await prisma.subjectTeacherAssignment.create({
      data: {
        teacherId: testTeacher1Id,
        subjectId: testSubject1Id,
        classId: testSecondaryClass2Id,
        academicYearId: testAcademicYearId,
      },
    });
    logSuccess("Created assignment: Teacher1 -> Physics -> Class 10B");

    await prisma.subjectTeacherAssignment.create({
      data: {
        teacherId: testTeacher2Id,
        subjectId: testSubject2Id,
        classId: testSecondaryClassId,
        academicYearId: testAcademicYearId,
      },
    });
    logSuccess("Created assignment: Teacher2 -> Chemistry -> Class 10A");

    logSuccess("Setup completed successfully");
  } catch (error: any) {
    logError(`Setup failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Create entry for SECONDARY class
 */
async function testCreateForSecondary() {
  logSection("TEST: Create Entry for SECONDARY Class");

  try {
    const entry = await secondaryTimetableService.createTimetableEntry(
      {
        classId: testSecondaryClassId,
        subjectId: testSubject1Id,
        teacherId: testTeacher1Id,
        academicYearId: testAcademicYearId,
        termId: testTermId,
        dayOfWeek: "MONDAY",
        timeSlotId: testTimeSlot1Id,
      },
      adminContext
    );

    logSuccess(
      `Created entry: ${entry.dayOfWeek} - ${entry.subject.name} - ${entry.teacher.firstName}`
    );
    logSuccess("Create for SECONDARY class works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Reject entry for PRIMARY class
 */
async function testRejectPrimary() {
  logSection("TEST: Reject Entry for PRIMARY Class");

  try {
    await secondaryTimetableService.createTimetableEntry(
      {
        classId: testPrimaryClassId,
        subjectId: testSubject1Id,
        teacherId: testTeacher1Id,
        academicYearId: testAcademicYearId,
        termId: testTermId,
        dayOfWeek: "MONDAY",
        timeSlotId: testTimeSlot1Id,
      },
      adminContext
    );

    logError("Should have rejected PRIMARY class");
    throw new Error("Validation not working");
  } catch (error: any) {
    if (error instanceof ValidationError) {
      logSuccess(`Correctly rejected: ${error.message}`);
      logSuccess("PRIMARY class rejection works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Validate SubjectTeacherAssignment exists
 */
async function testValidateAssignment() {
  logSection("TEST: Validate SubjectTeacherAssignment Exists");

  try {
    // Try to assign teacher to subject/class they're NOT assigned to
    await secondaryTimetableService.createTimetableEntry(
      {
        classId: testSecondaryClassId,
        subjectId: testSubject2Id, // Chemistry
        teacherId: testTeacher1Id, // But Teacher1 is assigned to Physics, not Chemistry
        academicYearId: testAcademicYearId,
        termId: testTermId,
        dayOfWeek: "TUESDAY",
        timeSlotId: testTimeSlot1Id,
      },
      adminContext
    );

    logError("Should have rejected missing SubjectTeacherAssignment");
    throw new Error("Assignment validation not working");
  } catch (error: any) {
    if (error instanceof ValidationError) {
      logSuccess(`Correctly rejected: ${error.message}`);
      logSuccess("SubjectTeacherAssignment validation works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Prevent teacher clash
 */
async function testPreventTeacherClash() {
  logSection("TEST: Prevent Teacher Clash");

  try {
    // Try to assign same teacher to different class at same time
    await secondaryTimetableService.createTimetableEntry(
      {
        classId: testSecondaryClass2Id, // Different class
        subjectId: testSubject1Id,
        teacherId: testTeacher1Id, // Same teacher
        academicYearId: testAcademicYearId,
        termId: testTermId,
        dayOfWeek: "MONDAY", // Same day
        timeSlotId: testTimeSlot1Id, // Same time slot
      },
      adminContext
    );

    logError("Should have prevented teacher clash");
    throw new Error("Teacher clash prevention not working");
  } catch (error: any) {
    if (error instanceof ClashError) {
      logSuccess(`Correctly prevented: ${error.message}`);
      logSuccess("Teacher clash prevention works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Prevent class clash
 */
async function testPreventClassClash() {
  logSection("TEST: Prevent Class Clash");

  try {
    // Try to assign different subject to same class at same time
    await secondaryTimetableService.createTimetableEntry(
      {
        classId: testSecondaryClassId, // Same class
        subjectId: testSubject2Id, // Different subject (Chemistry)
        teacherId: testTeacher2Id, // Different teacher
        academicYearId: testAcademicYearId,
        termId: testTermId,
        dayOfWeek: "MONDAY", // Same day
        timeSlotId: testTimeSlot1Id, // Same time slot
      },
      adminContext
    );

    logError("Should have prevented class clash");
    throw new Error("Class clash prevention not working");
  } catch (error: any) {
    if (error instanceof ClashError) {
      logSuccess(`Correctly prevented: ${error.message}`);
      logSuccess("Class clash prevention works correctly");
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
    await secondaryTimetableService.createTimetableEntry(
      {
        classId: testSecondaryClassId,
        subjectId: testSubject1Id,
        teacherId: testTeacher1Id,
        academicYearId: testAcademicYearId,
        termId: testTermId,
        dayOfWeek: "TUESDAY",
        timeSlotId: testTimeSlot2Id,
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
 * Test: Check teacher availability
 */
async function testCheckTeacherAvailability() {
  logSection("TEST: Check Teacher Availability");

  try {
    // Teacher1 is teaching on MONDAY, Period 1
    const notAvailable = await secondaryTimetableService.checkTeacherAvailability(
      testTeacher1Id,
      testTermId,
      "MONDAY",
      testTimeSlot1Id
    );

    if (notAvailable) {
      throw new Error("Teacher should NOT be available");
    }
    logSuccess("Teacher correctly marked as NOT available");

    // Teacher1 should be available on TUESDAY, Period 1
    const available = await secondaryTimetableService.checkTeacherAvailability(
      testTeacher1Id,
      testTermId,
      "TUESDAY",
      testTimeSlot1Id
    );

    if (!available) {
      throw new Error("Teacher should be available");
    }
    logSuccess("Teacher correctly marked as available");

    logSuccess("Check teacher availability works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Check class availability
 */
async function testCheckClassAvailability() {
  logSection("TEST: Check Class Availability");

  try {
    // Class has Physics on MONDAY, Period 1
    const notAvailable = await secondaryTimetableService.checkClassAvailability(
      testSecondaryClassId,
      testTermId,
      "MONDAY",
      testTimeSlot1Id
    );

    if (notAvailable) {
      throw new Error("Class should NOT be available");
    }
    logSuccess("Class correctly marked as NOT available");

    // Class should be available on TUESDAY, Period 1
    const available = await secondaryTimetableService.checkClassAvailability(
      testSecondaryClassId,
      testTermId,
      "TUESDAY",
      testTimeSlot1Id
    );

    if (!available) {
      throw new Error("Class should be available");
    }
    logSuccess("Class correctly marked as available");

    logSuccess("Check class availability works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Get class timetable
 */
async function testGetClassTimetable() {
  logSection("TEST: Get Class Timetable");

  try {
    const timetable = await secondaryTimetableService.getClassTimetable(
      testSecondaryClassId,
      testTermId
    );

    logInfo(`Found ${timetable.length} entries`);
    if (timetable.length === 0) {
      throw new Error("Expected at least 1 entry");
    }

    timetable.forEach((entry) => {
      logSuccess(
        `${entry.dayOfWeek} - ${entry.timeSlot.label} - ${entry.subject.name} - ${entry.teacher.firstName}`
      );
    });

    logSuccess("Get class timetable works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Get teacher timetable
 */
async function testGetTeacherTimetable() {
  logSection("TEST: Get Teacher Timetable");

  try {
    const timetable = await secondaryTimetableService.getTeacherTimetable(
      testTeacher1Id,
      testTermId
    );

    logInfo(`Found ${timetable.length} entries for teacher`);
    if (timetable.length === 0) {
      throw new Error("Expected at least 1 entry");
    }

    logSuccess("Get teacher timetable works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Get teacher workload
 */
async function testGetTeacherWorkload() {
  logSection("TEST: Get Teacher Workload");

  try {
    const workload = await secondaryTimetableService.getTeacherWorkload(
      testTeacher1Id,
      testTermId
    );

    logInfo(`Total periods: ${workload.totalPeriods}`);
    logInfo(`Classes taught: ${workload.classesTaught}`);
    logInfo(`Subjects taught: ${workload.subjectsTaught}`);

    if (workload.totalPeriods === 0) {
      throw new Error("Expected at least 1 period");
    }

    logSuccess("Get teacher workload works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Bulk create with validation
 */
async function testBulkCreate() {
  logSection("TEST: Bulk Create with Validation");

  try {
    const entries = [
      {
        classId: testSecondaryClassId,
        subjectId: testSubject1Id,
        teacherId: testTeacher1Id,
        academicYearId: testAcademicYearId,
        termId: testTermId,
        dayOfWeek: "TUESDAY" as DayOfWeek,
        timeSlotId: testTimeSlot1Id,
      },
      {
        classId: testSecondaryClassId,
        subjectId: testSubject2Id,
        teacherId: testTeacher2Id,
        academicYearId: testAcademicYearId,
        termId: testTermId,
        dayOfWeek: "TUESDAY" as DayOfWeek,
        timeSlotId: testTimeSlot2Id,
      },
      // Invalid: missing assignment
      {
        classId: testSecondaryClassId,
        subjectId: testSubject1Id,
        teacherId: testTeacher2Id, // Teacher2 not assigned to Physics
        academicYearId: testAcademicYearId,
        termId: testTermId,
        dayOfWeek: "WEDNESDAY" as DayOfWeek,
        timeSlotId: testTimeSlot1Id,
      },
    ];

    const result = await secondaryTimetableService.bulkCreateWithValidation(
      entries,
      adminContext
    );

    logSuccess(`Created ${result.created} entries`);
    logInfo(`Errors: ${result.errors.length}`);
    result.errors.forEach((err) => logInfo(`  - ${err}`));

    if (result.created !== 2) {
      throw new Error(`Expected 2 valid entries, got ${result.created}`);
    }

    if (result.errors.length !== 1) {
      throw new Error(`Expected 1 error, got ${result.errors.length}`);
    }

    logSuccess("Bulk create with validation works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Get timetable statistics
 */
async function testGetStats() {
  logSection("TEST: Get Timetable Statistics");

  try {
    const stats = await secondaryTimetableService.getTimetableStats(
      testSecondaryClassId,
      testTermId
    );

    logInfo(`Total entries: ${stats.totalEntries}`);
    logInfo(`Unique subjects: ${stats.uniqueSubjects}`);
    logInfo(`Unique teachers: ${stats.uniqueTeachers}`);

    if (stats.totalEntries === 0) {
      throw new Error("Expected at least 1 entry");
    }

    logSuccess("Get statistics works correctly");
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
    // Delete all timetable entries
    await prisma.secondaryTimetable.deleteMany({});

    // Delete subject-teacher assignments
    await prisma.subjectTeacherAssignment.deleteMany({
      where: { academicYearId: testAcademicYearId },
    });

    // Delete teachers
    await prisma.teacherProfile.deleteMany({
      where: {
        id: { in: [testTeacher1Id, testTeacher2Id] },
      },
    });

    // Delete time slots
    await prisma.timeSlot.deleteMany({});

    // Delete subjects
    await prisma.subject.deleteMany({});

    // Delete terms
    await prisma.term.deleteMany({
      where: { academicYearId: testAcademicYearId },
    });

    // Delete classes
    await prisma.class.deleteMany({
      where: { academicYearId: testAcademicYearId },
    });

    // Delete grades
    await prisma.grade.deleteMany({
      where: {
        id: { in: [testSecondaryGradeId, testPrimaryGradeId] },
      },
    });

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
    await testCreateForSecondary();
    await testRejectPrimary();
    await testValidateAssignment();
    await testPreventTeacherClash();
    await testPreventClassClash();
    await testAuthorization();
    await testCheckTeacherAvailability();
    await testCheckClassAvailability();
    await testGetClassTimetable();
    await testGetTeacherTimetable();
    await testGetTeacherWorkload();
    await testBulkCreate();
    await testGetStats();

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
