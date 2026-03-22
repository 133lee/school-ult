import prisma from "../lib/db/prisma";
import { classTimetableRepository } from "../features/timetables/classTimetable.repository";
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
let testAcademicYearId: string;
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

    // Create PRIMARY grade
    const grade = await prisma.grade.create({
      data: {
        name: "Grade 5",
        schoolLevel: "PRIMARY",
        sequence: 5,
      },
    });
    testGradeId = grade.id;
    logSuccess(`Created grade: ${grade.name} (${grade.schoolLevel})`);

    // Create class
    const classData = await prisma.class.create({
      data: {
        name: "Grade 5A",
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
        name: "Mathematics",
        code: "MATH",
        category: "CORE",
      },
    });
    testSubjectId = subject.id;
    logSuccess(`Created subject: ${subject.name}`);

    // Create time slot
    const timeSlot = await prisma.timeSlot.create({
      data: {
        startTime: "08:00",
        endTime: "08:40",
        label: "Period 1",
      },
    });
    testTimeSlotId = timeSlot.id;
    logSuccess(`Created time slot: ${timeSlot.label}`);

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
    const entry = await classTimetableRepository.create({
      class: { connect: { id: testClassId } },
      term: { connect: { id: testTermId } },
      subject: { connect: { id: testSubjectId } },
      timeSlot: { connect: { id: testTimeSlotId } },
      dayOfWeek: "MONDAY",
    });

    createdTimetableIds.push(entry.id);
    logSuccess(
      `Created entry: ${entry.dayOfWeek} - ${entry.class.name} - ${entry.subject.name}`
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
    const entries = await classTimetableRepository.findByClassAndTerm(
      testClassId,
      testTermId
    );

    logInfo(`Found ${entries.length} entries`);
    entries.forEach((entry) => {
      logSuccess(
        `${entry.dayOfWeek} - ${entry.timeSlot.label} - ${entry.subject.name}`
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
 * Test: Find by class, term, and day
 */
async function testFindByClassTermAndDay() {
  logSection("TEST: Find by Class, Term, and Day");

  try {
    const entries = await classTimetableRepository.findByClassTermAndDay(
      testClassId,
      testTermId,
      "MONDAY"
    );

    logInfo(`Found ${entries.length} entries for MONDAY`);
    if (entries.length === 0) {
      throw new Error("Expected at least 1 entry for MONDAY");
    }

    logSuccess("Find by day works correctly");
  } catch (error: any) {
    logError(`Failed to find by day: ${error.message}`);
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
    const updated = await classTimetableRepository.update(id, {
      dayOfWeek: "TUESDAY",
    });

    if (updated.dayOfWeek !== "TUESDAY") {
      throw new Error("Entry not updated");
    }

    logSuccess(`Updated day to: ${updated.dayOfWeek}`);

    // Revert change
    await classTimetableRepository.update(id, {
      dayOfWeek: "MONDAY",
    });

    logSuccess("Update works correctly");
  } catch (error: any) {
    logError(`Failed to update: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Bulk create
 */
async function testBulkCreate() {
  logSection("TEST: Bulk Create");

  try {
    // Create additional time slots for bulk test
    const timeSlot2 = await prisma.timeSlot.create({
      data: {
        startTime: "08:40",
        endTime: "09:20",
        label: "Period 2",
      },
    });

    const timeSlot3 = await prisma.timeSlot.create({
      data: {
        startTime: "09:20",
        endTime: "10:00",
        label: "Period 3",
      },
    });

    const entries = [
      {
        classId: testClassId,
        termId: testTermId,
        subjectId: testSubjectId,
        timeSlotId: timeSlot2.id,
        dayOfWeek: "TUESDAY" as DayOfWeek,
      },
      {
        classId: testClassId,
        termId: testTermId,
        subjectId: testSubjectId,
        timeSlotId: timeSlot3.id,
        dayOfWeek: "WEDNESDAY" as DayOfWeek,
      },
    ];

    const count = await classTimetableRepository.bulkCreate(entries);
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
 * Test: Copy timetable
 */
async function testCopyTimetable() {
  logSection("TEST: Copy Timetable to Another Term");

  try {
    // Create a second term
    const term2 = await prisma.term.create({
      data: {
        name: "Term 2",
        academicYearId: testAcademicYearId,
        termType: "TERM_2",
        startDate: new Date("2024-05-01"),
        endDate: new Date("2024-08-31"),
        isActive: false,
      },
    });

    const count = await classTimetableRepository.copyTimetable(
      testClassId,
      testTermId,
      term2.id
    );

    logSuccess(`Copied ${count} entries to Term 2`);

    // Verify copy
    const copiedEntries = await classTimetableRepository.findByClassAndTerm(
      testClassId,
      term2.id
    );

    if (copiedEntries.length !== count) {
      throw new Error("Copy count mismatch");
    }

    logSuccess("Copy timetable works correctly");
  } catch (error: any) {
    logError(`Failed to copy timetable: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Count entries
 */
async function testCount() {
  logSection("TEST: Count Entries");

  try {
    const count = await classTimetableRepository.count({
      classId: testClassId,
      termId: testTermId,
    });

    logSuccess(`Count: ${count} entries`);

    if (count === 0) {
      throw new Error("Expected at least 1 entry");
    }

    logSuccess("Count works correctly");
  } catch (error: any) {
    logError(`Failed to count: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Duplicate prevention
 */
async function testDuplicatePrevention() {
  logSection("TEST: Duplicate Prevention");

  try {
    // Try to create a duplicate (same class, term, day, timeslot)
    await classTimetableRepository.create({
      class: { connect: { id: testClassId } },
      term: { connect: { id: testTermId } },
      subject: { connect: { id: testSubjectId } },
      timeSlot: { connect: { id: testTimeSlotId } },
      dayOfWeek: "MONDAY",
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
 * Test: Delete entry
 */
async function testDelete() {
  logSection("TEST: Delete Entry");

  try {
    // Create a temporary entry for deletion
    const tempEntry = await classTimetableRepository.create({
      class: { connect: { id: testClassId } },
      term: { connect: { id: testTermId } },
      subject: { connect: { id: testSubjectId } },
      timeSlot: { connect: { id: testTimeSlotId } },
      dayOfWeek: "THURSDAY",
    });

    logSuccess(`Created temporary entry: ${tempEntry.dayOfWeek}`);

    // Delete it
    await classTimetableRepository.delete(tempEntry.id);
    logSuccess("Deleted temporary entry");

    // Verify deletion
    const found = await classTimetableRepository.findById(tempEntry.id);
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
    // Delete all class timetable entries
    await prisma.classTimetable.deleteMany({
      where: { classId: testClassId },
    });

    // Delete test time slots
    await prisma.timeSlot.deleteMany({});

    // Delete test subject
    await prisma.subject.delete({ where: { id: testSubjectId } });

    // Delete test terms
    await prisma.term.deleteMany({
      where: { academicYearId: testAcademicYearId },
    });

    // Delete test class
    await prisma.class.delete({ where: { id: testClassId } });

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
    await testFindByClassTermAndDay();
    await testUpdate();
    await testBulkCreate();
    await testCopyTimetable();
    await testCount();
    await testDuplicatePrevention();
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
