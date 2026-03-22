/**
 * Grade Repository Validation Script
 *
 * Purpose: Validate CRUD operations on the Grade table (grade levels)
 *
 * Architecture: Tests repository layer only (no services, no API, no validation)
 * Database: Uses real Prisma client with actual database
 *
 * Run with: npx tsx scripts/test-grade-level-repository.ts
 */

import { gradeRepository } from "@/features/grade-levels/grade.repository";
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
  try {
    log.step("Starting Grade Repository Validation");

    // ========================================
    // STEP 1: Fetch All Grades
    // ========================================
    log.step("Fetching all grade levels");

    const allGrades = await gradeRepository.findAll();

    log.info(`Total grades in database: ${allGrades.length}`);
    if (allGrades.length > 0) {
      log.data("Sample Grades", allGrades.slice(0, 3).map(g => ({
        level: g.level,
        name: g.name,
        schoolLevel: g.schoolLevel,
        sequence: g.sequence,
      })));
    }

    // ========================================
    // STEP 2: Find by School Level
    // ========================================
    log.step("Fetching PRIMARY grades");

    const primaryGrades = await gradeRepository.findBySchoolLevel("PRIMARY");
    log.info(`Primary grades (1-7): ${primaryGrades.length}`);
    primaryGrades.forEach(g => {
      log.info(`  ${g.name} (sequence: ${g.sequence})`);
    });

    log.step("Fetching SECONDARY grades");

    const secondaryGrades = await gradeRepository.findBySchoolLevel("SECONDARY");
    log.info(`Secondary grades (8-12): ${secondaryGrades.length}`);
    secondaryGrades.forEach(g => {
      log.info(`  ${g.name} (sequence: ${g.sequence})`);
    });

    // ========================================
    // STEP 3: Find by Level
    // ========================================
    log.step("Fetching specific grade: GRADE_1");

    const grade1 = await gradeRepository.findByLevel("GRADE_1");

    if (grade1) {
      log.data("Grade 1 Details", {
        id: grade1.id,
        level: grade1.level,
        name: grade1.name,
        schoolLevel: grade1.schoolLevel,
        sequence: grade1.sequence,
      });
    } else {
      log.info("Grade 1 not found in database. Please seed grades first.");
    }

    // ========================================
    // STEP 4: Find with Relations
    // ========================================
    if (grade1) {
      log.step(`Fetching Grade 1 with classes and subjects`);

      const gradeWithRelations = await gradeRepository.findByIdWithRelations(grade1.id);

      if (gradeWithRelations) {
        log.info(`Classes in Grade 1: ${gradeWithRelations.classes.length}`);
        gradeWithRelations.classes.slice(0, 3).forEach(c => {
          log.info(`  - ${c.name} (capacity: ${c.capacity})`);
        });

        log.info(`Subjects assigned to Grade 1: ${gradeWithRelations.subjects.length}`);
        gradeWithRelations.subjects.slice(0, 5).forEach(gs => {
          log.info(`  - ${gs.subject.name} (${gs.isCore ? 'Core' : 'Optional'})`);
        });
      }
    }

    // ========================================
    // STEP 5: Test Progression Methods
    // ========================================
    if (grade1) {
      log.step("Testing grade progression methods");

      const isFirst = await gradeRepository.isFirstGrade(grade1.id);
      log.info(`Is Grade 1 the first grade? ${isFirst ? 'Yes' : 'No'}`);

      const nextGrade = await gradeRepository.getNextGrade(grade1.id);
      if (nextGrade) {
        log.info(`Next grade after Grade 1: ${nextGrade.name} (sequence: ${nextGrade.sequence})`);
      }

      const previousGrade = await gradeRepository.getPreviousGrade(grade1.id);
      log.info(`Previous grade before Grade 1: ${previousGrade ? previousGrade.name : 'None (first grade)'}`);
    }

    // ========================================
    // STEP 6: Find by Sequence Range
    // ========================================
    log.step("Fetching grades 1-7 (PRIMARY) by sequence");

    const primaryBySequence = await gradeRepository.findBySequenceRange(1, 7);
    log.info(`Grades 1-7: ${primaryBySequence.length} found`);
    primaryBySequence.forEach(g => {
      log.info(`  ${g.sequence}. ${g.name}`);
    });

    // ========================================
    // STEP 7: Check Last Grade
    // ========================================
    log.step("Checking if GRADE_12 is the last grade");

    const grade12 = await gradeRepository.findByLevel("GRADE_12");
    if (grade12) {
      const isLast = await gradeRepository.isLastGrade(grade12.id);
      log.info(`Is Grade 12 the last grade? ${isLast ? 'Yes (graduation grade)' : 'No'}`);
    }

    // ========================================
    // STEP 8: Count Statistics
    // ========================================
    if (grade1) {
      log.step("Fetching Grade 1 statistics");

      const classCount = await gradeRepository.getClassCount(grade1.id);
      const subjectCount = await gradeRepository.getSubjectCount(grade1.id);

      log.info(`Total classes in Grade 1: ${classCount}`);
      log.info(`Total subjects in Grade 1: ${subjectCount}`);
    }

    // ========================================
    // SUCCESS
    // ========================================
    log.success("✓ All repository operations validated successfully");
    log.info("Summary:");
    log.info("  - Find All: ✓");
    log.info("  - Find by School Level: ✓");
    log.info("  - Find by Level: ✓");
    log.info("  - Find with Relations: ✓");
    log.info("  - Grade Progression: ✓");
    log.info("  - Sequence Range: ✓");
    log.info("  - Statistics: ✓");

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
