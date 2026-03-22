import prisma from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/http/errors";
import { logger } from "@/lib/logger/logger";
import { TeacherClassView, TeacherClassesResponse } from "./teacher-app.types";

/**
 * Teacher Class Service
 *
 * Business logic for teachers viewing their class assignments.
 * Handles both class teacher and subject teacher assignments.
 */
export class TeacherClassService {
  /**
   * Get all classes for a teacher
   *
   * @param userId - The user ID of the logged-in teacher
   * @returns All classes the teacher is assigned to
   */
  async getClassesForTeacher(userId: string): Promise<TeacherClassesResponse> {
    logger.info("Fetching classes for teacher", { userId });

    // Get teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!teacherProfile) {
      logger.warn("Teacher profile not found", { userId });
      throw new NotFoundError("Teacher profile not found");
    }

    // Get active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      logger.info("No active academic year found - returning empty class lists", { userId });
      // Return empty response instead of throwing error
      // This is a valid state during system setup or between academic years
      return {
        classTeacherClasses: [],
        subjectTeacherClasses: [],
        allClasses: [],
      };
    }

    logger.debug("Active academic year found", {
      academicYearId: academicYear.id,
      year: academicYear.year,
    });

    // Get class teacher assignments
    const classTeacherAssignments = await prisma.classTeacherAssignment.findMany({
      where: {
        teacherId: teacherProfile.id,
        academicYearId: academicYear.id,
      },
      include: {
        class: {
          include: {
            grade: true,
          },
        },
      },
    });

    logger.debug("Class teacher assignments found", {
      count: classTeacherAssignments.length,
      teacherId: teacherProfile.id,
      academicYearId: academicYear.id,
      assignments: classTeacherAssignments.map(a => ({
        id: a.id,
        classId: a.classId,
        className: a.class.name,
        gradeName: a.class.grade.name,
      })),
    });

    // Get subject teacher assignments
    const subjectTeacherAssignments = await prisma.subjectTeacherAssignment.findMany({
      where: {
        teacherId: teacherProfile.id,
        academicYearId: academicYear.id,
      },
      include: {
        class: {
          include: {
            grade: true,
          },
        },
        subject: true,
      },
    });

    logger.debug("Subject teacher assignments found", {
      count: subjectTeacherAssignments.length,
    });

    // Format class teacher classes
    const classTeacherClasses = await Promise.all(
      classTeacherAssignments.map(async (assignment) =>
        this.formatClassTeacherClass(assignment, teacherProfile.id, academicYear.id)
      )
    );

    // Format subject teacher classes
    const subjectTeacherClasses = await Promise.all(
      subjectTeacherAssignments.map((assignment) =>
        this.formatSubjectTeacherClass(assignment, academicYear.id)
      )
    );

    // Combine both lists, avoiding duplicates
    const allClasses = [
      ...classTeacherClasses,
      ...subjectTeacherClasses.filter(
        (sc) => !classTeacherClasses.some((ct) => ct.id === sc.id)
      ),
    ];

    logger.info("Classes fetched successfully", {
      userId,
      classTeacherCount: classTeacherClasses.length,
      subjectTeacherCount: subjectTeacherClasses.length,
      totalUniqueClasses: allClasses.length,
      classTeacherClasses: classTeacherClasses.map(c => ({ id: c.id, name: c.name })),
      subjectTeacherClasses: subjectTeacherClasses.map(c => ({ id: c.id, name: c.name })),
    });

    return {
      classTeacherClasses,
      subjectTeacherClasses,
      allClasses,
    };
  }

  /**
   * Format class teacher assignment to TeacherClassView
   *
   * @param assignment - Class teacher assignment with relations
   * @param teacherId - The teacher profile ID
   * @param academicYearId - The academic year ID
   * @returns Formatted TeacherClassView
   */
  private async formatClassTeacherClass(
    assignment: any,
    teacherId: string,
    academicYearId: string
  ): Promise<TeacherClassView> {
    // For PRIMARY grades, class teacher teaches all subjects
    // For SECONDARY grades, check if they teach a specific subject
    const isPrimary = assignment.class.grade.schoolLevel === "PRIMARY";

    let teachingSubject = "All Subjects"; // Default for primary
    let teachingSubjectId: string | undefined = undefined;

    if (!isPrimary) {
      // For secondary, check if this class teacher also teaches a subject in this class
      const subjectAssignment = await prisma.subjectTeacherAssignment.findFirst({
        where: {
          teacherId,
          classId: assignment.classId,
          academicYearId,
        },
        include: {
          subject: true,
        },
      });
      teachingSubject = subjectAssignment?.subject.name || "—";
      teachingSubjectId = subjectAssignment?.subject.id;
    }

    // Get actual student count from enrollments (source of truth)
    const actualStudentCount = await prisma.studentClassEnrollment.count({
      where: {
        classId: assignment.classId,
        academicYearId,
      },
    });

    logger.debug("Formatted class teacher class", {
      classId: assignment.classId,
      isPrimary,
      teachingSubject,
      actualStudentCount,
    });

    return {
      id: assignment.classId,
      name: `${assignment.class.grade.name} ${assignment.class.name}`,
      gradeLevel: assignment.class.grade.name,
      totalStudents: actualStudentCount,
      capacity: assignment.class.capacity,
      isClassTeacher: true,
      teachingSubject,
      teachingSubjectId, // Include subjectId for subject analysis (only for secondary)
      status: assignment.class.status,
    };
  }

  /**
   * Format subject teacher assignment to TeacherClassView
   *
   * @param assignment - Subject teacher assignment with relations
   * @param academicYearId - The academic year ID
   * @returns Formatted TeacherClassView
   */
  private async formatSubjectTeacherClass(
    assignment: any,
    academicYearId: string
  ): Promise<TeacherClassView> {
    // Get actual student count from enrollments (source of truth)
    const actualStudentCount = await prisma.studentClassEnrollment.count({
      where: {
        classId: assignment.classId,
        academicYearId,
      },
    });

    return {
      id: assignment.classId,
      name: `${assignment.class.grade.name} ${assignment.class.name}`,
      gradeLevel: assignment.class.grade.name,
      totalStudents: actualStudentCount,
      capacity: assignment.class.capacity,
      isClassTeacher: false,
      teachingSubject: assignment.subject.name,
      teachingSubjectId: assignment.subject.id, // Include subjectId for subject analysis
      status: assignment.class.status,
    };
  }

  /**
   * Get a specific class for a teacher
   *
   * @param userId - The user ID of the teacher
   * @param classId - The class ID
   * @returns Class details if teacher has access
   * @throws NotFoundError if class not found or teacher has no access
   */
  async getClassForTeacher(userId: string, classId: string): Promise<TeacherClassView> {
    logger.info("Fetching specific class for teacher", { userId, classId });

    const classes = await this.getClassesForTeacher(userId);

    const classView = classes.allClasses.find((c) => c.id === classId);

    if (!classView) {
      logger.warn("Class not found or teacher has no access", { userId, classId });
      throw new NotFoundError("Class not found or you do not have access to this class");
    }

    logger.info("Class fetched successfully", { userId, classId });

    return classView;
  }

  /**
   * Check if teacher is class teacher for any class
   *
   * @param userId - The user ID of the teacher
   * @returns True if teacher is a class teacher
   */
  async isClassTeacher(userId: string): Promise<boolean> {
    logger.debug("Checking if teacher is class teacher", { userId });

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!teacherProfile) {
      throw new NotFoundError("Teacher profile not found");
    }

    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      throw new NotFoundError("No active academic year found");
    }

    const assignment = await prisma.classTeacherAssignment.findFirst({
      where: {
        teacherId: teacherProfile.id,
        academicYearId: academicYear.id,
      },
    });

    const result = !!assignment;

    logger.debug("Class teacher check result", { userId, isClassTeacher: result });

    return result;
  }
}

// Export singleton instance
export const teacherClassService = new TeacherClassService();
