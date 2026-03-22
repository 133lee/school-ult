/**
 * GradeSubject Repository Validation Script
 */

import { gradeSubjectRepository } from "@/features/grade-subjects/gradeSubject.repository";
import { gradeRepository } from "@/features/grade-levels/grade.repository";
import { subjectRepository } from "@/features/subjects/subject.repository";
import prisma from "@/lib/db/prisma";

const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateGradeSubjectRepository() {
  let createdId: string | null = null;
  let gradeId: string | null = null;
  let subjectId: string | null = null;

  try {
    log.step("Starting GradeSubject Repository Validation");

    // Get grade and subject
    const grades = await gradeRepository.findMany({ take: 1 });
    const subjects = await subjectRepository.findMany({ take: 1 });

    if (grades.length === 0 || subjects.length === 0) {
      throw new Error("Need grades and subjects in database");
    }

    gradeId = grades[0].id;
    subjectId = subjects[0].id;
    log.info(`Using grade: ${grades[0].name}`);
    log.info(`Using subject: ${subjects[0].name}`);

    // Create
    log.step("Creating grade-subject association");
    const newAssoc = await gradeSubjectRepository.create({
      grade: { connect: { id: gradeId } },
      subject: { connect: { id: subjectId } },
      isCore: true,
    });
    createdId = newAssoc.id;
    log.info(`Created: ${createdId}`);

    // Find All
    log.step("Finding all associations");
    const all = await gradeSubjectRepository.findAll();
    log.info(`Total: ${all.length}`);

    // Find by Grade
    log.step("Finding by grade");
    const byGrade = await gradeSubjectRepository.findByGrade(gradeId);
    log.info(`By grade: ${byGrade.length}`);

    // Find core subjects
    log.step("Finding core subjects for grade");
    const coreSubjects = await gradeSubjectRepository.findCoreByGrade(gradeId);
    log.info(`Core subjects: ${coreSubjects.length}`);

    // Find by Subject
    log.step("Finding by subject");
    const bySubject = await gradeSubjectRepository.findBySubject(subjectId);
    log.info(`By subject: ${bySubject.length}`);

    // Find by unique constraint
    log.step("Finding by grade and subject");
    const unique = await gradeSubjectRepository.findByGradeAndSubject(gradeId, subjectId);
    if (!unique) throw new Error("Should find by unique constraint");
    log.info("✓ Found by unique constraint");

    // Check if taught
    log.step("Checking if subject is taught in grade");
    const isTaught = await gradeSubjectRepository.isTaughtInGrade(gradeId, subjectId);
    if (!isTaught) throw new Error("Should be taught");
    log.info("✓ Subject is taught in grade");

    // Check if core
    log.step("Checking if subject is core");
    const isCore = await gradeSubjectRepository.isCoreInGrade(gradeId, subjectId);
    if (!isCore) throw new Error("Should be core");
    log.info("✓ Subject is core");

    // Update
    log.step("Updating to optional subject");
    await gradeSubjectRepository.update(createdId, { isCore: false });
    const updated = await gradeSubjectRepository.findById(createdId);
    if (updated?.isCore) throw new Error("Should be optional now");
    log.info("✓ Updated to optional");

    // Count
    const count = await gradeSubjectRepository.count();
    log.info(`Total count: ${count}`);

    // Delete
    log.step("Deleting association");
    await gradeSubjectRepository.delete(createdId);
    const deleted = await gradeSubjectRepository.findById(createdId);
    if (deleted) throw new Error("Should be deleted");
    log.info("✓ Deleted successfully");

    log.success("✓ All operations validated successfully");

  } catch (error) {
    log.error("Validation failed");
    if (error instanceof Error) {
      log.error(error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

validateGradeSubjectRepository();
