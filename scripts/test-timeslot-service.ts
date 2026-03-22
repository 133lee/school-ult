import prisma from "../lib/db/prisma";
import {
  timeSlotService,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../features/timetables/timeSlot.service";

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

let createdTimeSlotIds: string[] = [];

/**
 * Setup: Clean database
 */
async function setup() {
  logSection("SETUP: Cleaning Database");

  try {
    await prisma.timeSlot.deleteMany({});
    logSuccess("Database cleaned");
  } catch (error: any) {
    logInfo("Database cleanup skipped");
  }
}

/**
 * Test: Create with valid time format
 */
async function testCreateValid() {
  logSection("TEST: Create with Valid Time Format");

  try {
    const timeSlot = await timeSlotService.createTimeSlot({
      startTime: "08:00",
      endTime: "08:40",
      label: "Period 1",
    });

    createdTimeSlotIds.push(timeSlot.id);
    logSuccess(`Created: ${timeSlot.label} (${timeSlot.startTime} - ${timeSlot.endTime})`);
    logSuccess("Create with valid format works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Reject invalid time format
 */
async function testInvalidTimeFormat() {
  logSection("TEST: Reject Invalid Time Format");

  try {
    await timeSlotService.createTimeSlot({
      startTime: "25:00", // Invalid hour
      endTime: "08:40",
      label: "Invalid Period",
    });

    logError("Should have rejected invalid time format");
    throw new Error("Validation not working");
  } catch (error: any) {
    if (error instanceof ValidationError) {
      logSuccess(`Correctly rejected: ${error.message}`);
      logSuccess("Time format validation works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Reject end time before start time
 */
async function testEndBeforeStart() {
  logSection("TEST: Reject End Time Before Start Time");

  try {
    await timeSlotService.createTimeSlot({
      startTime: "10:00",
      endTime: "09:00", // Before start time
      label: "Invalid Period",
    });

    logError("Should have rejected end time before start time");
    throw new Error("Validation not working");
  } catch (error: any) {
    if (error instanceof ValidationError) {
      logSuccess(`Correctly rejected: ${error.message}`);
      logSuccess("Time range validation works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Prevent duplicate time slots
 */
async function testDuplicatePrevention() {
  logSection("TEST: Prevent Duplicate Time Slots");

  try {
    await timeSlotService.createTimeSlot({
      startTime: "08:00",
      endTime: "08:40",
      label: "Duplicate Period",
    });

    logError("Should have prevented duplicate time slot");
    throw new Error("Duplicate prevention not working");
  } catch (error: any) {
    if (error instanceof ConflictError) {
      logSuccess(`Correctly prevented: ${error.message}`);
      logSuccess("Duplicate prevention works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Get all time slots
 */
async function testGetAll() {
  logSection("TEST: Get All Time Slots");

  try {
    const timeSlots = await timeSlotService.getAllTimeSlots();
    logInfo(`Found ${timeSlots.length} time slots`);

    if (timeSlots.length === 0) {
      throw new Error("Expected at least 1 time slot");
    }

    timeSlots.forEach((slot) => {
      logSuccess(`${slot.label}: ${slot.startTime} - ${slot.endTime}`);
    });

    logSuccess("Get all works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Get time slot by ID
 */
async function testGetById() {
  logSection("TEST: Get Time Slot by ID");

  try {
    const id = createdTimeSlotIds[0];
    const timeSlot = await timeSlotService.getTimeSlotById(id);

    logSuccess(`Found: ${timeSlot.label}`);
    logSuccess("Get by ID works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Get non-existent time slot
 */
async function testGetNonExistent() {
  logSection("TEST: Get Non-Existent Time Slot");

  try {
    await timeSlotService.getTimeSlotById("non-existent-id");

    logError("Should have thrown NotFoundError");
    throw new Error("Error handling not working");
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      logSuccess(`Correctly threw: ${error.message}`);
      logSuccess("Not found error works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Update time slot
 */
async function testUpdate() {
  logSection("TEST: Update Time Slot");

  try {
    const id = createdTimeSlotIds[0];
    const updated = await timeSlotService.updateTimeSlot(id, {
      label: "Period 1 (Updated)",
    });

    if (updated.label !== "Period 1 (Updated)") {
      throw new Error("Update failed");
    }

    logSuccess(`Updated label to: ${updated.label}`);

    // Revert
    await timeSlotService.updateTimeSlot(id, {
      label: "Period 1",
    });

    logSuccess("Update works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Update with invalid time format
 */
async function testUpdateInvalid() {
  logSection("TEST: Update with Invalid Time Format");

  try {
    const id = createdTimeSlotIds[0];
    await timeSlotService.updateTimeSlot(id, {
      startTime: "99:99", // Invalid
    });

    logError("Should have rejected invalid time format");
    throw new Error("Validation not working");
  } catch (error: any) {
    if (error instanceof ValidationError) {
      logSuccess(`Correctly rejected: ${error.message}`);
      logSuccess("Update validation works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Validate label length
 */
async function testLabelValidation() {
  logSection("TEST: Validate Label Length");

  try {
    // Empty label
    await timeSlotService.createTimeSlot({
      startTime: "09:00",
      endTime: "09:40",
      label: "   ", // Only whitespace
    });

    logError("Should have rejected empty label");
    throw new Error("Validation not working");
  } catch (error: any) {
    if (error instanceof ValidationError) {
      logSuccess("Correctly rejected empty label");
    } else {
      throw error;
    }
  }

  try {
    // Too long label
    await timeSlotService.createTimeSlot({
      startTime: "09:00",
      endTime: "09:40",
      label: "A".repeat(51), // Over 50 characters
    });

    logError("Should have rejected long label");
    throw new Error("Validation not working");
  } catch (error: any) {
    if (error instanceof ValidationError) {
      logSuccess("Correctly rejected long label");
      logSuccess("Label validation works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Test: Check if in use
 */
async function testIsInUse() {
  logSection("TEST: Check if Time Slot is in Use");

  try {
    const id = createdTimeSlotIds[0];
    const inUse = await timeSlotService.isTimeSlotInUse(id);

    logInfo(`Time slot in use: ${inUse}`);
    logSuccess("Is in use check works correctly");
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Delete unused time slot
 */
async function testDeleteUnused() {
  logSection("TEST: Delete Unused Time Slot");

  try {
    // Create a new time slot for deletion
    const tempSlot = await timeSlotService.createTimeSlot({
      startTime: "14:00",
      endTime: "14:40",
      label: "Temporary Period",
    });

    logSuccess(`Created temporary slot: ${tempSlot.label}`);

    // Delete it
    await timeSlotService.deleteTimeSlot(tempSlot.id);
    logSuccess("Deleted temporary slot");

    // Verify deletion
    try {
      await timeSlotService.getTimeSlotById(tempSlot.id);
      throw new Error("Slot still exists");
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        logSuccess("Delete works correctly");
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    logError(`Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Prevent deletion of time slot in use
 */
async function testPreventDeleteInUse() {
  logSection("TEST: Prevent Deletion of Time Slot in Use");

  try {
    // Create time slot, academic year, grade, class, term, and timetable entry
    const timeSlot = await timeSlotService.createTimeSlot({
      startTime: "15:00",
      endTime: "15:40",
      label: "In Use Period",
    });

    const academicYear = await prisma.academicYear.create({
      data: {
        year: 2024,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        isActive: true,
      },
    });

    const grade = await prisma.grade.create({
      data: {
        name: "Grade 5",
        schoolLevel: "PRIMARY",
        sequence: 5,
      },
    });

    const classData = await prisma.class.create({
      data: {
        name: "Grade 5A",
        gradeId: grade.id,
        academicYearId: academicYear.id,
        capacity: 40,
        status: "ACTIVE",
      },
    });

    const term = await prisma.term.create({
      data: {
        name: "Term 1",
        academicYearId: academicYear.id,
        termType: "TERM_1",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-04-30"),
        isActive: true,
      },
    });

    const subject = await prisma.subject.create({
      data: {
        name: "Math",
        code: "MATH",
        category: "CORE",
      },
    });

    // Create a timetable entry using this time slot
    await prisma.classTimetable.create({
      data: {
        classId: classData.id,
        termId: term.id,
        subjectId: subject.id,
        timeSlotId: timeSlot.id,
        dayOfWeek: "MONDAY",
      },
    });

    logSuccess("Created timetable entry using the time slot");

    // Try to delete (should fail)
    await timeSlotService.deleteTimeSlot(timeSlot.id);

    logError("Should have prevented deletion of time slot in use");
    throw new Error("Deletion prevention not working");
  } catch (error: any) {
    if (error instanceof ConflictError) {
      logSuccess(`Correctly prevented: ${error.message}`);
      logSuccess("Prevent deletion of in-use slot works correctly");

      // Cleanup
      await prisma.classTimetable.deleteMany({});
      await prisma.subject.deleteMany({ where: { code: "MATH" } });
      await prisma.term.deleteMany({});
      await prisma.class.deleteMany({});
      await prisma.grade.deleteMany({ where: { name: "Grade 5" } });
      await prisma.academicYear.deleteMany({ where: { year: "2024" } });
      await prisma.timeSlot.deleteMany({ where: { label: "In Use Period" } });
    } else {
      throw error;
    }
  }
}

/**
 * Test: Get count
 */
async function testGetCount() {
  logSection("TEST: Get Time Slot Count");

  try {
    const count = await timeSlotService.getTimeSlotCount();
    logSuccess(`Count: ${count} time slots`);

    if (count === 0) {
      throw new Error("Expected at least 1 time slot");
    }

    logSuccess("Get count works correctly");
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
    await prisma.timeSlot.deleteMany({});
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
    await testCreateValid();
    await testInvalidTimeFormat();
    await testEndBeforeStart();
    await testDuplicatePrevention();
    await testGetAll();
    await testGetById();
    await testGetNonExistent();
    await testUpdate();
    await testUpdateInvalid();
    await testLabelValidation();
    await testIsInUse();
    await testDeleteUnused();
    await testPreventDeleteInUse();
    await testGetCount();

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
