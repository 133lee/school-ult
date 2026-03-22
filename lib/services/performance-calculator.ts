import prisma from "@/lib/db/prisma";
import { ExamType, GradeLevel } from "@/types/prisma-enums";

interface StudentScore {
  subject: string;
  score: number;
  totalMarks: number;
  grade: string | null;
}

/**
 * Curriculum type determines which grading system to use
 */
export type CurriculumType = 'OLD_SYSTEM' | 'NEW_SYSTEM';

/**
 * Result for Best Six calculation
 */
export interface BestSixResult {
  value: number; // Either total percentage (old) or total points (new)
  count: number; // Number of subjects included
  type: 'percentage' | 'points'; // Which system was used
  maxValue: number; // 600 for old system, varies for new system
}

interface ClassRanking {
  subject: string;
  score: number;
  rank: number;
  total: number;
  trend: "up" | "down" | "same";
  isTeacherSubject: boolean;
}

/**
 * Determine curriculum type based on grade level
 *
 * OLD SYSTEM (Grades 1-9): Uses 5-point grade scale (1-4 + Fail)
 * NEW SYSTEM (Forms 1-5, Grades 10-12): Uses 9-point scale (1-9)
 */
export function getCurriculumType(gradeLevel: string): CurriculumType {
  // Old system: GRADE_1 through GRADE_9
  const oldSystemGrades = [
    'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5',
    'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9'
  ];

  // New system: FORM_1 through FORM_5, and GRADE_10 through GRADE_12
  const newSystemGrades = [
    'FORM_1', 'FORM_2', 'FORM_3', 'FORM_4', 'FORM_5',
    'GRADE_10', 'GRADE_11', 'GRADE_12'
  ];

  if (oldSystemGrades.includes(gradeLevel)) {
    return 'OLD_SYSTEM';
  }

  if (newSystemGrades.includes(gradeLevel)) {
    return 'NEW_SYSTEM';
  }

  // Default to new system for unknown grades
  return 'NEW_SYSTEM';
}

/**
 * Calculate percentage score
 */
export function calculatePercentage(
  marksObtained: number,
  totalMarks: number
): number {
  if (totalMarks === 0) return 0;
  return Math.round((marksObtained / totalMarks) * 100);
}

/**
 * Convert percentage to OLD SYSTEM grade (5-point scale)
 * Used for Grades 1-9 (Junior Secondary)
 *
 * Grade 1 (75-100%): Distinction
 * Grade 2 (60-74%): Merit
 * Grade 3 (50-59%): Credit
 * Grade 4 (40-49%): Pass
 * Fail (0-39%): No grade awarded
 */
export function percentageToOldSystemGrade(percentage: number): number {
  if (percentage >= 75) return 1;
  if (percentage >= 60) return 2;
  if (percentage >= 50) return 3;
  if (percentage >= 40) return 4;
  return 0; // Fail (no grade)
}

/**
 * Convert percentage to NEW SYSTEM ECZ 9-point grade
 * Used for Forms 1-5 and Grades 10-12
 *
 * Grade 1 (75-100%) = 1 point (best)
 * Grade 9 (0-39%) = 9 points (worst)
 *
 * Note: Lower points = better performance
 */
export function percentageToECZPoints(percentage: number): number {
  if (percentage >= 75) return 1;
  if (percentage >= 70) return 2;
  if (percentage >= 65) return 3;
  if (percentage >= 60) return 4;
  if (percentage >= 55) return 5;
  if (percentage >= 50) return 6;
  if (percentage >= 45) return 7;
  if (percentage >= 40) return 8;
  return 9;
}

interface SubjectWithCore {
  subject: string;
  subjectId: string;
  score: number;
  totalMarks: number;
  isCore: boolean;
  percentage: number;
  points: number;
}

