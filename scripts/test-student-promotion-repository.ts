/**
 * StudentPromotion Repository Validation Script
 */

import { studentPromotionRepository } from "@/features/promotions/studentPromotion.repository";
import { studentRepository } from "@/features/students/student.repository";
import { teacherRepository } from "@/features/teachers/teacher.repository";
import prisma from "@/lib/db/prisma";

const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateStudentPromotionRepository() {
  let createdId: string | null = null;
  let studentId: string | null = null;
  let teacherId: string | null = null;

  try {
    log.step("Starting StudentPromotion Repository Validation");

    const students = await studentRepository.findMany({ take: 1 });
    const teachers = await teacherRepository.findMany({ take: 1 });

    if (students.length === 0 || teachers.length === 0) {
      throw new Error("Need students and teachers");
    }

    studentId = students[0].id;
    teacherId = teachers[0].id;
    log.info(`Using student: ${students[0].firstName}`);

    // Create
    log.step("Creating promotion record");
    const newPromotion = await studentPromotionRepository.create({
      student: { connect: { id: studentId } },
      fromGradeLevel: "GRADE_1",
      toGradeLevel: "GRADE_2",
      academicYear: 2025,
      status: "PROMOTED",
      approver: { connect: { id: teacherId } },
    });
    createdId = newPromotion.id;
    log.info(`Created: ${createdId}`);

    // Find by student
    log.step("Finding promotions by student");
    const byStudent = await studentPromotionRepository.findByStudent(studentId);
    log.info(`Promotions: ${byStudent.length}`);

    // Find by academic year
    log.step("Finding by academic year");
    const byYear = await studentPromotionRepository.findByAcademicYear(2025);
    log.info(`Promotions in 2025: ${byYear.length}`);

    // Find by status
    log.step("Finding by status");
    const byStatus = await studentPromotionRepository.findByStatus("PROMOTED");
    log.info(`Promoted students: ${byStatus.length}`);

    // Find by student and year
    const byStudentYear = await studentPromotionRepository.findByStudentAndYear(studentId, 2025);
    if (!byStudentYear) throw new Error("Should find");
    log.info("✓ Found by student and year");

    // Update
    log.step("Updating promotion");
    await studentPromotionRepository.update(createdId, { remarks: "Excellent progress" });
    log.info("✓ Updated");

    // Delete
    log.step("Deleting promotion");
    await studentPromotionRepository.delete(createdId);
    log.info("✓ Deleted");

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

validateStudentPromotionRepository();
