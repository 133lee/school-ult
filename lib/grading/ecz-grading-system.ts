/**
 * ECZ (Examinations Council of Zambia) Grading System
 *
 * This is the single source of truth for all grading calculations
 * across the school management system.
 */

import { GradeLevel as PrismaGradeLevel } from "@/generated/prisma/client";
import { ECZGrade } from "@/types/prisma-enums";

export type GradeLevel = "PRIMARY" | "JUNIOR" | "SENIOR";

export interface GradeInfo {
  symbol: string;
  grade: ECZGrade;
  descriptor: string;
  minPercentage: number;
  maxPercentage: number;
  displayName: string;
}

/**
 * Grade 8-9 (Junior Secondary) Grading System
 * Letter-based grading system
 */
export const JUNIOR_GRADING: GradeInfo[] = [
  {
    symbol: "1",
    grade: "GRADE_1",
    descriptor: "Distinction",
    minPercentage: 75,
    maxPercentage: 100,
    displayName: "Distinction 1",
  },
  {
    symbol: "2",
    grade: "GRADE_2",
    descriptor: "Merit",
    minPercentage: 60,
    maxPercentage: 74,
    displayName: "Merit 2",
  },
  {
    symbol: "3",
    grade: "GRADE_3",
    descriptor: "Credit",
    minPercentage: 50,
    maxPercentage: 59,
    displayName: "Credit 3",
  },
  {
    symbol: "4",
    grade: "GRADE_4",
    descriptor: "Pass",
    minPercentage: 40,
    maxPercentage: 49,
    displayName: "Pass 4",
  },
  {
    symbol: "F",
    grade: "GRADE_9",
    descriptor: "Fail",
    minPercentage: 0,
    maxPercentage: 39,
    displayName: "Fail",
  },
];

/**
 * Grade 10-12 / Form 1-4 (Senior Secondary) Grading System
 * Symbol-based grading (1-9)
 * Also used for school leaving certificates and GCE O-Level equivalents
 */
export const SENIOR_GRADING: GradeInfo[] = [
  {
    symbol: "1",
    grade: "GRADE_1",
    descriptor: "Distinction",
    minPercentage: 75,
    maxPercentage: 100,
    displayName: "Distinction 1",
  },
  {
    symbol: "2",
    grade: "GRADE_2",
    descriptor: "Distinction",
    minPercentage: 70,
    maxPercentage: 74,
    displayName: "Distinction 2",
  },
  {
    symbol: "3",
    grade: "GRADE_3",
    descriptor: "Merit",
    minPercentage: 65,
    maxPercentage: 69,
    displayName: "Merit 3",
  },
  {
    symbol: "4",
    grade: "GRADE_4",
    descriptor: "Merit",
    minPercentage: 60,
    maxPercentage: 64,
    displayName: "Merit 4",
  },
  {
    symbol: "5",
    grade: "GRADE_5",
    descriptor: "Credit",
    minPercentage: 55,
    maxPercentage: 59,
    displayName: "Credit 5",
  },
  {
    symbol: "6",
    grade: "GRADE_6",
    descriptor: "Credit",
    minPercentage: 50,
    maxPercentage: 54,
    displayName: "Credit 6",
  },
  {
    symbol: "7",
    grade: "GRADE_7",
    descriptor: "Satisfactory",
    minPercentage: 45,
    maxPercentage: 49,
    displayName: "Satisfactory 7",
  },
  {
    symbol: "8",
    grade: "GRADE_8",
    descriptor: "Satisfactory",
    minPercentage: 40,
    maxPercentage: 44,
    displayName: "Satisfactory 8",
  },
  {
    symbol: "9",
    grade: "GRADE_9",
    descriptor: "Unsatisfactory",
    minPercentage: 0,
    maxPercentage: 39,
    displayName: "Unsatisfactory 9",
  },
];

/**
 * Primary (Grade 5-7) Grading System
 * TODO: Define primary grading system when requirements are available
 */
export const PRIMARY_GRADING: GradeInfo[] = [
  // Placeholder - to be defined later
];

/**
 * Get the appropriate grading scale based on grade level
 */
export function getGradingScale(gradeLevel: GradeLevel): GradeInfo[] {
  switch (gradeLevel) {
    case "JUNIOR":
      return JUNIOR_GRADING;
    case "SENIOR":
      return SENIOR_GRADING;
    case "PRIMARY":
      return PRIMARY_GRADING;
    default:
      return SENIOR_GRADING; // Default to senior
  }
}

/**
 * Calculate ECZ grade based on percentage and grade level
 */
export function calculateECZGrade(
  percentage: number,
  gradeLevel: GradeLevel = "SENIOR"
): ECZGrade {
  const gradingScale = getGradingScale(gradeLevel);

  for (const gradeInfo of gradingScale) {
    if (percentage >= gradeInfo.minPercentage && percentage <= gradeInfo.maxPercentage) {
      return gradeInfo.grade;
    }
  }

  // Fallback to lowest grade if no match found
  return "GRADE_9";
}