/**
 * Calculate Best Six (Universal - supports both OLD and NEW systems)
 *
 * OLD SYSTEM (Grades 1-9):
 * - Sums the top 6 PERCENTAGES (out of 600)
 * - Higher total = better performance
 * - Example: 70% + 84% + 90% + 70% + 55% + 65% = 434/600
 *
 * NEW SYSTEM (Forms/Grades 10-12):
 * - All core subjects MUST be included
 * - Fill remaining slots with best electives (lowest points)
 * - Sum the POINTS (lower total = better performance)
 * - Example: 2 + 1 + 1 + 2 + 5 + 3 = 14 points
 *
 * @param scores - Array of student scores with isCore flag
 * @param curriculumType - Which grading system to use
 * @returns BestSixResult object or null if no subjects
 */
export function calculateBestSixPoints(
  scores: SubjectWithCore[],
  curriculumType: CurriculumType = 'NEW_SYSTEM'
): BestSixResult | null {
  if (scores.length === 0) return null;

  if (curriculumType === 'OLD_SYSTEM') {
    // OLD SYSTEM: Sum top 6 percentages (ignore core/elective distinction)
    const sortedByPercentage = [...scores].sort((a, b) => b.percentage - a.percentage);
    const topSix = sortedByPercentage.slice(0, 6);

    if (topSix.length === 0) return null;

    const totalPercentage = topSix.reduce((sum, s) => sum + s.percentage, 0);

    return {
      value: totalPercentage,
      count: topSix.length,
      type: 'percentage',
      maxValue: 600, // 6 subjects × 100%
    };
  } else {
    // NEW SYSTEM: Core subjects + best electives (point-based)
    const cores = scores.filter(s => s.isCore);
    const electives = scores.filter(s => !s.isCore);

    // Sort electives by points (ascending - lowest/best first)
    const sortedElectives = [...electives].sort((a, b) => a.points - b.points);

    // Fill to 6 subjects total
    const slotsForElectives = Math.max(0, 6 - cores.length);
    const bestElectives = sortedElectives.slice(0, slotsForElectives);

    // Combine cores + best electives
    const bestSix = [...cores, ...bestElectives];

    if (bestSix.length === 0) return null;

    // Sum the points (lower is better)
    const totalPoints = bestSix.reduce((sum, s) => sum + s.points, 0);

    return {
      value: totalPoints,
      count: bestSix.length,
      type: 'points',
      maxValue: bestSix.length * 9, // Worst possible = all grade 9s
    };
  }
}

/**
 * Calculate best six subjects average (legacy - percentage based)
 * @deprecated Use calculateBestSixPoints for ECZ 9-point scale
 */
export function calculateBestSix(scores: StudentScore[]): number {
  if (scores.length === 0) return 0;

  // Sort by percentage score (descending) and take top 6
  const sortedScores = [...scores]
    .map((s) => calculatePercentage(s.score, s.totalMarks))
    .sort((a, b) => b - a)
    .slice(0, 6);

  if (sortedScores.length === 0) return 0;

  const sum = sortedScores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / sortedScores.length);
}

/**
 * Calculate trend by comparing current and previous scores
 */
export function calculateTrend(
  currentScore: number,
  previousScore: number | null
): "up" | "down" | "same" {
  if (previousScore === null) return "same";

  const difference = currentScore - previousScore;

  if (difference > 2) return "up";
  if (difference < -2) return "down";
  return "same";
}

/**
 * Get student's subject scores for a specific assessment type and term
 */
