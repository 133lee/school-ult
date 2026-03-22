/**
 * Assessment Repository Validation Script
 *
 * Purpose: Validate CRUD operations on the Assessment table
 *
 * Architecture: Tests repository layer only (no services, no API, no validation)
 * Database: Uses real Prisma client with actual database
 *
 * Run with: npx tsx scripts/test-assessment-repository.ts
 */

import { assessmentRepository } from "@/features/assessments/assessment.repository";
import { subjectRepository } from "@/features/subjects/subject.repository";
import { classRepository } from "@/features/classes/class.repository";
import { termRepository } from "@/features/terms/term.repository";
import { academicYearRepository } from "@/features/academic-years/academicYear.repository";
import prisma from "@/lib/db/prisma";
import { ExamType, AssessmentStatus } from "@prisma/client";

// Logging utilities
const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  data: (label: string, data: any) =>
    console.log(`  ${label}:`, JSON.stringify(data, null, 2)),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateAssessmentRepository() {
  let createdAssessmentId: string | null = null;
  let testSubjectId: string | null = null;
  let testClassId: string | null = null;
  let testTermId: string | null = null;
  let testAcademicYearId: string | null = null;

  try {
    log.step("Starting Assessment Repository Validation");

    // ========================================
    // STEP 0: Setup Test Dependencies
    // ========================================
    log.step("Setting up test dependencies (Subject, Class, Term)");

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

    // Get or create term
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

    // Get first available subject
    const subjects = await subjectRepository.findMany({ take: 1 });
    if (subjects.length === 0) {
      throw new Error(
        "No subjects found in database. Please seed subjects first."
      );
    }
    testSubjectId = subjects[0].id;
    log.info(`Using subject: ${subjects[0].name} (${subjects[0].code})`);

    // Get first available class
    const classes = await classRepository.findMany({ take: 1 });
    if (classes.length === 0) {
      throw new Error(
        "No classes found in database. Please seed classes first."
      );
    }
    testClassId = classes[0].id;
    log.info(`Using class: ${classes[0].name}`);

    // ========================================
    // STEP 1: Create Assessment
    // ========================================
    log.step("Creating new assessment (CAT)");

    const newAssessment = await assessmentRepository.create({
      title: "Test CAT Assessment",
      examType: "CAT",
      subject: { connect: { id: testSubjectId } },
      class: { connect: { id: testClassId } },
      term: { connect: { id: testTermId } },
      assessmentDate: new Date(),
      totalMarks: 30,
      passMark: 15,
      status: "DRAFT",
    });

    createdAssessmentId = newAssessment.id;

    log.data("Created Assessment", {
      id: newAssessment.id,
      title: newAssessment.title,
      examType: newAssessment.examType,
      totalMarks: newAssessment.totalMarks,
      status: newAssessment.status,
    });

    // ========================================
    // STEP 2: Find All Assessments
    // ========================================
    log.step("Fetching all assessments");

    const allAssessments = await assessmentRepository.findAll();

    log.info(`Total assessments in database: ${allAssessments.length}`);
    if (allAssessments.length > 0) {
      log.data(
        "Sample Assessments",
        allAssessments.slice(0, 3).map((a) => ({
          title: a.title,
          examType: a.examType,
          status: a.status,
        }))
      );
    }

    // ========================================
    // STEP 3: Find by ID
    // ========================================
    log.step(`Fetching assessment by ID: ${createdAssessmentId}`);

    const assessmentById = await assessmentRepository.findById(
      createdAssessmentId
    );

    if (!assessmentById) {
      throw new Error("Failed to retrieve assessment by ID");
    }

    log.data("Retrieved Assessment", {
      id: assessmentById.id,
      title: assessmentById.title,
      examType: assessmentById.examType,
    });

    // ========================================
    // STEP 4: Find by ID with Relations
    // ========================================
    log.step("Fetching assessment with full relations");

    const assessmentWithRelations =
      await assessmentRepository.findByIdWithRelations(createdAssessmentId);

    if (!assessmentWithRelations) {
      throw new Error("Failed to retrieve assessment with relations");
    }

    log.data("Assessment with Relations", {
      title: assessmentWithRelations.title,
      subject: assessmentWithRelations.subject.name,
      class: assessmentWithRelations.class.name,
      term: assessmentWithRelations.term.termType,
      resultCount: assessmentWithRelations._count.results,
    });

    // ========================================
    // STEP 5: Find by Class
    // ========================================
    log.step(`Fetching assessments for class: ${classes[0].name}`);

    const classAssessments = await assessmentRepository.findByClass(
      testClassId
    );

    log.info(`Assessments for class: ${classAssessments.length}`);
    classAssessments.slice(0, 3).forEach((a) => {
      log.info(`  - ${a.title} (${a.examType}): ${a.subject.name}`);
    });

    // ========================================
    // STEP 6: Find by Subject
    // ========================================
    log.step(`Fetching assessments for subject: ${subjects[0].name}`);

    const subjectAssessments = await assessmentRepository.findBySubject(
      testSubjectId
    );

    log.info(`Assessments for subject: ${subjectAssessments.length}`);

    // ========================================
    // STEP 7: Find by Term
    // ========================================
    log.step("Fetching assessments for current term");

    const termAssessments = await assessmentRepository.findByTerm(testTermId);

    log.info(`Assessments for term: ${termAssessments.length}`);

    // ========================================
    // STEP 8: Find by Type
    // ========================================
    log.step("Fetching all CAT assessments");

    const catAssessments = await assessmentRepository.findByType(
      "CAT" as ExamType
    );

    log.info(`Total CAT assessments: ${catAssessments.length}`);

    // ========================================
    // STEP 9: Find by Status
    // ========================================
    log.step("Fetching DRAFT assessments");

    const draftAssessments = await assessmentRepository.findByStatus(
      "DRAFT" as AssessmentStatus
    );

    log.info(`Draft assessments: ${draftAssessments.length}`);

    // ========================================
    // STEP 10: Find by Term and Class
    // ========================================
    log.step("Fetching assessments by term and class");

    const termClassAssessments = await assessmentRepository.findByTermAndClass(
      testTermId,
      testClassId
    );

    log.info(`Assessments for term + class: ${termClassAssessments.length}`);

    // ========================================
    // STEP 11: Update Status
    // ========================================
    log.step("Updating assessment status to PUBLISHED");

    const publishedAssessment = await assessmentRepository.updateStatus(
      createdAssessmentId,
      "PUBLISHED" as AssessmentStatus
    );

    log.data("Updated Assessment", {
      title: publishedAssessment.title,
      previousStatus: "DRAFT",
      newStatus: publishedAssessment.status,
    });

    if (publishedAssessment.status !== "PUBLISHED") {
      throw new Error("Status update failed");
    }
    log.info("✓ Verified: Status updated successfully");

    // ========================================
    // STEP 12: Update Assessment
    // ========================================
    log.step("Updating assessment (changing total marks)");

    const updatedAssessment = await assessmentRepository.update(
      createdAssessmentId,
      {
        totalMarks: 40,
        passMark: 20,
      }
    );

    log.data("Updated Assessment", {
      title: updatedAssessment.title,
      previousTotalMarks: 30,
      newTotalMarks: updatedAssessment.totalMarks,
      previousPassMark: 15,
      newPassMark: updatedAssessment.passMark,
    });

    // ========================================
    // STEP 13: Find Many with Filters
    // ========================================
    log.step("Testing findMany with filters");

    const filteredAssessments = await assessmentRepository.findMany({
      where: {
        examType: "CAT",
        status: "PUBLISHED",
      },
      take: 5,
    });

    log.info(
      `Filtered assessments (CAT + PUBLISHED): ${filteredAssessments.length}`
    );

    // ========================================
    // STEP 14: Count Assessments
    // ========================================
    log.step("Counting assessments");

    const totalCount = await assessmentRepository.count();
    const catCount = await assessmentRepository.count({ examType: "CAT" });
    const publishedCount = await assessmentRepository.count({
      status: "PUBLISHED",
    });

    log.info(`Total assessments: ${totalCount}`);
    log.info(`CAT assessments: ${catCount}`);
    log.info(`Published assessments: ${publishedCount}`);

    // ========================================
    // STEP 15: Check Result Count
    // ========================================
    log.step("Checking result count for assessment");

    const resultCount = await assessmentRepository.getResultCount(
      createdAssessmentId
    );

    log.info(`Results for this assessment: ${resultCount}`);

    const hasResults = await assessmentRepository.hasResults(
      createdAssessmentId
    );

    log.info(`Has results: ${hasResults ? "Yes" : "No"}`);

    // ========================================
    // STEP 16: Delete Assessment
    // ========================================
    log.step("Deleting test assessment");

    await assessmentRepository.delete(createdAssessmentId);

    log.info(`Successfully deleted assessment with ID: ${createdAssessmentId}`);

    // Verify deletion
    const deletedAssessment = await assessmentRepository.findById(
      createdAssessmentId
    );
    if (deletedAssessment) {
      throw new Error("Assessment was not properly deleted");
    }

    log.info("Verified: Assessment no longer exists in database");

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
    log.info("  - Find by Subject: ✓");
    log.info("  - Find by Term: ✓");
    log.info("  - Find by Type: ✓");
    log.info("  - Find by Status: ✓");
    log.info("  - Find by Term and Class: ✓");
    log.info("  - Update Status: ✓");
    log.info("  - Update: ✓");
    log.info("  - Find Many (filtered): ✓");
    log.info("  - Count: ✓");
    log.info("  - Get Result Count: ✓");
    log.info("  - Has Results: ✓");
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
validateAssessmentRepository();
