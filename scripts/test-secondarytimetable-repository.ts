import prisma from "../lib/db/prisma";
import { secondaryTimetableRepository } from "../features/timetables/secondaryTimetable.repository";
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
let testGradeId: string;
let testClassId: string;
let testSubjectId: string;
let testTermId: string;
let testTimeSlotId: string;
let testTimeSlot2Id: string;
let testAcademicYearId: string;
let testTeacherId: string;
let testTeacher2Id: string;
let createdTimetableIds: string[] = [];

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
    const grade = await prisma.grade.create({
      data: {
        name: "Grade 10",
        schoolLevel: "SECONDARY",
        sequence: 10,
      },
    });
    testGradeId = grade.id;
    logSuccess(`Created grade: ${grade.name} (${grade.schoolLevel})`);

    // Create class
    const classData = await prisma.class.create({
      data: {
        name: "Grade 10A",
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

    // Create subject
    const subject = await prisma.subject.create({
      data: {
        name: "Physics",
        code: "PHY",
        category: "CORE",
      },
    });
    testSubjectId = subject.id;
    logSuccess(`Created subject: ${subject.name}`);

    // Create time slots
    const timeSlot1 = await prisma.timeSlot.create({
      data: {
        startTime: "08:00",
        endTime: "08:40",
        label: "Period 1",
      },
    });
    testTimeSlotId = timeSlot1.id;
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
    testTeacherId = teacher1.id;
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
        teacherId: testTeacherId,
        subjectId: testSubjectId,
        classId: testClassId,
        academicYearId: testAcademicYearId,
      },
    });
    logSuccess("Created subject-teacher assignment for Teacher 1");

    await prisma.subjectTeacherAssignment.create({
      data: {
        teacherId: testTeacher2Id,
        subjectId: testSubjectId,
        classId: testClassId,
        academicYearId: testAcademicYearId,
      },
    });
    logSuccess("Created subject-teacher assignment for Teacher 2");

    logSuccess("Setup completed successfully");
  } catch (error: any) {
    logError(`Setup failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Create timetable entry
 */
async function testCreate() {
  logSection("TEST: Create Timetable Entry");

  try {
    const entry = await secondaryTimetableRepository.create({
      class: { connect: { id: testClassId } },
      term: { connect: { id: testTermId } },
      subject: { connect: { id: testSubjectId } },
      teacher: { connect: { id: testTeacherId } },
      timeSlot: { connect: { id: testTimeSlotId } },
      academicYear: { connect: { id: testAcademicYearId } },
      dayOfWeek: "MONDAY",
    });

    createdTimetableIds.push(entry.id);
    logSuccess(
      `Created entry: ${entry.dayOfWeek} - ${entry.class.name} - ${entry.subject.name} - ${entry.teacher.firstName}`
    );
    logSuccess("Create works correctly");
  } catch (error: any) {
    logError(`Failed to create: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Find by class and term
 */
async function testFindByClassAndTerm() {
  logSection("TEST: Find by Class and Term");

  try {
    const entries = await secondaryTimetableRepository.findByClassAndTerm(
      testClassId,
      testTermId
    );

    logInfo(`Found ${entries.length} entries`);
    entries.forEach((entry) => {
      logSuccess(
        `${entry.dayOfWeek} - ${entry.timeSlot.label} - ${entry.subject.name} - ${entry.teacher.firstName}`
      );
    });

    if (entries.length === 0) {
      throw new Error("Expected at least 1 entry");
    }

    logSuccess("Find by class and term works correctly");
  } catch (error: any) {
    logError(`Failed to find by class and term: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Find teacher timetable
 */
async function testFindTeacherTimetable() {
  logSection("TEST: Find Teacher Timetable");

  try {
    const entries = await secondaryTimetableRepository.findTeacherTimetable(
      testTeacherId,
      testTermId
    );

    logInfo(`Found ${entries.length} entries for teacher`);
    if (entries.length === 0) {
      throw new Error("Expected at least 1 entry for teacher");
    }

    logSuccess("Find teacher timetable works correctly");
  } catch (error: any) {
    logError(`Failed to find teacher timetable: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Check teacher availability
 */
async function testCheckTeacherAvailability() {
  logSection("TEST: Check Teacher Availability");

  try {
    // Teacher should NOT be available (already assigned)
    const notAvailable = await secondaryTimetableRepository.isTeacherAvailable(
      testTeacherId,
      testTermId,
      "MONDAY",
      testTimeSlotId
    );

    if (notAvailable) {
      throw new Error("Teacher should not be available but is");
    }
    logSuccess("Teacher correctly marked as NOT available");

    // Teacher SHOULD be available (different time slot)
    const available = await secondaryTimetableRepository.isTeacherAvailable(
      testTeacherId,
      testTermId,
      "MONDAY",
      testTimeSlot2Id
    );

    if (!available) {
      throw new Error("Teacher should be available but isn't");
    }
    logSuccess("Teacher correctly marked as available");

    logSuccess("Teacher availability check works correctly");
  } catch (error: any) {
    logError(`Failed to check teacher availability: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Check class availability
 */
async function testCheckClassAvailability() {
  logSection("TEST: Check Class Availability");

  try {
    // Class should NOT be available (already assigned)
    const notAvailable = await secondaryTimetableRepository.isClassAvailable(
      testClassId,
      testTermId,
      "MONDAY",
      testTimeSlotId
    );

    if (notAvailable) {
      throw new Error("Class should not be available but is");
    }
    logSuccess("Class correctly marked as NOT available");

    // Class SHOULD be available (different time slot)
    const available = await secondaryTimetableRepository.isClassAvailable(
      testClassId,
      testTermId,
      "MONDAY",
      testTimeSlot2Id
    );

    if (!available) {
      throw new Error("Class should be available but isn't");
    }
    logSuccess("Class correctly marked as available");

    logSuccess("Class availability check works correctly");
  } catch (error: any) {
    logError(`Failed to check class availability: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Update timetable entry
 */
async function testUpdate() {
  logSection("TEST: Update Timetable Entry");

  try {
    const id = createdTimetableIds[0];
    const updated = await secondaryTimetableRepository.update(id, {
      dayOfWeek: "TUESDAY",
    });

    if (updated.dayOfWeek !== "TUESDAY") {
      throw new Error("Entry not updated");
    }

    logSuccess(`Updated day to: ${updated.dayOfWeek}`);

    // Revert change
    await secondaryTimetableRepository.update(id, {
      dayOfWeek: "MONDAY",
    });

    logSuccess("Update works correctly");
  } catch (error: any) {
    logError(`Failed to update: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Get teacher workload
 */
async function testGetTeacherWorkload() {
  logSection("TEST: Get Teacher Workload");

  try {
    const workload = await secondaryTimetableRepository.getTeacherWorkload(
      testTeacherId,
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
    logError(`Failed to get teacher workload: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Bulk create
 */
async function testBulkCreate() {
  logSection("TEST: Bulk Create");

  try {
    const entries = [
      {
        classId: testClassId,
        termId: testTermId,
        subjectId: testSubjectId,
        teacherId: testTeacherId,
        timeSlotId: testTimeSlot2Id,
        academicYearId: testAcademicYearId,
        dayOfWeek: "TUESDAY" as DayOfWeek,
      },
      {
        classId: testClassId,
        termId: testTermId,
        subjectId: testSubjectId,
        teacherId: testTeacher2Id,
        timeSlotId: testTimeSlotId,
        academicYearId: testAcademicYearId,
        dayOfWeek: "WEDNESDAY" as DayOfWeek,
      },
    ];

    const count = await secondaryTimetableRepository.bulkCreate(entries);
    logSuccess(`Bulk created ${count} entries`);

    if (count !== 2) {
      throw new Error(`Expected 2 entries, got ${count}`);
    }

    logSuccess("Bulk create works correctly");
  } catch (error: any) {
    logError(`Failed to bulk create: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Teacher clash prevention
 */
async function testTeacherClashPrevention() {
  logSection("TEST: Teacher Clash Prevention");

  try {
    // Try to assign same teacher to different class at same time
    const otherClass = await prisma.class.create({
      data: {
        name: "Grade 10B",
        gradeId: testGradeId,
        academicYearId: testAcademicYearId,
        capacity: 40,
        status: "ACTIVE",
      },
    });

    await secondaryTimetableRepository.create({
      class: { connect: { id: otherClass.id } },
      term: { connect: { id: testTermId } },
      subject: { connect: { id: testSubjectId } },
      teacher: { connect: { id: testTeacherId } },
      timeSlot: { connect: { id: testTimeSlotId } },
      academicYear: { connect: { id: testAcademicYearId } },
      dayOfWeek: "MONDAY",
    });

    logError("Teacher clash should have been prevented but wasn't");
    throw new Error("Teacher clash prevention not working");
  } catch (error: any) {
    if (
      error.message.includes("already teaching") ||
      error.message.includes("Unique constraint")
    ) {
      logSuccess("Teacher clash prevention works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Class clash prevention
 */
async function testClassClashPrevention() {
  logSection("TEST: Class Clash Prevention");

  try {
    // Try to assign same class different subject at same time
    await secondaryTimetableRepository.create({
      class: { connect: { id: testClassId } },
      term: { connect: { id: testTermId } },
      subject: { connect: { id: testSubjectId } },
      teacher: { connect: { id: testTeacher2Id } },
      timeSlot: { connect: { id: testTimeSlotId } },
      academicYear: { connect: { id: testAcademicYearId } },
      dayOfWeek: "MONDAY",
    });

    logError("Class clash should have been prevented but wasn't");
    throw new Error("Class clash prevention not working");
  } catch (error: any) {
    if (
      error.message.includes("already has") ||
      error.message.includes("Unique constraint")
    ) {
      logSuccess("Class clash prevention works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Delete entry
 */
async function testDelete() {
  logSection("TEST: Delete Entry");

  try {
    // Create a temporary entry for deletion
    const tempEntry = await secondaryTimetableRepository.create({
      class: { connect: { id: testClassId } },
      term: { connect: { id: testTermId } },
      subject: { connect: { id: testSubjectId } },
      teacher: { connect: { id: testTeacherId } },
      timeSlot: { connect: { id: testTimeSlot2Id } },
      academicYear: { connect: { id: testAcademicYearId } },
      dayOfWeek: "THURSDAY",
    });

    logSuccess(`Created temporary entry: ${tempEntry.dayOfWeek}`);

    // Delete it
    await secondaryTimetableRepository.delete(tempEntry.id);
    logSuccess("Deleted temporary entry");

    // Verify deletion
    const found = await secondaryTimetableRepository.findById(tempEntry.id);
    if (found) {
      throw new Error("Entry still exists after deletion");
    }

    logSuccess("Delete works correctly");
  } catch (error: any) {
    logError(`Failed to delete: ${error.message}`);
    throw error;
  }
}

/**
 * Cleanup: Remove test data
 */
async function cleanup() {
  logSection("CLEANUP: Removing Test Data");

  try {
    // Delete all secondary timetable entries
    await prisma.secondaryTimetable.deleteMany({});

    // Delete subject-teacher assignments
    await prisma.subjectTeacherAssignment.deleteMany({
      where: { academicYearId: testAcademicYearId },
    });

    // Delete test time slots
    await prisma.timeSlot.deleteMany({});

    // Delete test teachers
    await prisma.teacherProfile.deleteMany({
      where: {
        id: { in: [testTeacherId, testTeacher2Id] },
      },
    });

    // Delete test subject
    await prisma.subject.delete({ where: { id: testSubjectId } });

    // Delete test terms
    await prisma.term.deleteMany({
      where: { academicYearId: testAcademicYearId },
    });

    // Delete test classes
    await prisma.class.deleteMany({
      where: { gradeId: testGradeId },
    });

    // Delete test grade
    await prisma.grade.delete({ where: { id: testGradeId } });

    // Delete test academic year
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
    await testFindByClassAndTerm();
    await testFindTeacherTimetable();
    await testCheckTeacherAvailability();
    await testCheckClassAvailability();
    await testUpdate();
    await testGetTeacherWorkload();
    await testBulkCreate();
    await testTeacherClashPrevention();
    await testClassClashPrevention();
    await testDelete();

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