/**
 * Get grade information by ECZGrade enum value
 */
export function getGradeInfo(
  grade: ECZGrade,
  gradeLevel: GradeLevel = "SENIOR"
): GradeInfo | undefined {
  const gradingScale = getGradingScale(gradeLevel);
  return gradingScale.find((g) => g.grade === grade);
}

/**
 * Get all passing grades for a grade level
 */
export function getPassingGrades(gradeLevel: GradeLevel): ECZGrade[] {
  const gradingScale = getGradingScale(gradeLevel);
  // Passing grades are those with minPercentage >= 40
  return gradingScale
    .filter((g) => g.minPercentage >= 40)
    .map((g) => g.grade);
}

/**
 * Get distinction grades for a grade level
 */
export function getDistinctionGrades(gradeLevel: GradeLevel): ECZGrade[] {
  const gradingScale = getGradingScale(gradeLevel);
  // Distinction grades are those with descriptor "Distinction"
  return gradingScale
    .filter((g) => g.descriptor === "Distinction")
    .map((g) => g.grade);
}

/**
 * Check if a grade is passing
 */
export function isPassingGrade(grade: ECZGrade, gradeLevel: GradeLevel = "SENIOR"): boolean {
  const passingGrades = getPassingGrades(gradeLevel);
  return passingGrades.includes(grade);
}

/**
 * Check if a grade is distinction
 */
export function isDistinctionGrade(grade: ECZGrade, gradeLevel: GradeLevel = "SENIOR"): boolean {
  const distinctionGrades = getDistinctionGrades(gradeLevel);
  return distinctionGrades.includes(grade);
}

/**
 * Get grade distribution structure for analysis
 * Returns an array ready to be populated with student counts
 */
export function getGradeDistributionStructure(gradeLevel: GradeLevel = "SENIOR") {
  const gradingScale = getGradingScale(gradeLevel);

  return gradingScale.map((gradeInfo) => ({
    grade: gradeInfo.displayName,
    range: `${gradeInfo.minPercentage}-${gradeInfo.maxPercentage}%`,
    male: 0,
    female: 0,
    total: 0,
    percentage: 0,
    gradeEnum: gradeInfo.grade,
  }));
}

/**
 * Format grade for display
 */
export function formatGrade(grade: ECZGrade, gradeLevel: GradeLevel = "SENIOR"): string {
  const gradeInfo = getGradeInfo(grade, gradeLevel);
  return gradeInfo ? gradeInfo.displayName : grade;
}

/**
 * Map Prisma's GradeLevel enum to ECZ grading system's GradeLevel type
 * This is the production-ready, type-safe way to determine which grading scale to use
 *
 * Prisma GradeLevel (GRADE_1 to GRADE_12) -> ECZ GradeLevel (PRIMARY/JUNIOR/SENIOR)
 */
export function mapPrismaGradeLevelToECZLevel(prismaLevel: PrismaGradeLevel): GradeLevel {
  switch (prismaLevel) {
    // Primary: Grades 5-7
    case "GRADE_5":
    case "GRADE_6":
    case "GRADE_7":
      return "PRIMARY";

    // Junior: Grades 8-9
    case "GRADE_8":
    case "GRADE_9":
      return "JUNIOR";

    // Senior: Grades 10-12 (also covers Form 1-4 equivalent)
    case "GRADE_10":
    case "GRADE_11":
    case "GRADE_12":
      return "SENIOR";

    // Grades 1-4 (if they exist in system, treat as PRIMARY for now)
    case "GRADE_1":
    case "GRADE_2":
    case "GRADE_3":
    case "GRADE_4":
      return "PRIMARY";

    // Default to SENIOR for safety
    default:
      return "SENIOR";
  }
}

/**
 * Determine grade level from class name or grade number
 * Examples: "Grade 8 A" -> JUNIOR, "Grade 10 B" -> SENIOR, "Form 2" -> SENIOR
 *
 * NOTE: Prefer using mapPrismaGradeLevelToECZLevel() when you have access to the Prisma Grade model
 */
export function determineGradeLevel(className: string): GradeLevel {
  // Extract grade number from class name
  const gradeMatch = className.match(/(?:Grade|Form)\s*(\d+)/i);

  if (!gradeMatch) {
    // Default to SENIOR if we can't determine
    return "SENIOR";
  }

  const gradeNumber = parseInt(gradeMatch[1], 10);

  // Determine based on grade number
  if (gradeNumber >= 5 && gradeNumber <= 7) {
    return "PRIMARY";
  } else if (gradeNumber >= 8 && gradeNumber <= 9) {
    return "JUNIOR";
  } else if (gradeNumber >= 10 && gradeNumber <= 12) {
    return "SENIOR";
  } else if (gradeNumber >= 1 && gradeNumber <= 4) {
    // Form 1-4 is SENIOR
    return "SENIOR";
  }

  // Default to SENIOR
  return "SENIOR";
}
