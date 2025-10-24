/**
 * CLASS TEACHER ASSIGNMENT RULES
 *
 * This file contains validation rules and helper functions for enforcing
 * the "one class teacher per class" constraint in the school management system.
 *
 * BUSINESS RULE:
 * A teacher can only be assigned as a class teacher (homeroom teacher) to
 * ONE class at a time within a given academic year and term.
 *
 * This ensures:
 * 1. Clear responsibility and accountability
 * 2. Manageable workload for class teachers
 * 3. Direct line of communication for students and parents
 * 4. Simplified morning register taking (one class to manage)
 */

export interface ClassTeacherAssignment {
  id: string;
  teacherId: string;
  classId: string;
  className: string;
  academicYearId: string;
  termId: string;
  isClassTeacher: boolean;
  isActive: boolean;
}

/**
 * Check if a teacher is already assigned as a class teacher for the given academic year/term
 *
 * @param teacherId - The ID of the teacher to check
 * @param academicYearId - The academic year ID
 * @param termId - The term ID
 * @param assignments - Array of current teacher class assignments
 * @returns The existing assignment if found, null otherwise
 */
export function getExistingClassTeacherAssignment(
  teacherId: string,
  academicYearId: string,
  termId: string,
  assignments: ClassTeacherAssignment[]
): ClassTeacherAssignment | null {
  return assignments.find(
    (assignment) =>
      assignment.teacherId === teacherId &&
      assignment.academicYearId === academicYearId &&
      assignment.termId === termId &&
      assignment.isClassTeacher === true &&
      assignment.isActive === true
  ) || null;
}

/**
 * Validate if a teacher can be assigned as a class teacher
 *
 * @param teacherId - The ID of the teacher to assign
 * @param academicYearId - The academic year ID
 * @param termId - The term ID
 * @param assignments - Array of current teacher class assignments
 * @returns Validation result with success flag and message
 */
export function validateClassTeacherAssignment(
  teacherId: string,
  academicYearId: string,
  termId: string,
  assignments: ClassTeacherAssignment[]
): { isValid: boolean; message: string; existingAssignment?: ClassTeacherAssignment } {
  const existingAssignment = getExistingClassTeacherAssignment(
    teacherId,
    academicYearId,
    termId,
    assignments
  );

  if (existingAssignment) {
    return {
      isValid: false,
      message: `This teacher is already assigned as class teacher to ${existingAssignment.className}. A teacher can only manage one class at a time. Please unassign them first.`,
      existingAssignment,
    };
  }

  return {
    isValid: true,
    message: "Teacher can be assigned as class teacher.",
  };
}

/**
 * Get human-readable error message for UI display
 *
 * @param teacherName - Name of the teacher
 * @param existingClassName - Name of the class they're already managing
 * @returns Formatted error message
 */
export function getClassTeacherConflictMessage(
  teacherName: string,
  existingClassName: string
): string {
  return `${teacherName} is already the class teacher for ${existingClassName}. A teacher can only be assigned as class teacher to one class per academic year/term. Please unassign them from ${existingClassName} first, or select a different teacher.`;
}

/**
 * Database query helper for Prisma
 * Use this to check existing assignments before creating/updating
 *
 * Example usage with Prisma:
 * ```typescript
 * const existingAssignment = await prisma.teacherClassAssignment.findFirst({
 *   where: {
 *     teacherId: teacherId,
 *     academicYearId: academicYearId,
 *     termId: termId,
 *     isClassTeacher: true,
 *     isActive: true,
 *   },
 *   include: {
 *     class: true,
 *     teacher: true,
 *   }
 * });
 *
 * if (existingAssignment) {
 *   throw new Error(
 *     getClassTeacherConflictMessage(
 *       existingAssignment.teacher.firstName + ' ' + existingAssignment.teacher.lastName,
 *       existingAssignment.class.name
 *     )
 *   );
 * }
 * ```
 */
export const PRISMA_CLASS_TEACHER_CHECK_QUERY = {
  where: {
    isClassTeacher: true,
    isActive: true,
  },
  include: {
    class: true,
    teacher: true,
  },
} as const;

/**
 * Constants for the business rule
 */
export const CLASS_TEACHER_RULES = {
  MAX_CLASSES_PER_TEACHER: 1,
  CONSTRAINT_SCOPE: "Per Academic Year/Term",
  VIOLATION_MESSAGE: "A teacher can only be assigned as class teacher to ONE class per academic year/term",
} as const;
