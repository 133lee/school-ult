import { NextRequest } from "next/server";
import { withHODAccess, AuthUser } from "@/lib/http/with-auth";
import { getHODDepartment } from "@/lib/auth/position-helpers";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import { logger } from "@/lib/logger/logger";
import prisma from "@/lib/db/prisma";
import {
  TeacherAssessmentEntry,
  AssessmentDashboardStats,
  AssessmentEntryStatus,
} from "@/types/hod-assessment";

/**
 * GET /api/hod/assessment-entries
 *
 * Get assessment entry progress for all teachers in HOD's department
 * Returns:
 * - List of teacher assessment entries with progress
 * - Dashboard statistics
 * - Filter options
 */
export const GET = withHODAccess(async (request: NextRequest, user: AuthUser) => {
  try {
    logger.logRequest("GET", "/api/hod/assessment-entries", user.userId);

    // Get HOD's department
    const hodDept = await getHODDepartment(user.userId);
    if (!hodDept) {
      return ApiResponse.forbidden("Not assigned as HOD of any department");
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const termId = searchParams.get("termId") || undefined;
    const assessmentType = searchParams.get("assessmentType") || undefined;
    const classId = searchParams.get("classId") || undefined;
    const teacherId = searchParams.get("teacherId") || undefined;
    const status = searchParams.get("status") || undefined;
    const examType = assessmentType as any; // Map to examType enum

    // Get active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      return ApiResponse.notFound("No active academic year found");
    }

    // Get active term if not specified
    let activeTermId = termId;
    if (!activeTermId) {
      const activeTerm = await prisma.term.findFirst({
        where: {
          academicYearId: academicYear.id,
          isActive: true,
        },
      });
      activeTermId = activeTerm?.id;
    }

    // Get all subjects in HOD's department
    const departmentSubjects = await prisma.subject.findMany({
      where: {
        departmentId: hodDept.id,
      },
      select: { id: true, name: true },
    });

    const subjectIds = departmentSubjects.map((s) => s.id);

    // Get subject-teacher assignments for department subjects
    const assignments = await prisma.subjectTeacherAssignment.findMany({
      where: {
        subjectId: { in: subjectIds },
        academicYearId: academicYear.id,
        ...(classId && { classId }),
        ...(teacherId && { teacherId }),
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        subject: true,
        class: {
          include: {
            grade: true,
            enrollments: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
      },
    });

    // Get assessments for these assignments
    const assessments = await prisma.assessment.findMany({
      where: {
        subjectId: { in: subjectIds },
        ...(activeTermId && { termId: activeTermId }),
        ...(examType && { examType }),
      },
      include: {
        subject: true,
        class: {
          include: {
            grade: true,
          },
        },
        results: true,
        term: true,
      },
    });

    // Build assessment entries list
    const teacherAssessmentEntries: TeacherAssessmentEntry[] = [];

    for (const assessment of assessments) {
      // Find the teacher assignment for this subject+class combination
      const assignment = assignments.find(
        (a) =>
          a.subjectId === assessment.subjectId &&
          a.classId === assessment.classId
      );

      if (!assignment) continue;

      // Get student count for this class
      const studentCount = assignment.class.enrollments.length;

      // Count scores entered for this assessment
      const scoresEntered = assessment.results.length;

      // Determine deadline (use assessment date or term end date)
      const deadline = assessment.assessmentDate || assessment.term.endDate || new Date();

      // Determine status
      let entryStatus: AssessmentEntryStatus = "not-started";
      const now = new Date();

      if (scoresEntered === studentCount && studentCount > 0) {
        entryStatus = "completed";
      } else if (scoresEntered > 0) {
        entryStatus = "in-progress";
        if (deadline < now) {
          entryStatus = "overdue";
        }
      } else if (deadline < now) {
        entryStatus = "overdue";
      }

      // Filter by status if specified
      if (status && status !== "All" && status.toLowerCase() !== entryStatus) {
        continue;
      }

      // Get last updated timestamp
      const lastResult = assessment.results
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .at(0);

      teacherAssessmentEntries.push({
        id: `${assessment.id}-${assignment.teacherId}`,
        teacherId: assignment.teacherId,
        teacherName: `${assignment.teacher.firstName} ${assignment.teacher.lastName}`,
        teacherEmail: assignment.teacher.user.email,
        subject: assessment.subject.name,
        subjectId: assessment.subjectId,
        className: `${assignment.class.grade.name} ${assignment.class.name}`,
        classId: assessment.classId,
        totalStudents: studentCount,
        scoresEntered,
        deadline,
        lastUpdated: lastResult?.updatedAt || assessment.updatedAt,
        status: entryStatus,
        assessmentId: assessment.id,
        assessmentType: assessment.examType,
      });
    }

    // Calculate dashboard stats
    const stats: AssessmentDashboardStats = {
      completed: teacherAssessmentEntries.filter((a) => a.status === "completed")
        .length,
      inProgress: teacherAssessmentEntries.filter(
        (a) => a.status === "in-progress"
      ).length,
      notStarted: teacherAssessmentEntries.filter(
        (a) => a.status === "not-started"
      ).length,
      overdue: teacherAssessmentEntries.filter((a) => a.status === "overdue")
        .length,
      totalAssessments: teacherAssessmentEntries.length,
    };

    // Get filter options
    const terms = await prisma.term.findMany({
      where: {
        academicYearId: academicYear.id,
      },
      select: {
        id: true,
        termType: true,
      },
    });

    const classes = await prisma.class.findMany({
      where: {
        id: { in: assignments.map((a) => a.classId) },
      },
      include: {
        grade: true,
      },
    });

    const teachers = await prisma.teacherProfile.findMany({
      where: {
        id: { in: assignments.map((a) => a.teacherId) },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    return ApiResponse.success({
      assessments: teacherAssessmentEntries,
      stats,
      filters: {
        terms: terms.map((t) => ({ id: t.id, name: t.termType })),
        assessmentTypes: ["CAT", "MID", "EOT"],
        classes: classes.map((c) => ({
          id: c.id,
          name: `${c.grade.name} ${c.name}`,
        })),
        teachers: teachers.map((t) => ({
          id: t.id,
          name: `${t.firstName} ${t.lastName}`,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      endpoint: "/api/hod/assessment-entries",
    });
  }
});