export async function getStudentSubjectScores(
  studentId: string,
  examType: ExamType,
  termId: string
): Promise<StudentScore[]> {
  const results = await prisma.studentAssessmentResult.findMany({
    where: {
      studentId,
      assessment: {
        examType,
        termId,
      },
    },
    include: {
      assessment: {
        select: {
          totalMarks: true,
          subject: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return results.map((result) => ({
    subject: result.assessment.subject.name,
    score: result.marksObtained,
    totalMarks: result.assessment.totalMarks,
    grade: result.grade || null,
  }));
}

/**
 * Get student's subject scores with core/elective status
 * Required for ECZ Best Six calculation
 */
export async function getStudentSubjectScoresWithCore(
  studentId: string,
  examType: ExamType,
  termId: string
): Promise<SubjectWithCore[]> {
  // Get student's current class to determine grade
  const enrollment = await prisma.studentClassEnrollment.findFirst({
    where: {
      studentId,
      status: "ACTIVE",
    },
    select: {
      class: {
        select: {
          gradeId: true,
        },
      },
    },
  });

  if (!enrollment) return [];

  const results = await prisma.studentAssessmentResult.findMany({
    where: {
      studentId,
      assessment: {
        examType,
        termId,
      },
    },
    include: {
      assessment: {
        select: {
          totalMarks: true,
          subjectId: true,
          subject: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  // Fetch GradeSubject data to get isCore status
  const gradeSubjects = await prisma.gradeSubject.findMany({
    where: {
      gradeId: enrollment.class.gradeId,
      subjectId: {
        in: results.map((r) => r.assessment.subjectId),
      },
    },
    select: {
      subjectId: true,
      isCore: true,
    },
  });

  const coreMap = new Map(
    gradeSubjects.map((gs) => [gs.subjectId, gs.isCore])
  );

  return results.map((result) => {
    const percentage = calculatePercentage(
      result.marksObtained,
      result.assessment.totalMarks
    );
    const points = percentageToECZPoints(percentage);

    return {
      subject: result.assessment.subject.name,
      subjectId: result.assessment.subjectId,
      score: result.marksObtained,
      totalMarks: result.assessment.totalMarks,
      isCore: coreMap.get(result.assessment.subjectId) ?? false,
      percentage,
      points,
    };
  });
}

/**
 * Calculate student's ranking in a subject within their class
 */
export async function calculateSubjectRanking(
  studentId: string,
  subjectId: string,
  assessmentId: string
): Promise<{ rank: number; total: number }> {
  // Get the student's class enrollment
  const enrollment = await prisma.studentClassEnrollment.findFirst({
    where: {
      studentId,
      status: "ACTIVE",
    },
    select: {
      classId: true,
    },
  });

  if (!enrollment) {
    return { rank: 0, total: 0 };
  }

  // Get all students in the same class
  const classStudents = await prisma.studentClassEnrollment.findMany({
    where: {
      classId: enrollment.classId,
      status: "ACTIVE",
    },
    select: {
      studentId: true,
    },
  });

  const studentIds = classStudents.map((s) => s.studentId);

  // Get all results for this assessment
  const results = await prisma.studentAssessmentResult.findMany({
    where: {
      assessmentId,
      studentId: {
        in: studentIds,
      },
    },
    select: {
      studentId: true,
      marksObtained: true,
    },
    orderBy: {
      marksObtained: "desc",
    },
  });

  const total = results.length;
  const rank = results.findIndex((r) => r.studentId === studentId) + 1;

  return { rank: rank || 0, total };
}

/**
 * Get student's class rankings across all subjects
 */
export async function getStudentClassRankings(
  studentId: string,
  examType: ExamType,
  termId: string,
  teacherSubjects: string[]
): Promise<ClassRanking[]> {
  // Get student's current class
  const enrollment = await prisma.studentClassEnrollment.findFirst({
    where: {
      studentId,
      status: "ACTIVE",
    },
    select: {
      classId: true,
    },
  });

  if (!enrollment) return [];

  // Get all assessments for this exam type and term in student's class
  const assessments = await prisma.assessment.findMany({
    where: {
      classId: enrollment.classId,
      examType,
      termId,
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      results: {
        where: {
          studentId,
        },
        select: {
          marksObtained: true,
        },
      },
    },
  });

  // Get previous exam type for trend calculation
  const previousExamType = getPreviousExamType(examType);
  const previousResults = previousExamType
    ? await prisma.studentAssessmentResult.findMany({
        where: {
          studentId,
          assessment: {
            classId: enrollment.classId,
            examType: previousExamType,
            termId,
          },
        },
        select: {
          subjectId: true,
          marksObtained: true,
          assessment: {
            select: {
              totalMarks: true,
            },
          },
        },
      })
    : [];

  const previousScoresMap = new Map(
    previousResults.map((r) => [
      r.subjectId,
      calculatePercentage(r.marksObtained, r.assessment.totalMarks),
    ])
  );

  // Calculate rankings for each subject
  const rankings: ClassRanking[] = [];

  for (const assessment of assessments) {
    if (assessment.results.length === 0) continue;

    const result = assessment.results[0];
    const currentPercentage = calculatePercentage(
      result.marksObtained,
      assessment.totalMarks
    );

    const rankingInfo = await calculateSubjectRanking(
      studentId,
      assessment.subjectId,
      assessment.id
    );

    const previousScore = previousScoresMap.get(assessment.subjectId) || null;
    const trend = calculateTrend(currentPercentage, previousScore);

    rankings.push({
      subject: assessment.subject.name,
      score: currentPercentage,
      rank: rankingInfo.rank,
      total: rankingInfo.total,
      trend,
      isTeacherSubject: teacherSubjects.includes(assessment.subject.name),
    });
  }

  // Sort by rank (ascending)
  return rankings.sort((a, b) => a.rank - b.rank);
}

/**
 * Get previous exam type for trend calculation
 */
function getPreviousExamType(examType: ExamType): ExamType | null {
  switch (examType) {
    case "MID":
      return "CAT";
    case "EOT":
      return "MID";
    default:
      return null;
  }
}

/**
 * Calculate overall class position for a student
 */
export async function calculateClassPosition(
  studentId: string,
  examType: ExamType,
  termId: string
): Promise<{ position: number; total: number }> {
  // Get student's current class
  const enrollment = await prisma.studentClassEnrollment.findFirst({
    where: {
      studentId,
      status: "ACTIVE",
    },
    select: {
      classId: true,
    },
  });

  if (!enrollment) {
    return { position: 0, total: 0 };
  }

  // Get all students in the class
  const classStudents = await prisma.studentClassEnrollment.findMany({
    where: {
      classId: enrollment.classId,
      status: "ACTIVE",
    },
    select: {
      studentId: true,
    },
  });

  const studentIds = classStudents.map((s) => s.studentId);

  // Calculate average score for each student
  const studentAverages: { studentId: string; average: number }[] = [];

  for (const student of classStudents) {
    const scores = await getStudentSubjectScores(
      student.studentId,
      examType,
      termId
    );

    if (scores.length > 0) {
      const percentages = scores.map((s) =>
        calculatePercentage(s.score, s.totalMarks)
      );
      const average =
        percentages.reduce((sum, p) => sum + p, 0) / percentages.length;

      studentAverages.push({
        studentId: student.studentId,
        average,
      });
    }
  }

  // Sort by average (descending)
  studentAverages.sort((a, b) => b.average - a.average);

  const position =
    studentAverages.findIndex((s) => s.studentId === studentId) + 1;

  return {
    position: position || 0,
    total: studentAverages.length,
  };
}

/**
 * Calculate overall performance trend
 */
export async function calculateOverallTrend(
  studentId: string,
  examType: ExamType,
  termId: string
): Promise<"up" | "down" | "same"> {
  const currentScores = await getStudentSubjectScores(
    studentId,
    examType,
    termId
  );

  if (currentScores.length === 0) return "same";

  const currentAverage =
    currentScores.reduce(
      (sum, s) => sum + calculatePercentage(s.score, s.totalMarks),
      0
    ) / currentScores.length;

  const previousExamType = getPreviousExamType(examType);
  if (!previousExamType) return "same";

  const previousScores = await getStudentSubjectScores(
    studentId,
    previousExamType,
    termId
  );

  if (previousScores.length === 0) return "same";

  const previousAverage =
    previousScores.reduce(
      (sum, s) => sum + calculatePercentage(s.score, s.totalMarks),
      0
    ) / previousScores.length;

  return calculateTrend(currentAverage, previousAverage);
}
