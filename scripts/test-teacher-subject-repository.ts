/**
 * TeacherSubject Repository Validation Script
 */

import { teacherSubjectRepository } from "@/features/teacher-subjects/teacherSubject.repository";
import { teacherRepository } from "@/features/teachers/teacher.repository";
import { subjectRepository } from "@/features/subjects/subject.repository";
import prisma from "@/lib/db/prisma";

const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateTeacherSubjectRepository() {
  let createdId: string | null = null;
  let teacherId: string | null = null;
  let subjectId: string | null = null;

  try {
    log.step("Starting TeacherSubject Repository Validation");

    // Get teacher and subject
    const teachers = await teacherRepository.findMany({ take: 1 });
    const subjects = await subjectRepository.findMany({ take: 1 });

    if (teachers.length === 0 || subjects.length === 0) {
      throw new Error("Need teachers and subjects in database");
    }

    teacherId = teachers[0].id;
    subjectId = subjects[0].id;
    log.info(`Using teacher: ${teachers[0].firstName} ${teachers[0].lastName}`);
    log.info(`Using subject: ${subjects[0].name}`);

    // Create
    log.step("Creating teacher-subject association");
    const newAssoc = await teacherSubjectRepository.create({
      teacher: { connect: { id: teacherId } },
      subject: { connect: { id: subjectId } },
    });
    createdId = newAssoc.id;
    log.info(`Created: ${createdId}`);

    // Find All
    log.step("Finding all associations");
    const all = await teacherSubjectRepository.findAll();
    log.info(`Total: ${all.length}`);

    // Find by Teacher
    log.step("Finding by teacher");
    const byTeacher = await teacherSubjectRepository.findByTeacher(teacherId);
    log.info(`By teacher: ${byTeacher.length}`);

    // Find by Subject
    log.step("Finding by subject");
    const bySubject = await teacherSubjectRepository.findBySubject(subjectId);
    log.info(`By subject: ${bySubject.length}`);

    // Find by unique constraint
    log.step("Finding by teacher and subject");
    const unique = await teacherSubjectRepository.findByTeacherAndSubject(teacherId, subjectId);
    if (!unique) throw new Error("Should find by unique constraint");
    log.info("✓ Found by unique constraint");

    // Check qualification
    log.step("Checking if teacher is qualified");
    const isQualified = await teacherSubjectRepository.isQualified(teacherId, subjectId);
    if (!isQualified) throw new Error("Should be qualified");
    log.info("✓ Teacher is qualified");

    // Count
    const count = await teacherSubjectRepository.count();
    log.info(`Total count: ${count}`);

    // Delete
    log.step("Deleting association");
    await teacherSubjectRepository.delete(createdId);
    const deleted = await teacherSubjectRepository.findById(createdId);
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

validateTeacherSubjectRepository();
