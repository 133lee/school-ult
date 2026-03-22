/**
 * ReportCard Repository Validation Script
 *
 * Purpose: Validate CRUD operations on the ReportCard table
 *
 * Architecture: Tests repository layer only (no services, no API, no validation)
 * Database: Uses real Prisma client with actual database
 *
 * Run with: npx tsx scripts/test-report-card-repository.ts
 */

import { reportCardRepository } from "@/features/report-cards/reportCard.repository";
import { studentRepository } from "@/features/students/student.repository";
import { classRepository } from "@/features/classes/class.repository";
import { termRepository } from "@/features/terms/term.repository";
import { academicYearRepository } from "@/features/academic-years/academicYear.repository";
import { teacherRepository } from "@/features/teachers/teacher.repository";
import prisma from "@/lib/db/prisma";

// Logging utilities
const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  data: (label: string, data: any) =>
    console.log(`  ${label}:`, JSON.stringify(data, null, 2)),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateReportCardRepository() {
  let createdReportCardId: string | null = null;
  let testStudentId: string | null = null;
  let testClassId: string | null = null;
  let testTermId: string | null = null;
  let testAcademicYearId: string | null = null;
  let testTeacherId: string | null = null;

  try {
    log.step("Starting ReportCard Repository Validation");

    // ========================================
    // STEP 0: Setup Test Dependencies
    // ========================================
    log.step("Setting up test dependencies");

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
    testAcademicYearId = academicYear.id;

    let term = await termRepository.findActive();
    if (!term) {
      term = await termRepository.create({
        academicYear: { connect: { id: testAcademicYearId } },
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
    // STEP 1: Create Report Card
    // ========================================
    log.step("Creating new report card");

    const newReportCard = await reportCardRepository.create({
      student: { connect: { id: testStudentId } },
      class: { connect: { id: testClassId } },
      term: { connect: { id: testTermId } },
      academicYear: { connect: { id: testAcademicYearId } },
      classTeacher: { connect: { id: testTeacherId } },
      attendance: 45,
      daysPresent: 43,
      daysAbsent: 2,
      classTeacherRemarks: "Good progress",
    });

    createdReportCardId = newReportCard.id;

    log.data("Created Report Card", {
      id: newReportCard.id,
      attendance: newReportCard.attendance,
      daysPresent: newReportCard.daysPresent,
      daysAbsent: newReportCard.daysAbsent,
    });

    // ========================================
    // STEP 2: Find All Report Cards
    // ========================================
    log.step("Fetching all report cards");

    const allReportCards = await reportCardRepository.findAll();

    log.info(`Total report cards in database: ${allReportCards.length}`);

    // ========================================
    // STEP 3: Find by ID
    // ========================================
    log.step(`Fetching report card by ID: ${createdReportCardId}`);

    const reportCardById = await reportCardRepository.findById(
      createdReportCardId
    );

    if (!reportCardById) {
      throw new Error("Failed to retrieve report card by ID");
    }

    log.data("Retrieved Report Card", {
      id: reportCardById.id,
      attendance: reportCardById.attendance,
    });

    // ========================================
    // STEP 4: Find by ID with Relations
    // ========================================
    log.step("Fetching report card with full relations");

    const reportCardWithRelations =
      await reportCardRepository.findByIdWithRelations(createdReportCardId);

    if (!reportCardWithRelations) {
      throw new Error("Failed to retrieve report card with relations");
    }

    log.data("Report Card with Relations", {
      student: `${reportCardWithRelations.student.firstName} ${reportCardWithRelations.student.lastName}`,
      class: reportCardWithRelations.class.name,
      term: reportCardWithRelations.term.termType,
      subjectCount: reportCardWithRelations.subjects.length,
    });

    // ========================================
    // STEP 5: Find by Student
    // ========================================
    log.step(`Fetching report cards for student`);

    const studentReportCards = await reportCardRepository.findByStudent(
      testStudentId
    );

    log.info(`Report cards for student: ${studentReportCards.length}`);

    // ========================================
    // STEP 6: Find by Class
    // ========================================
    log.step("Fetching report cards for class");

    const classReportCards = await reportCardRepository.findByClass(
      testClassId
    );

    log.info(`Report cards for class: ${classReportCards.length}`);

    // ========================================
    // STEP 7: Find by Term
    // ========================================
    log.step("Fetching report cards for term");

    const termReportCards = await reportCardRepository.findByTerm(testTermId);

    log.info(`Report cards for term: ${termReportCards.length}`);

    // ========================================
    // STEP 8: Find by Academic Year
    // ========================================
    log.step("Fetching report cards for academic year");

    const yearReportCards = await reportCardRepository.findByAcademicYear(
      testAcademicYearId
    );

    log.info(`Report cards for academic year: ${yearReportCards.length}`);

    // ========================================
    // STEP 9: Find by Student and Term (Unique)
    // ========================================
    log.step("Finding report card by student and term (unique)");

    const uniqueReportCard = await reportCardRepository.findByStudentAndTerm(
      testStudentId,
      testTermId
    );

    if (!uniqueReportCard) {
      throw new Error("Should have found report card by unique constraint");
    }

    log.data("Found Unique Report Card", {
      id: uniqueReportCard.id,
    });

    // ========================================
    // STEP 10: Update Report Card
    // ========================================
    log.step("Updating report card");

    const updatedReportCard = await reportCardRepository.update(
      createdReportCardId,
      {
        totalMarks: 450,
        averageMark: 75.5,
        position: 5,
        outOf: 30,
        headTeacherRemarks: "Excellent performance",
      }
    );

    log.data("Updated Report Card", {
      totalMarks: updatedReportCard.totalMarks,
      averageMark: updatedReportCard.averageMark,
      position: updatedReportCard.position,
      outOf: updatedReportCard.outOf,
    });

    // ========================================
    // STEP 11: Count Report Cards
    // ========================================
    log.step("Counting report cards");

    const totalCount = await reportCardRepository.count();

    log.info(`Total report cards: ${totalCount}`);

    // ========================================
    // STEP 12: Delete Report Card
    // ========================================
    log.step("Deleting test report card");

    await reportCardRepository.delete(createdReportCardId);

    log.info(
      `Successfully deleted report card with ID: ${createdReportCardId}`
    );

    // Verify deletion
    const deletedReportCard = await reportCardRepository.findById(
      createdReportCardId
    );
    if (deletedReportCard) {
      throw new Error("Report card was not properly deleted");
    }

    log.info("Verified: Report card no longer exists in database");

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
    log.info("  - Find by Academic Year: ✓");
    log.info("  - Find by Student and Term (Unique): ✓");
    log.info("  - Update: ✓");
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
    await prisma.$disconnect();
    log.info("\n→ Prisma connection closed");
  }
}

// Execute validation
validateReportCardRepository();
