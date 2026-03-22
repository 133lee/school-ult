/**
 * ECZ Grading Service
 *
 * Edge Case #10: ECZ Grade Mapping
 * Handles year-specific grade mapping variations while maintaining backward compatibility
 * with the default static grading system.
 */

import prisma from "@/lib/db/prisma";
import { GradeLevel as PrismaGradeLevel, ECZGrade } from "@/generated/prisma/client";
import {
  GradeLevel,
  GradeInfo,
  calculateECZGrade as defaultCalculateECZGrade,
  getGradingScale,
  mapPrismaGradeLevelToECZLevel,
} from "./ecz-grading-system";

export interface YearSpecificGrading {
  academicYear: number;
  gradeLevel: PrismaGradeLevel;
  schemes: Array<{
    minMark: number;
    maxMark: number;
    grade: ECZGrade;
    description?: string;
  }>;
}

export class EczGradingService {
  /**
   * Edge Case #10: Calculate ECZ grade with year-specific overrides
   *
   * First checks for custom grading schemes for the academic year,
   * then falls back to default static grading system.
   */
  async calculateECZGrade(
    percentage: number,
    prismaGradeLevel: PrismaGradeLevel,
    academicYear: number
  ): Promise<ECZGrade> {
    // Check for year-specific grading scheme
    const customScheme = await this.getYearSpecificScheme(academicYear, prismaGradeLevel);

    if (customScheme && customScheme.length > 0) {
      // Use custom scheme
      for (const scheme of customScheme) {
        if (percentage >= scheme.minMark && percentage <= scheme.maxMark) {
          return scheme.grade;
        }
      }
    }

    // Fallback to default static grading system
    const eczLevel = mapPrismaGradeLevelToECZLevel(prismaGradeLevel);
    return defaultCalculateECZGrade(percentage, eczLevel);
  }

  /**
   * Get year-specific grading scheme from database
   */
  async getYearSpecificScheme(
    academicYear: number,
    gradeLevel: PrismaGradeLevel
  ): Promise<YearSpecificGrading["schemes"]> {
    const schemes = await prisma.eczGradingScheme.findMany({
      where: {
        academicYear,
        gradeLevel,
      },
      orderBy: {
        minMark: "desc", // Order from highest to lowest for proper matching
      },
    });

    return schemes.map((scheme) => ({
      minMark: scheme.minMark,
      maxMark: scheme.maxMark,
      grade: scheme.grade,
      description: scheme.description || undefined,
    }));
  }

  /**
   * Check if custom grading scheme exists for a year and grade level
   */
  async hasCustomScheme(
    academicYear: number,
    gradeLevel: PrismaGradeLevel
  ): Promise<boolean> {
    const count = await prisma.eczGradingScheme.count({
      where: {
        academicYear,
        gradeLevel,
      },
    });

    return count > 0;
  }

  /**
   * Create or update year-specific grading scheme
   * Used by administrators to override default grading for specific years
   */
  async upsertGradingScheme(
    academicYear: number,
    gradeLevel: PrismaGradeLevel,
    schemes: Array<{
      minMark: number;
      maxMark: number;
      grade: ECZGrade;
      description?: string;
    }>
  ): Promise<void> {
    // Delete existing schemes for this year and grade level
    await prisma.eczGradingScheme.deleteMany({
      where: {
        academicYear,
        gradeLevel,
      },
    });

    // Insert new schemes
    await prisma.eczGradingScheme.createMany({
      data: schemes.map((scheme) => ({
        academicYear,
        gradeLevel,
        minMark: scheme.minMark,
        maxMark: scheme.maxMark,
        grade: scheme.grade,
        description: scheme.description,
      })),
    });
  }

  /**
   * Validate grading scheme for completeness
   * Ensures no gaps in percentage coverage (0-100)
   */
  validateScheme(
    schemes: Array<{ minMark: number; maxMark: number; grade: ECZGrade }>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Sort by minMark
    const sorted = [...schemes].sort((a, b) => a.minMark - b.minMark);

    // Check if it starts at 0
    if (sorted.length === 0 || sorted[0].minMark !== 0) {
      errors.push("Grading scheme must start at 0%");
    }

    // Check if it ends at 100
    if (sorted.length === 0 || sorted[sorted.length - 1].maxMark !== 100) {
      errors.push("Grading scheme must end at 100%");
    }

    // Check for gaps and overlaps
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      if (current.maxMark + 1 !== next.minMark) {
        errors.push(
          `Gap or overlap detected between ${current.maxMark}% and ${next.minMark}%`
        );
      }

      if (current.minMark >= current.maxMark) {
        errors.push(
          `Invalid range: ${current.minMark}-${current.maxMark}%`
        );
      }
    }

    // Check for duplicate grades
    const gradeSet = new Set(sorted.map((s) => s.grade));
    if (gradeSet.size !== sorted.length) {
      errors.push("Duplicate grades detected in scheme");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get all custom schemes for an academic year
   */
  async getAllCustomSchemesForYear(
    academicYear: number
  ): Promise<Map<PrismaGradeLevel, YearSpecificGrading["schemes"]>> {
    const schemes = await prisma.eczGradingScheme.findMany({
      where: { academicYear },
      orderBy: [{ gradeLevel: "asc" }, { minMark: "desc" }],
    });

    const schemeMap = new Map<PrismaGradeLevel, YearSpecificGrading["schemes"]>();

    schemes.forEach((scheme) => {
      if (!schemeMap.has(scheme.gradeLevel)) {
        schemeMap.set(scheme.gradeLevel, []);
      }

      schemeMap.get(scheme.gradeLevel)!.push({
        minMark: scheme.minMark,
        maxMark: scheme.maxMark,
        grade: scheme.grade,
        description: scheme.description || undefined,
      });
    });

    return schemeMap;
  }

  /**
   * Delete custom scheme for a year and grade level
   * Reverts to default grading system
   */
  async deleteCustomScheme(
    academicYear: number,
    gradeLevel: PrismaGradeLevel
  ): Promise<number> {
    const result = await prisma.eczGradingScheme.deleteMany({
      where: {
        academicYear,
        gradeLevel,
      },
    });

    return result.count;
  }

  /**
   * Get effective grading scheme (custom or default) for display
   */
  async getEffectiveGradingScheme(
    academicYear: number,
    prismaGradeLevel: PrismaGradeLevel
  ): Promise<{
    isCustom: boolean;
    schemes: Array<{
      minMark: number;
      maxMark: number;
      grade: ECZGrade;
      description: string;
    }>;
  }> {
    const customScheme = await this.getYearSpecificScheme(
      academicYear,
      prismaGradeLevel
    );

    if (customScheme && customScheme.length > 0) {
      return {
        isCustom: true,
        schemes: customScheme.map((s) => ({
          ...s,
          description: s.description || "",
        })),
      };
    }

    // Return default scheme
    const eczLevel = mapPrismaGradeLevelToECZLevel(prismaGradeLevel);
    const defaultSchemes = getGradingScale(eczLevel);

    return {
      isCustom: false,
      schemes: defaultSchemes.map((s) => ({
        minMark: s.minPercentage,
        maxMark: s.maxPercentage,
        grade: s.grade,
        description: s.displayName,
      })),
    };
  }
}

// Singleton instance
export const eczGradingService = new EczGradingService();
