/**
 * Grade Repository Validation Script
 *
 * Purpose: Validate CRUD operations on the StudentAssessmentResult table
 *
 * Architecture: Tests repository layer only (no services, no API, no validation)
 * Database: Uses real Prisma client with actual database
 *
 * Run with: npx tsx scripts/test-grade-repository.ts
 */

import { studentAssessmentResultRepository } from "@/features/assessment-results/studentAssessmentResult.repository";
import prisma from "@/lib/db/prisma";

// Logging utilities
const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  data: (label: string, data: any) => console.log(`  ${label}:`, JSON.stringify(data, null, 2)),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateGradeRepository() {
  let createdGradeId: string | null = null;
  let testStudentId: string | null = null;
  let testAssessmentId: string | null = null;
  let testSubjectId: string | null = null;

  try {
    log.step("Starting Grade Repository Validation");

    // ========================================
    // STEP 0: Fetch Test Data Dependencies
    // ========================================
    log.step("Fetching test data (Student, Assessment, Subject)");

    const student = await prisma.student.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!student) {
      throw new Error("No active student found in database. Please seed the database first.");
    }

    testStudentId = student.id;
    log.info(`Found student: ${student.firstName} ${student.lastName} (${student.studentNumber})`);

    const assessment = await prisma.assessment.findFirst({
      where: { status: "PUBLISHED" },
    });

    if (!assessment) {
      throw new Error("No published assessment found. Please create an assessment first.");
    }

    testAssessmentId = assessment.id;
    log.info(`Found assessment: ${assessment.title} (${assessment.examType})`);

    const subject = await prisma.subject.findFirst();

    if (!subject) {
      throw new Error("No subject found. Please create a subject first.");
    }

    testSubjectId = subject.id;
    log.info(`Found subject: ${subject.name} (${subject.code})`);

    // ========================================
    // STEP 1: Create a Grade Record
    // ========================================
    log.step("Creating new grade record");

    const newGrade = await studentAssessmentResultRepository.create({
      studentId: testStudentId,
      assessmentId: testAssessmentId,
      subjectId: testSubjectId,
      marksObtained: 87.5,
      grade: "GRADE_2", // Very Good
      remarks: "Excellent performance on test validation script",
    });

    createdGradeId = newGrade.id;

    log.data("Created Grade", {
      id: newGrade.id,
      student: `${newGrade.student.firstName} ${newGrade.student.lastName}`,
      subject: newGrade.subject.name,
      assessment: newGrade.assessment.title,
      marksObtained: newGrade.marksObtained,
      grade: newGrade.grade,
    });

    // ========================================
    // STEP 2: Fetch All Grades
    // ========================================
    log.step("Fetching all grades");

    const allGrades = await studentAssessmentResultRepository.findAll();

    log.info(`Total grades in database: ${allGrades.length}`);
    if (allGrades.length > 0) {
      log.data("Sample Grade", {
        student: `${allGrades[0].student.firstName} ${allGrades[0].student.lastName}`,
        subject: allGrades[0].subject.name,
        marks: allGrades[0].marksObtained,
      });
    }

    // ========================================
    // STEP 3: Fetch Grade by ID
    // ========================================
    log.step(`Fetching grade by ID: ${createdGradeId}`);

    const gradeById = await studentAssessmentResultRepository.findById(createdGradeId);

    if (!gradeById) {
      throw new Error("Failed to retrieve grade by ID");
    }

    log.data("Retrieved Grade", {
      id: gradeById.id,
      marks: gradeById.marksObtained,
      grade: gradeById.grade,
      remarks: gradeById.remarks,
    });

    // ========================================
    // STEP 4: Update the Grade
    // ========================================
    log.step("Updating grade (score and remarks)");

    const updatedGrade = await studentAssessmentResultRepository.update(createdGradeId, {
      marksObtained: 92.0,
      grade: "GRADE_1", // Distinction
      remarks: "Updated: Outstanding work - repository validation passed",
    });

    log.data("Updated Grade", {
      id: updatedGrade.id,
      previousMarks: 87.5,
      newMarks: updatedGrade.marksObtained,
      previousGrade: "GRADE_2",
      newGrade: updatedGrade.grade,
    });

    // ========================================
    // STEP 5: Fetch by Student ID
    // ========================================
    log.step(`Fetching all grades for student: ${testStudentId}`);

    const studentGrades = await studentAssessmentResultRepository.findByStudentId(testStudentId);

    log.info(`Total grades for this student: ${studentGrades.length}`);
    studentGrades.forEach((g, idx) => {
      log.info(
        `  ${idx + 1}. ${g.assessment.title} - ${g.subject.name}: ${g.marksObtained} marks`
      );
    });

    // ========================================
    // STEP 6: Fetch by Assessment ID
    // ========================================
    log.step(`Fetching all grades for assessment: ${testAssessmentId}`);

    const assessmentGrades = await studentAssessmentResultRepository.findByAssessmentId(testAssessmentId);

    log.info(`Total grades for this assessment: ${assessmentGrades.length}`);

    // ========================================
    // STEP 7: Delete the Grade
    // ========================================
    log.step("Deleting test grade record");

    await studentAssessmentResultRepository.delete(createdGradeId);

    log.info(`Successfully deleted grade with ID: ${createdGradeId}`);

    // Verify deletion
    const deletedGrade = await studentAssessmentResultRepository.findById(createdGradeId);
    if (deletedGrade) {
      throw new Error("Grade was not properly deleted");
    }

    log.info("Verified: Grade no longer exists in database");

    // ========================================
    // SUCCESS
    // ========================================
    log.success("✓ All repository operations validated successfully");
    log.info("Summary:");
    log.info("  - Create: ✓");
    log.info("  - Read All: ✓");
    log.info("  - Read by ID: ✓");
    log.info("  - Read by Student: ✓");
    log.info("  - Read by Assessment: ✓");
    log.info("  - Update: ✓");
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
validateGradeRepository();
