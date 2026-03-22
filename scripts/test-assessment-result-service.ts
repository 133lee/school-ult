/**
 * Assessment Result Service Validation Script
 *
 * Purpose: Validate business logic and service operations for student assessment results
 *
 * Architecture: Tests service layer (business logic + validation)
 * Database: Uses real Prisma client with actual database
 *
 * Run with: npx tsx scripts/test-assessment-result-service.ts
 */

import { studentAssessmentResultService as gradeService } from "@/features/assessment-results/studentAssessmentResult.service";
import prisma from "@/lib/db/prisma";

// Logging utilities
const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  data: (label: string, data: any) => console.log(`  ${label}:`, JSON.stringify(data, null, 2)),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
  warn: (msg: string) => console.warn(`\n⚠️  WARNING: ${msg}`),
};

async function validateGradeService() {
  let createdGradeId: string | null = null;
  let testStudentId: string | null = null;
  let testAssessmentId: string | null = null;
  let testSubjectId: string | null = null;

  try {
    log.step("Starting Grade Service Validation");

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
      throw new Error("No published assessment found. Please seed the database first.");
    }

    testAssessmentId = assessment.id;
    log.info(`Found assessment: ${assessment.title} (${assessment.examType})`);

    const subject = await prisma.subject.findFirst();

    if (!subject) {
      throw new Error("No subject found. Please seed the database first.");
    }

    testSubjectId = subject.id;
    log.info(`Found subject: ${subject.name} (${subject.code})`);

    // ========================================
    // STEP 1: Test Create with Validation
    // ========================================
    log.step("Testing grade creation with business logic");

    const newGrade = await gradeService.createGrade({
      studentId: testStudentId,
      assessmentId: testAssessmentId,
      subjectId: testSubjectId,
      marksObtained: 85.5,
      grade: "GRADE_1",
      remarks: "Excellent performance - service layer test",
    });

    createdGradeId = newGrade.id;

    log.data("Created Grade via Service", {
      id: newGrade.id,
      student: `${newGrade.student.firstName} ${newGrade.student.lastName}`,
      marks: newGrade.marksObtained,
      grade: newGrade.grade,
    });

    // ========================================
    // STEP 2: Test Validation - Invalid Marks
    // ========================================
    log.step("Testing validation - marks out of range");

    try {
      await gradeService.createGrade({
        studentId: testStudentId,
        assessmentId: testAssessmentId,
        subjectId: testSubjectId,
        marksObtained: 150, // Invalid - over 100
        grade: "GRADE_1",
      });
      throw new Error("Should have thrown validation error for marks > 100");
    } catch (error) {
      if (error instanceof Error && error.message.includes("between 0 and 100")) {
        log.info("✓ Validation passed: Rejected marks > 100");
      } else {
        throw error;
      }
    }

    try {
      await gradeService.createGrade({
        studentId: testStudentId,
        assessmentId: testAssessmentId,
        subjectId: testSubjectId,
        marksObtained: -10, // Invalid - negative
        grade: "GRADE_9",
      });
      throw new Error("Should have thrown validation error for negative marks");
    } catch (error) {
      if (error instanceof Error && error.message.includes("between 0 and 100")) {
        log.info("✓ Validation passed: Rejected negative marks");
      } else {
        throw error;
      }
    }

    // ========================================
    // STEP 3: Test Duplicate Prevention
    // ========================================
    log.step("Testing duplicate grade prevention");

    try {
      await gradeService.createGrade({
        studentId: testStudentId,
        assessmentId: testAssessmentId,
        subjectId: testSubjectId,
        marksObtained: 90,
        grade: "GRADE_1",
      });
      throw new Error("Should have thrown error for duplicate grade");
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        log.info("✓ Duplicate prevention: Rejected duplicate grade entry");
      } else {
        throw error;
      }
    }

    // ========================================
    // STEP 4: Test Get Grade by ID
    // ========================================
    log.step(`Fetching grade by ID via service: ${createdGradeId}`);

    const gradeById = await gradeService.getGradeById(createdGradeId);

    log.data("Retrieved Grade", {
      marks: gradeById.marksObtained,
      grade: gradeById.grade,
      remarks: gradeById.remarks,
    });

    // ========================================
    // STEP 5: Test Update with Validation
    // ========================================
    log.step("Testing grade update with validation");

    const updatedGrade = await gradeService.updateGrade(createdGradeId, {
      marksObtained: 92.0,
      grade: "GRADE_1",
      remarks: "Updated via service layer",
    });

    log.data("Updated Grade", {
      previousMarks: 85.5,
      newMarks: updatedGrade.marksObtained,
      newRemarks: updatedGrade.remarks,
    });

    // Test update validation
    try {
      await gradeService.updateGrade(createdGradeId, {
        marksObtained: 110, // Invalid
      });
      throw new Error("Should have thrown validation error");
    } catch (error) {
      if (error instanceof Error && error.message.includes("between 0 and 100")) {
        log.info("✓ Update validation: Rejected invalid marks");
      } else {
        throw error;
      }
    }

    // ========================================
    // STEP 6: Test Get Grades by Student
    // ========================================
    log.step(`Fetching all grades for student: ${testStudentId}`);

    const studentGrades = await gradeService.getGradesByStudent(testStudentId);

    log.info(`Total grades for student: ${studentGrades.length}`);

    // ========================================
    // STEP 7: Test Get Grades by Assessment
    // ========================================
    log.step(`Fetching all grades for assessment: ${testAssessmentId}`);

    const assessmentGrades = await gradeService.getGradesByAssessment(testAssessmentId);

    log.info(`Total grades for assessment: ${assessmentGrades.length}`);

    // ========================================
    // STEP 8: Test Class Average Calculation
    // ========================================
    log.step("Testing class average calculation");

    const average = await gradeService.getClassAverage(testAssessmentId);

    log.data("Class Statistics", {
      average: average.average,
      totalStudents: average.totalStudents,
      gradedStudents: average.gradedStudents,
    });

    // ========================================
    // STEP 9: Test Grade Distribution
    // ========================================
    log.step("Testing grade distribution analysis");

    const distribution = await gradeService.getGradeDistribution(testAssessmentId);

    log.data("Grade Distribution", distribution);

    // ========================================
    // STEP 10: Test Bulk Create
    // ========================================
    log.step("Testing bulk grade creation");

    // Get more students for bulk test
    const students = await prisma.student.findMany({
      where: { status: "ACTIVE" },
      take: 3,
      skip: 1, // Skip first one (already has grade)
    });

    if (students.length > 0) {
      const bulkGrades = students.map((s) => ({
        studentId: s.id,
        assessmentId: testAssessmentId,
        subjectId: testSubjectId,
        marksObtained: Math.floor(Math.random() * 40) + 60, // Random 60-100
        grade: "GRADE_2" as const,
        remarks: "Bulk created via service",
      }));

      const bulkResult = await gradeService.bulkCreateGrades(bulkGrades);

      log.data("Bulk Creation Result", {
        successCount: bulkResult.successCount,
        errorCount: bulkResult.errorCount,
      });

      // Clean up bulk created grades
      for (const grade of bulkResult.success) {
        await prisma.studentAssessmentResult.delete({ where: { id: grade.id } });
      }
      log.info("✓ Cleaned up bulk test data");
    }

    // ========================================
    // STEP 11: Test Delete with Validation
    // ========================================
    log.step("Testing grade deletion");

    await gradeService.deleteGrade(createdGradeId);

    log.info(`Successfully deleted grade with ID: ${createdGradeId}`);

    // Verify deletion
    try {
      await gradeService.getGradeById(createdGradeId);
      throw new Error("Grade should not exist after deletion");
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        log.info("✓ Verified: Grade no longer exists");
      } else {
        throw error;
      }
    }

    // Test delete non-existent
    try {
      await gradeService.deleteGrade("non-existent-id");
      throw new Error("Should have thrown error for non-existent grade");
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        log.info("✓ Delete validation: Rejected non-existent grade");
      } else {
        throw error;
      }
    }

    // ========================================
    // SUCCESS
    // ========================================
    log.success("✓ All service layer operations validated successfully");
    log.info("Summary:");
    log.info("  Business Logic:");
    log.info("    - Create with validation: ✓");
    log.info("    - Marks range validation: ✓");
    log.info("    - Duplicate prevention: ✓");
    log.info("    - Update with validation: ✓");
    log.info("    - Delete with validation: ✓");
    log.info("  Data Operations:");
    log.info("    - Read by ID: ✓");
    log.info("    - Read by Student: ✓");
    log.info("    - Read by Assessment: ✓");
    log.info("  Analytics:");
    log.info("    - Class average: ✓");
    log.info("    - Grade distribution: ✓");
    log.info("    - Bulk operations: ✓");

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
validateGradeService();
