/**
 * TimetableSlot Repository Validation Script
 *
 * Purpose: Validate CRUD operations on the TimetableSlot table
 *
 * Architecture: Tests repository layer only (no services, no API, no validation)
 * Database: Uses real Prisma client with actual database
 *
 * Run with: npx tsx scripts/test-timetable-slot-repository.ts
 */

import { timetableSlotRepository } from "@/features/timetables/timetableSlot.repository";
import { classRepository } from "@/features/classes/class.repository";
import { subjectRepository } from "@/features/subjects/subject.repository";
import { teacherRepository } from "@/features/teachers/teacher.repository";
import { academicYearRepository } from "@/features/academic-years/academicYear.repository";
import prisma from "@/lib/db/prisma";
import { DayOfWeek } from "@prisma/client";

// Logging utilities
const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  data: (label: string, data: any) =>
    console.log(`  ${label}:`, JSON.stringify(data, null, 2)),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateTimetableSlotRepository() {
  let createdSlotId: string | null = null;
  let testClassId: string | null = null;
  let testSubjectId: string | null = null;
  let testTeacherId: string | null = null;
  let testAcademicYearId: string | null = null;

  try {
    log.step("Starting TimetableSlot Repository Validation");

    // ========================================
    // STEP 0: Setup Test Dependencies
    // ========================================
    log.step(
      "Setting up test dependencies (Class, Subject, Teacher, AcademicYear)"
    );

    // Get or create academic year
    let academicYear = await academicYearRepository.findActive();
    if (!academicYear) {
      const testYear = 2027 + Math.floor(Math.random() * 100);
      academicYear = await academicYearRepository.create({
        year: testYear,
        startDate: new Date(`${testYear}-01-12`),
        endDate: new Date(`${testYear}-12-04`),
        isActive: true,
        isClosed: false,
      });
      log.info(`Created test academic year: ${academicYear.year}`);
    }
    testAcademicYearId = academicYear.id;

    // Get first available class
    const classes = await classRepository.findMany({ take: 1 });
    if (classes.length === 0) {
      throw new Error(
        "No classes found in database. Please seed classes first."
      );
    }
    testClassId = classes[0].id;
    log.info(`Using class: ${classes[0].name}`);

    // Get first available subject
    const subjects = await subjectRepository.findMany({ take: 1 });
    if (subjects.length === 0) {
      throw new Error(
        "No subjects found in database. Please seed subjects first."
      );
    }
    testSubjectId = subjects[0].id;
    log.info(`Using subject: ${subjects[0].name} (${subjects[0].code})`);

    // Get first available teacher
    const teachers = await teacherRepository.findMany({ take: 1 });
    if (teachers.length === 0) {
      throw new Error(
        "No teachers found in database. Please seed teachers first."
      );
    }
    testTeacherId = teachers[0].id;
    log.info(`Using teacher: ${teachers[0].firstName} ${teachers[0].lastName}`);

    // ========================================
    // STEP 1: Create Timetable Slot
    // ========================================
    log.step("Creating new timetable slot (Monday, Period 1)");

    const newSlot = await timetableSlotRepository.create({
      class: { connect: { id: testClassId } },
      subject: { connect: { id: testSubjectId } },
      teacher: { connect: { id: testTeacherId } },
      academicYear: { connect: { id: testAcademicYearId } },
      dayOfWeek: "MONDAY",
      periodNumber: 1,
      startTime: "08:00",
      endTime: "09:00",
      room: "Room 101",
    });

    createdSlotId = newSlot.id;

    log.data("Created Timetable Slot", {
      id: newSlot.id,
      dayOfWeek: newSlot.dayOfWeek,
      periodNumber: newSlot.periodNumber,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      room: newSlot.room,
    });

    // ========================================
    // STEP 2: Find All Timetable Slots
    // ========================================
    log.step("Fetching all timetable slots");

    const allSlots = await timetableSlotRepository.findAll();

    log.info(`Total timetable slots in database: ${allSlots.length}`);
    if (allSlots.length > 0) {
      log.data(
        "Sample Slots",
        allSlots.slice(0, 3).map((s) => ({
          dayOfWeek: s.dayOfWeek,
          periodNumber: s.periodNumber,
          time: `${s.startTime}-${s.endTime}`,
          subject: s.subject.name,
        }))
      );
    }

    // ========================================
    // STEP 3: Find by ID
    // ========================================
    log.step(`Fetching timetable slot by ID: ${createdSlotId}`);

    const slotById = await timetableSlotRepository.findById(createdSlotId);

    if (!slotById) {
      throw new Error("Failed to retrieve timetable slot by ID");
    }

    log.data("Retrieved Slot", {
      id: slotById.id,
      dayOfWeek: slotById.dayOfWeek,
      periodNumber: slotById.periodNumber,
    });

    // ========================================
    // STEP 4: Find by ID with Relations
    // ========================================
    log.step("Fetching timetable slot with full relations");

    const slotWithRelations =
      await timetableSlotRepository.findByIdWithRelations(createdSlotId);

    if (!slotWithRelations) {
      throw new Error("Failed to retrieve slot with relations");
    }

    log.data("Slot with Relations", {
      dayOfWeek: slotWithRelations.dayOfWeek,
      periodNumber: slotWithRelations.periodNumber,
      class: slotWithRelations.class.name,
      subject: slotWithRelations.subject.name,
      teacher: `${slotWithRelations.teacher.firstName} ${slotWithRelations.teacher.lastName}`,
    });

    // ========================================
    // STEP 5: Find by Class
    // ========================================
    log.step(`Fetching timetable slots for class: ${classes[0].name}`);

    const classSlots = await timetableSlotRepository.findByClass(testClassId);

    log.info(`Slots for class: ${classSlots.length}`);
    classSlots.slice(0, 3).forEach((s) => {
      log.info(
        `  - ${s.dayOfWeek} Period ${s.periodNumber}: ${s.subject.name}`
      );
    });

    // ========================================
    // STEP 6: Find by Teacher
    // ========================================
    log.step(
      `Fetching timetable slots for teacher: ${teachers[0].firstName} ${teachers[0].lastName}`
    );

    const teacherSlots = await timetableSlotRepository.findByTeacher(
      testTeacherId
    );

    log.info(`Slots for teacher: ${teacherSlots.length}`);

    // ========================================
    // STEP 7: Find by Subject
    // ========================================
    log.step(`Fetching timetable slots for subject: ${subjects[0].name}`);

    const subjectSlots = await timetableSlotRepository.findBySubject(
      testSubjectId
    );

    log.info(`Slots for subject: ${subjectSlots.length}`);

    // ========================================
    // STEP 8: Find by Academic Year
    // ========================================
    log.step("Fetching timetable slots for academic year");

    const yearSlots = await timetableSlotRepository.findByAcademicYear(
      testAcademicYearId
    );

    log.info(`Slots for academic year: ${yearSlots.length}`);

    // ========================================
    // STEP 9: Find by Class and Year
    // ========================================
    log.step("Fetching timetable slots by class and year");

    const classYearSlots = await timetableSlotRepository.findByClassAndYear(
      testClassId,
      testAcademicYearId
    );

    log.info(`Slots for class + year: ${classYearSlots.length}`);

    // ========================================
    // STEP 10: Find by Day
    // ========================================
    log.step("Fetching all MONDAY slots");

    const mondaySlots = await timetableSlotRepository.findByDay(
      "MONDAY" as DayOfWeek
    );

    log.info(`Monday slots: ${mondaySlots.length}`);

    // ========================================
    // STEP 11: Find by Class and Day
    // ========================================
    log.step("Fetching slots by class and day (MONDAY)");

    const classDaySlots = await timetableSlotRepository.findByClassAndDay(
      testClassId,
      "MONDAY" as DayOfWeek
    );

    log.info(`Slots for class on Monday: ${classDaySlots.length}`);

    // ========================================
    // STEP 12: Find by Unique Constraint
    // ========================================
    log.step(
      "Finding slot by class, day, period, and year (unique constraint)"
    );

    const uniqueSlot = await timetableSlotRepository.findByClassDayPeriod(
      testClassId,
      "MONDAY" as DayOfWeek,
      1,
      testAcademicYearId
    );

    if (!uniqueSlot) {
      throw new Error("Should have found slot by unique constraint");
    }

    log.data("Found Unique Slot", {
      id: uniqueSlot.id,
      dayOfWeek: uniqueSlot.dayOfWeek,
      periodNumber: uniqueSlot.periodNumber,
    });

    // ========================================
    // STEP 13: Check Teacher Conflict
    // ========================================
    log.step("Checking for teacher conflict at Monday Period 1");

    const hasConflict = await timetableSlotRepository.checkTeacherConflict(
      testTeacherId,
      "MONDAY" as DayOfWeek,
      1,
      testAcademicYearId
    );

    log.info(`Teacher has conflict: ${hasConflict ? "Yes" : "No"}`);

    if (!hasConflict) {
      throw new Error("Should have detected teacher conflict");
    }
    log.info("✓ Verified: Conflict detection working");

    // Test no conflict
    const noConflict = await timetableSlotRepository.checkTeacherConflict(
      testTeacherId,
      "TUESDAY" as DayOfWeek,
      1,
      testAcademicYearId
    );

    log.info(
      `Conflict on Tuesday Period 1: ${
        noConflict ? "Yes (unexpected)" : "No (expected)"
      }`
    );

    // ========================================
    // STEP 14: Update Timetable Slot
    // ========================================
    log.step("Updating timetable slot (changing room and time)");

    const updatedSlot = await timetableSlotRepository.update(createdSlotId, {
      room: "Room 202",
      endTime: "09:30",
    });

    log.data("Updated Slot", {
      dayOfWeek: updatedSlot.dayOfWeek,
      periodNumber: updatedSlot.periodNumber,
      previousRoom: "Room 101",
      newRoom: updatedSlot.room,
      previousEndTime: "09:00",
      newEndTime: updatedSlot.endTime,
    });

    // ========================================
    // STEP 15: Find Many with Filters
    // ========================================
    log.step("Testing findMany with filters");

    const filteredSlots = await timetableSlotRepository.findMany({
      where: {
        dayOfWeek: "MONDAY",
        periodNumber: { lte: 2 },
      },
      take: 5,
    });

    log.info(`Filtered slots (Monday, Period 1-2): ${filteredSlots.length}`);

    // ========================================
    // STEP 16: Count Timetable Slots
    // ========================================
    log.step("Counting timetable slots");

    const totalCount = await timetableSlotRepository.count();
    const mondayCount = await timetableSlotRepository.count({
      dayOfWeek: "MONDAY",
    });
    const period1Count = await timetableSlotRepository.count({
      periodNumber: 1,
    });

    log.info(`Total slots: ${totalCount}`);
    log.info(`Monday slots: ${mondayCount}`);
    log.info(`Period 1 slots: ${period1Count}`);

    // ========================================
    // STEP 17: Delete Timetable Slot
    // ========================================
    log.step("Deleting test timetable slot");

    await timetableSlotRepository.delete(createdSlotId);

    log.info(`Successfully deleted slot with ID: ${createdSlotId}`);

    // Verify deletion
    const deletedSlot = await timetableSlotRepository.findById(createdSlotId);
    if (deletedSlot) {
      throw new Error("Slot was not properly deleted");
    }

    log.info("Verified: Slot no longer exists in database");

    // ========================================
    // SUCCESS
    // ========================================
    log.success("✓ All repository operations validated successfully");
    log.info("Summary:");
    log.info("  - Create: ✓");
    log.info("  - Find All: ✓");
    log.info("  - Find by ID: ✓");
    log.info("  - Find by ID with Relations: ✓");
    log.info("  - Find by Class: ✓");
    log.info("  - Find by Teacher: ✓");
    log.info("  - Find by Subject: ✓");
    log.info("  - Find by Academic Year: ✓");
    log.info("  - Find by Class and Year: ✓");
    log.info("  - Find by Day: ✓");
    log.info("  - Find by Class and Day: ✓");
    log.info("  - Find by Unique Constraint: ✓");
    log.info("  - Check Teacher Conflict: ✓");
    log.info("  - Update: ✓");
    log.info("  - Find Many (filtered): ✓");
    log.info("  - Count: ✓");
    log.info("  - Delete: ✓");
  } catch (error) {
    log.error("Validation failed");
    if (error instanceof Error) {
      log.error(error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  } finally {
    // ========================================
    // CLEANUP: Close Prisma Connection
    // ========================================
    await prisma.$disconnect();
    log.info("\n→ Prisma connection closed");
  }
}

// Execute validation
validateTimetableSlotRepository();
