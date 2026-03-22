import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/logger/logger";
import { NotFoundError, BadRequestError } from "@/lib/http/errors";
import {
  getGradeDistributionStructure,
  getPassingGrades,
  getDistinctionGrades,
  mapPrismaGradeLevelToECZLevel,
  type GradeLevel,
} from "@/lib/grading/ecz-grading-system";

/**
 * Teacher Gradebook Service
 *
 * Business logic for teachers viewing grade analytics and assessment data.
 * Handles grade distributions, pass rates, and quality metrics.
 */
export class TeacherGradebookService {
  /**
   * Get assessment analysis for a class and subject
   *
   * @param subjectId - The subject ID
   * @param classId - The class ID
   * @param assessmentType - Assessment type (CAT1, MID, EOT)
   * @param termId - Optional term ID (uses active term if not provided)
   * @returns Grade distribution and analysis data
   */
  async getAssessmentAnalysis(
    subjectId: string,
    classId: string,
    assessmentType: string,
    termId?: string
  ): Promise<{
    gradeLevel: GradeLevel;
    totalStudents: { male: number; female: number; total: number };
    recordedEntries: { male: number; female: number; total: number };
    absentStudents: { male: number; female: number; total: number };
    gradeDistribution: Array<{
      gradeEnum: string;
      gradeLabel: string;
      minMark: number;
      maxMark: number;
      male: number;
      female: number;
      total: number;
      percentage: number;
    }>;
    quantityPass: { passed: number; total: number; rate: number };
    qualityPass: { qualityPasses: number; totalPassed: number; rate: number };
  }> {
    logger.info("Fetching assessment analysis", {
      subjectId,
      classId,
      assessmentType,
      termId,
    });

    if (!subjectId || !classId) {
      throw new BadRequestError("Subject ID and Class ID are required");
    }

    // Get active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      throw new NotFoundError("No active academic year found");
    }

    // Use provided termId or get active term
    let term;
    if (termId) {
      term = await prisma.term.findUnique({
        where: { id: termId },
      });
      if (!term) {
        throw new NotFoundError("Term not found");
      }
    } else {
      term = await prisma.term.findFirst({
        where: {
          academicYearId: academicYear.id,
          isActive: true,
        },
      });
      if (!term) {
        throw new NotFoundError("No active term found");
      }
    }

    // Map assessment type (CAT1 → CAT, MID → MID, EOT → EOT)
    let examType = "CAT";
    if (assessmentType === "CAT1") examType = "CAT";
    else if (assessmentType === "MID") examType = "MID";
    else if (assessmentType === "EOT") examType = "EOT";

    // Get class information with grade to determine grade level
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        grade: {
          select: {
            level: true,
            name: true,
          },
        },
      },
    });

    if (!classInfo) {
      throw new NotFoundError("Class not found");
    }

    // Map Prisma's GradeLevel enum to ECZ grading system's GradeLevel type
    const gradeLevel: GradeLevel = mapPrismaGradeLevelToECZLevel(
      classInfo.grade.level
    );

    logger.debug("Grade level determined", {
      classId,
      gradeName: classInfo.grade.name,
      gradeLevel,
    });

    // Get assessment (include both PUBLISHED and COMPLETED statuses)
    const assessment = await prisma.assessment.findFirst({
      where: {
        subjectId,
        classId,
        termId: term.id,
        examType: examType as any,
        status: {
          in: ["PUBLISHED", "COMPLETED"],
        },
      },
    });

    // Get all enrolled students for this class
    const enrollments = await prisma.studentClassEnrollment.findMany({
      where: {
        classId,
        academicYearId: academicYear.id,
      },
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
          },
        },
      },
    });

    const students = enrollments.map((e) => e.student);

    // Count total students by gender
    const totalMale = students.filter((s) => s.gender === "MALE").length;
    const totalFemale = students.filter((s) => s.gender === "FEMALE").length;
    const totalStudents = students.length;

    // Get assessment results if assessment exists
    let results: any[] = [];
    let recordedMale = 0;
    let recordedFemale = 0;
    let absentMale = 0;
    let absentFemale = 0;

    if (assessment) {
      results = await prisma.studentAssessmentResult.findMany({
        where: {
          assessmentId: assessment.id,
          studentId: {
            in: students.map((s) => s.id),
          },
        },
        include: {
          student: {
            select: {
              gender: true,
            },
          },
        },
      });

      // Count recorded entries
      results.forEach((result) => {
        if (result.marksObtained !== null) {
          if (result.student.gender === "MALE") recordedMale++;
          else recordedFemale++;
        }
      });
    }

    logger.debug("Assessment results fetched", {
      assessmentId: assessment?.id,
      totalResults: results.length,
      recordedMale,
      recordedFemale,
    });

    // Get grade distribution structure from central grading system
    const gradeDistribution = getGradeDistributionStructure(gradeLevel);

    // Categorize results by grade
    results.forEach((result) => {
      if (result.grade && result.marksObtained !== null) {
        const gradeEntry = gradeDistribution.find(
          (g) => g.gradeEnum === result.grade
        );
        if (gradeEntry) {
          gradeEntry.total++;
          if (result.student.gender === "MALE") {
            gradeEntry.male++;
          } else {
            gradeEntry.female++;
          }
        }
      }
    });

    // Calculate percentages
    const totalRecorded = recordedMale + recordedFemale;
    gradeDistribution.forEach((grade) => {
      if (totalRecorded > 0) {
        grade.percentage = parseFloat(
          ((grade.total / totalRecorded) * 100).toFixed(1)
        );
      }
    });

    // Calculate pass rates (passing = 40% and above)
    const passedResults = results.filter(
      (r) => r.marksObtained !== null && r.marksObtained >= 40
    );
    const passed = passedResults.length;
    const quantityPassRate =
      totalRecorded > 0 ? (passed / totalRecorded) * 100 : 0;

    // Quality pass (Distinction grades based on grade level)
    const distinctionGrades = getDistinctionGrades(gradeLevel);
    const qualityPasses = results.filter(
      (r) =>
        r.marksObtained !== null &&
        r.grade &&
        distinctionGrades.includes(r.grade)
    ).length;
    const qualityPassRate = passed > 0 ? (qualityPasses / passed) * 100 : 0;

    logger.info("Assessment analysis computed successfully", {
      subjectId,
      classId,
      assessmentType,
      totalStudents,
      recordedEntries: totalRecorded,
      passRate: quantityPassRate.toFixed(1),
      qualityPassRate: qualityPassRate.toFixed(1),
    });

    return {
      gradeLevel,
      totalStudents: {
        male: totalMale,
        female: totalFemale,
        total: totalStudents,
      },
      recordedEntries: {
        male: recordedMale,
        female: recordedFemale,
        total: totalRecorded,
      },
      absentStudents: {
        male: absentMale,
        female: absentFemale,
        total: absentMale + absentFemale,
      },
      gradeDistribution,
      quantityPass: {
        passed,
        total: totalRecorded,
        rate: parseFloat(quantityPassRate.toFixed(1)),
      },
      qualityPass: {
        qualityPasses,
        totalPassed: passed,
        rate: parseFloat(qualityPassRate.toFixed(1)),
      },
    };
  }
}

// Export singleton instance
export const teacherGradebookService = new TeacherGradebookService();
