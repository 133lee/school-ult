import prisma from "../lib/db/prisma";
import { timeSlotRepository } from "../features/timetables/timeSlot.repository";

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

// Test data
const testTimeSlots = [
  { startTime: "08:00", endTime: "08:40", label: "Period 1" },
  { startTime: "08:40", endTime: "09:20", label: "Period 2" },
  { startTime: "09:20", endTime: "10:00", label: "Period 3" },
  { startTime: "10:00", endTime: "10:20", label: "Break" },
  { startTime: "10:20", endTime: "11:00", label: "Period 4" },
  { startTime: "11:00", endTime: "11:40", label: "Period 5" },
  { startTime: "11:40", endTime: "12:20", label: "Period 6" },
  { startTime: "12:20", endTime: "13:00", label: "Lunch" },
];

let createdTimeSlots: string[] = [];

/**
 * Setup: Clean database
 */
async function setup() {
  logSection("SETUP: Cleaning Database");

  try {
    // Delete all time slots (will fail if in use, which is fine for now)
    await prisma.timeSlot.deleteMany({});
    logSuccess("Database cleaned");
  } catch (error: any) {
    logInfo("Database cleanup skipped (time slots may be in use)");
  }
}

/**
 * Test: Create time slots
 */
async function testCreateTimeSlots() {
  logSection("TEST: Create Time Slots");

  try {
    for (const slotData of testTimeSlots) {
      const slot = await timeSlotRepository.create(slotData);
      createdTimeSlots.push(slot.id);
      logSuccess(`Created: ${slot.label} (${slot.startTime} - ${slot.endTime})`);
    }

    logSuccess(`Successfully created ${createdTimeSlots.length} time slots`);
  } catch (error: any) {
    logError(`Failed to create time slots: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Find all time slots
 */
async function testFindAll() {
  logSection("TEST: Find All Time Slots");

  try {
    const slots = await timeSlotRepository.findAll();
    logInfo(`Found ${slots.length} time slots`);

    slots.forEach((slot) => {
      logSuccess(`${slot.label}: ${slot.startTime} - ${slot.endTime}`);
    });

    if (slots.length !== testTimeSlots.length) {
      throw new Error(`Expected ${testTimeSlots.length} slots, got ${slots.length}`);
    }

    logSuccess("All time slots retrieved successfully");
  } catch (error: any) {
    logError(`Failed to find all time slots: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Find by ID
 */
async function testFindById() {
  logSection("TEST: Find Time Slot by ID");

  try {
    const id = createdTimeSlots[0];
    const slot = await timeSlotRepository.findById(id);

    if (!slot) {
      throw new Error("Time slot not found");
    }

    logSuccess(`Found: ${slot.label} (${slot.startTime} - ${slot.endTime})`);
    logSuccess("Find by ID works correctly");
  } catch (error: any) {
    logError(`Failed to find by ID: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Find by time
 */
async function testFindByTime() {
  logSection("TEST: Find Time Slot by Time");

  try {
    const slot = await timeSlotRepository.findByTime("08:00", "08:40");

    if (!slot) {
      throw new Error("Time slot not found");
    }

    if (slot.label !== "Period 1") {
      throw new Error(`Expected 'Period 1', got '${slot.label}'`);
    }

    logSuccess(`Found: ${slot.label}`);
    logSuccess("Find by time works correctly");
  } catch (error: any) {
    logError(`Failed to find by time: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Update time slot
 */
async function testUpdate() {
  logSection("TEST: Update Time Slot");

  try {
    const id = createdTimeSlots[0];
    const updated = await timeSlotRepository.update(id, {
      label: "Period 1 (Updated)",
    });

    if (updated.label !== "Period 1 (Updated)") {
      throw new Error("Time slot not updated");
    }

    logSuccess(`Updated label to: ${updated.label}`);

    // Revert change
    await timeSlotRepository.update(id, {
      label: "Period 1",
    });

    logSuccess("Update works correctly");
  } catch (error: any) {
    logError(`Failed to update: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Check if in use
 */
async function testIsInUse() {
  logSection("TEST: Check if Time Slot is in Use");

  try {
    const id = createdTimeSlots[0];
    const inUse = await timeSlotRepository.isInUse(id);

    logInfo(`Time slot in use: ${inUse}`);
    logSuccess("Is in use check works correctly");
  } catch (error: any) {
    logError(`Failed to check if in use: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Count
 */
async function testCount() {
  logSection("TEST: Count Time Slots");

  try {
    const count = await timeSlotRepository.count();

    if (count !== testTimeSlots.length) {
      throw new Error(`Expected count ${testTimeSlots.length}, got ${count}`);
    }

    logSuccess(`Count: ${count}`);
    logSuccess("Count works correctly");
  } catch (error: any) {
    logError(`Failed to count: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Delete
 */
async function testDelete() {
  logSection("TEST: Delete Time Slot");

  try {
    // Create a temporary slot for deletion
    const tempSlot = await timeSlotRepository.create({
      startTime: "14:00",
      endTime: "14:40",
      label: "Temporary Period",
    });

    logSuccess(`Created temporary slot: ${tempSlot.label}`);

    // Delete it
    await timeSlotRepository.delete(tempSlot.id);
    logSuccess("Deleted temporary slot");

    // Verify deletion
    const found = await timeSlotRepository.findById(tempSlot.id);
    if (found) {
      throw new Error("Time slot still exists after deletion");
    }

    logSuccess("Delete works correctly");
  } catch (error: any) {
    logError(`Failed to delete: ${error.message}`);
    throw error;
  }
}

/**
 * Test: Duplicate prevention
 */
async function testDuplicatePrevention() {
  logSection("TEST: Duplicate Prevention");

  try {
    // Try to create a duplicate
    await timeSlotRepository.create({
      startTime: "08:00",
      endTime: "08:40",
      label: "Duplicate Period 1",
    });

    logError("Duplicate creation should have failed but didn't");
    throw new Error("Duplicate prevention not working");
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      logSuccess("Duplicate prevention works correctly");
    } else {
      throw error;
    }
  }
}

/**
 * Cleanup: Remove test data
 */
async function cleanup() {
  logSection("CLEANUP: Removing Test Data");

  try {
    // Only delete if not in use
    let deleted = 0;
    for (const id of createdTimeSlots) {
      const inUse = await timeSlotRepository.isInUse(id);
      if (!inUse) {
        await timeSlotRepository.delete(id);
        deleted++;
      }
    }

    logSuccess(`Removed ${deleted} time slots`);
    if (deleted < createdTimeSlots.length) {
      logInfo(
        `${createdTimeSlots.length - deleted} time slots kept (in use by timetables)`
      );
    }
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
    await testCreateTimeSlots();
    await testFindAll();
    await testFindById();
    await testFindByTime();
    await testUpdate();
    await testIsInUse();
    await testCount();
    await testDelete();
    await testDuplicatePrevention();

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
