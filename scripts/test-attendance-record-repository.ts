/**
 * AttendanceRecord Repository Validation Script
 *
 * Purpose: Validate CRUD operations on the AttendanceRecord table
 *
 * Architecture: Tests repository layer only (no services, no API, no validation)
 * Database: Uses real Prisma client with actual database
 *
 * Run with: npx tsx scripts/test-attendance-record-repository.ts
 */

import { attendanceRecordRepository } from "@/features/attendance/attendanceRecord.repository";
import { studentRepository } from "@/features/students/student.repository";
import { classRepository } from "@/features/classes/class.repository";
import { termRepository } from "@/features/terms/term.repository";
import { academicYearRepository } from "@/features/academic-years/academicYear.repository";
import prisma from "@/lib/db/prisma";
import { AttendanceStatus } from "@prisma/client";

// Logging utilities
const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  data: (label: string, data: any) =>
    console.log(`  ${label}:`, JSON.stringify(data, null, 2)),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateAttendanceRecordRepository() {
  let createdRecordId: string | null = null;
  let testStudentId: string | null = null;
  let testClassId: string | null = null;
  let testTermId: string | null = null;
  let testDate: Date | null = null;

  try {
    log.step("Starting AttendanceRecord Repository Validation");

    // ========================================
    // STEP 0: Setup Test Dependencies
    // ========================================
    log.step("Setting up test dependencies (Student, Class, Term)");

    // Get or create academic year and term
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

    let term = await termRepository.findActive();
    if (!term) {
      term = await termRepository.create({
        academicYear: { connect: { id: academicYear.id } },
        termType: "TERM_1",
        startDate: new Date(`${academicYear.year}-01-12`),
        endDate: new Date(`${academicYear.year}-04-10`),
        isActive: true,
      });
      log.info("Created test term: TERM_1");
    }
    testTermId = term.id;

    // Get first available student
    const students = await studentRepository.findMany({ take: 1 });
    if (students.length === 0) {
      throw new Error(
        "No students found in database. Please seed students first."
      );
    }
    testStudentId = students[0].id;
    log.info(`Using student: ${students[0].firstName} ${students[0].lastName}`);

    // Get first available class
    const classes = await classRepository.findMany({ take: 1 });
    if (classes.length === 0) {
      throw new Error(
        "No classes found in database. Please seed classes first."
      );
    }
    testClassId = classes[0].id;
    log.info(`Using class: ${classes[0].name}`);

    testDate = new Date();
    log.info(`Using date: ${testDate.toISOString().split("T")[0]}`);

    // ========================================
    // STEP 1: Create Attendance Record
    // ========================================
    log.step("Creating new attendance record (PRESENT)");

    const newRecord = await attendanceRecordRepository.create({
      student: { connect: { id: testStudentId } },
      class: { connect: { id: testClassId } },
      term: { connect: { id: testTermId } },
      date: testDate,
      status: "PRESENT",
      remarks: "On time",
    });

    createdRecordId = newRecord.id;

    log.data("Created Attendance Record", {
      id: newRecord.id,
      date: newRecord.date,
      status: newRecord.status,
      remarks: newRecord.remarks,
    });

    // ========================================
    // STEP 2: Find All Attendance Records
    // ========================================
    log.step("Fetching all attendance records");

    const allRecords = await attendanceRecordRepository.findAll();

    log.info(`Total attendance records in database: ${allRecords.length}`);
    if (allRecords.length > 0) {
      log.data(
        "Sample Records",
        allRecords.slice(0, 3).map((r) => ({
          student: `${r.student.firstName} ${r.student.lastName}`,
          date: r.date,
          status: r.status,
        }))
      );
    }

    // ========================================
    // STEP 3: Find by ID
    // ========================================
    log.step(`Fetching attendance record by ID: ${createdRecordId}`);

    const recordById = await attendanceRecordRepository.findById(
      createdRecordId
    );

    if (!recordById) {
      throw new Error("Failed to retrieve attendance record by ID");
    }

    log.data("Retrieved Record", {
      id: recordById.id,
      status: recordById.status,
      date: recordById.date,
    });

    // ========================================
    // STEP 4: Find by ID with Relations
    // ========================================
    log.step("Fetching attendance record with full relations");

    const recordWithRelations =
      await attendanceRecordRepository.findByIdWithRelations(createdRecordId);

    if (!recordWithRelations) {
      throw new Error("Failed to retrieve record with relations");
    }

    log.data("Record with Relations", {
      student: `${recordWithRelations.student.firstName} ${recordWithRelations.student.lastName}`,
      class: recordWithRelations.class.name,
      term: recordWithRelations.term.termType,
      status: recordWithRelations.status,
    });

    // ========================================
    // STEP 5: Find by Student
    // ========================================
    log.step(
      `Fetching attendance records for student: ${students[0].firstName} ${students[0].lastName}`
    );

    const studentRecords = await attendanceRecordRepository.findByStudent(
      testStudentId
    );

    log.info(`Records for student: ${studentRecords.length}`);

    // ========================================
    // STEP 6: Find by Class
    // ========================================
    log.step(`Fetching attendance records for class: ${classes[0].name}`);

    const classRecords = await attendanceRecordRepository.findByClass(
      testClassId
    );

    log.info(`Records for class: ${classRecords.length}`);

    // ========================================
    // STEP 7: Find by Term
    // ========================================
    log.step("Fetching attendance records for current term");

    const termRecords = await attendanceRecordRepository.findByTerm(testTermId);

    log.info(`Records for term: ${termRecords.length}`);

    // ========================================
    // STEP 8: Find by Student and Term
    // ========================================
    log.step("Fetching attendance records by student and term");

    const studentTermRecords =
      await attendanceRecordRepository.findByStudentAndTerm(
        testStudentId,
        testTermId
      );

    log.info(`Records for student + term: ${studentTermRecords.length}`);

    // ========================================
    // STEP 9: Find by Class and Date
    // ========================================
    log.step("Fetching attendance records by class and date");

    const classDateRecords =
      await attendanceRecordRepository.findByClassAndDate(
        testClassId,
        testDate
      );

    log.info(
      `Records for class on ${testDate.toISOString().split("T")[0]}: ${
        classDateRecords.length
      }`
    );

    // ========================================
    // STEP 10: Find by Student and Date (Unique)
    // ========================================
    log.step("Finding record by student and date (unique constraint)");

    const uniqueRecord = await attendanceRecordRepository.findByStudentAndDate(
      testStudentId,
      testDate
    );

    if (!uniqueRecord) {
      throw new Error("Should have found record by unique constraint");
    }

    log.data("Found Unique Record", {
      id: uniqueRecord.id,
      status: uniqueRecord.status,
    });

    // ========================================
    // STEP 11: Find by Status
    // ========================================
    log.step("Fetching PRESENT attendance records");

    const presentRecords = await attendanceRecordRepository.findByStatus(
      "PRESENT" as AttendanceStatus
    );

    log.info(`Present records: ${presentRecords.length}`);

    // ========================================
    // STEP 12: Get Student Term Stats
    // ========================================
    log.step("Calculating attendance statistics for student in term");

    const studentStats = await attendanceRecordRepository.getStudentTermStats(
      testStudentId,
      testTermId
    );

    log.data("Student Term Stats", studentStats);

    // ========================================
    // STEP 13: Get Class Date Stats
    // ========================================
    log.step("Calculating attendance statistics for class on date");

    const classStats = await attendanceRecordRepository.getClassDateStats(
      testClassId,
      testDate
    );

    log.data("Class Date Stats", classStats);

    // ========================================
    // STEP 14: Update Status
    // ========================================
    log.step("Updating attendance status to LATE");

    const updatedRecord = await attendanceRecordRepository.updateStatus(
      createdRecordId,
      "LATE" as AttendanceStatus
    );

    log.data("Updated Record", {
      id: updatedRecord.id,
      previousStatus: "PRESENT",
      newStatus: updatedRecord.status,
    });

    if (updatedRecord.status !== "LATE") {
      throw new Error("Status update failed");
    }
    log.info("✓ Verified: Status updated successfully");

    // ========================================
    // STEP 15: Update Attendance Record
    // ========================================
    log.step("Updating attendance record (changing remarks)");

    const updatedWithRemarks = await attendanceRecordRepository.update(
      createdRecordId,
      {
        remarks: "Arrived 15 minutes late",
      }
    );

    log.data("Updated Record", {
      status: updatedWithRemarks.status,
      previousRemarks: "On time",
      newRemarks: updatedWithRemarks.remarks,
    });

    // ========================================
    // STEP 16: Find Many with Filters
    // ========================================
    log.step("Testing findMany with filters");

    const filteredRecords = await attendanceRecordRepository.findMany({
      where: {
        status: "LATE",
      },
      take: 5,
    });

    log.info(`Filtered records (LATE): ${filteredRecords.length}`);

    // ========================================
    // STEP 17: Count Attendance Records
    // ========================================
    log.step("Counting attendance records");

    const totalCount = await attendanceRecordRepository.count();
    const presentCount = await attendanceRecordRepository.count({
      status: "PRESENT",
    });
    const lateCount = await attendanceRecordRepository.count({
      status: "LATE",
    });

    log.info(`Total records: ${totalCount}`);
    log.info(`Present records: ${presentCount}`);
    log.info(`Late records: ${lateCount}`);

    // ========================================
    // STEP 18: Delete Attendance Record
    // ========================================
    log.step("Deleting test attendance record");

    await attendanceRecordRepository.delete(createdRecordId);

    log.info(`Successfully deleted record with ID: ${createdRecordId}`);

    // Verify deletion
    const deletedRecord = await attendanceRecordRepository.findById(
      createdRecordId
    );
    if (deletedRecord) {
      throw new Error("Record was not properly deleted");
    }

    log.info("Verified: Record no longer exists in database");

    // ========================================
    // SUCCESS
    // ========================================
    log.success("✓ All repository operations validated successfully");
    log.info("Summary:");
    log.info("  - Create: ✓");
    log.info("  - Find All: ✓");
    log.info("  - Find by ID: ✓");
    log.info("  - Find by ID with Relations: ✓");
    log.info("  - Find by Student: ✓");
    log.info("  - Find by Class: ✓");
    log.info("  - Find by Term: ✓");
    log.info("  - Find by Student and Term: ✓");
    log.info("  - Find by Class and Date: ✓");
    log.info("  - Find by Student and Date (Unique): ✓");
    log.info("  - Find by Status: ✓");
    log.info("  - Get Student Term Stats: ✓");
    log.info("  - Get Class Date Stats: ✓");
    log.info("  - Update Status: ✓");
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
validateAttendanceRecordRepository();
