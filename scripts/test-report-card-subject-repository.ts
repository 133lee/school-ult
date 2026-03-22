/**
 * ReportCardSubject Repository Validation Script
 */

import { reportCardSubjectRepository } from "@/features/report-cards/reportCardSubject.repository";
import { reportCardRepository } from "@/features/report-cards/reportCard.repository";
import { subjectRepository } from "@/features/subjects/subject.repository";
import { studentRepository } from "@/features/students/student.repository";
import { classRepository } from "@/features/classes/class.repository";
import { termRepository } from "@/features/terms/term.repository";
import { academicYearRepository } from "@/features/academic-years/academicYear.repository";
import { teacherRepository } from "@/features/teachers/teacher.repository";
import prisma from "@/lib/db/prisma";

const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateReportCardSubjectRepository() {
  let createdId: string | null = null;
  let reportCardId: string | null = null;
  let subjectId: string | null = null;

  try {
    log.step("Starting ReportCardSubject Repository Validation");

    // Setup: Create a report card first
    const students = await studentRepository.findMany({ take: 1 });
    const classes = await classRepository.findMany({ take: 1 });
    const teachers = await teacherRepository.findMany({ take: 1 });
    const subjects = await subjectRepository.findMany({ take: 1 });

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
    }

    const reportCard = await reportCardRepository.create({
      student: { connect: { id: students[0].id } },
      class: { connect: { id: classes[0].id } },
      term: { connect: { id: term.id } },
      academicYear: { connect: { id: academicYear.id } },
      classTeacher: { connect: { id: teachers[0].id } },
      attendance: 45,
      daysPresent: 43,
      daysAbsent: 2,
    });

    reportCardId = reportCard.id;
    subjectId = subjects[0].id;
    log.info(`Created report card for testing`);

    // Create
    log.step("Creating report card subject entry");
    const newEntry = await reportCardSubjectRepository.create({
      reportCard: { connect: { id: reportCardId } },
      subject: { connect: { id: subjectId } },
      catMark: 25,
      midMark: 28,
      eotMark: 75,
      totalMark: 128,
    });
    createdId = newEntry.id;
    log.info(`Created: ${createdId}`);

    // Find by report card
    log.step("Finding subjects by report card");
    const byReportCard = await reportCardSubjectRepository.findByReportCard(
      reportCardId
    );
    log.info(`Subjects in report card: ${byReportCard.length}`);

    // Find by unique
    const unique = await reportCardSubjectRepository.findByReportCardAndSubject(
      reportCardId,
      subjectId
    );
    if (!unique) throw new Error("Should find by unique");
    log.info("✓ Found by unique constraint");

    // Update
    log.step("Updating marks");
    await reportCardSubjectRepository.update(createdId, {
      eotMark: 80,
      totalMark: 133,
    });
    log.info("✓ Updated");

    // Delete
    log.step("Deleting entry");
    await reportCardSubjectRepository.delete(createdId);
    log.info("✓ Deleted");

    // Cleanup
    await reportCardRepository.delete(reportCardId);

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

validateReportCardSubjectRepository();
