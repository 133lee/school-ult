import { NextRequest } from "next/server";
import { withHODAccess } from "@/lib/http/with-auth";
import { getHODDepartment } from "@/lib/auth/position-helpers";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import { logger } from "@/lib/logger/logger";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/hod/curriculum/[classId]
 *
 * Fetches ClassSubjects (curriculum items) for a specific class,
 * filtered to the HOD's department subjects only.
 *
 * This returns what subjects the class offers that belong to the HOD's department,
 * along with current teacher assignments for each.
 *
 * Query Parameters:
 * - academicYearId: Filter by academic year (optional, uses active year if not provided)
 */
export const GET = withHODAccess(
  async (
    request: NextRequest,
    user,
    { params }: { params: Promise<{ classId: string }> }
  ) => {
    try {
      const { classId } = await params;
      logger.logRequest("GET", `/api/hod/curriculum/${classId}`, user.userId);

      // Get HOD's department
      const hodDept = await getHODDepartment(user.userId);
      if (!hodDept) {
        return ApiResponse.forbidden("Not assigned as HOD of any department");
      }

      // Parse query parameters
      const { searchParams } = new URL(request.url);
      let academicYearId = searchParams.get("academicYearId") || undefined;

      // If no academic year specified, get the active one
      if (!academicYearId) {
        const activeYear = await prisma.academicYear.findFirst({
          where: { isActive: true },
          select: { id: true },
        });
        academicYearId = activeYear?.id;
      }

      if (!academicYearId) {
        return ApiResponse.badRequest("No active academic year found");
      }

      // Verify class exists and is secondary grade
      const classEntity = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          grade: true,
        },
      });

      if (!classEntity) {
        return ApiResponse.notFound("Class not found");
      }

      const SECONDARY_GRADES = [
        "GRADE_8",
        "GRADE_9",
        "GRADE_10",
        "GRADE_11",
        "GRADE_12",
      ];

      if (!SECONDARY_GRADES.includes(classEntity.grade.level)) {
        return ApiResponse.forbidden(
          "HOD can only manage curriculum for secondary grades (8-12)"
        );
      }

      // Fetch curriculum items for this class that belong to HOD's department
      const curriculumItems = await prisma.classSubject.findMany({
        where: {
          classId,
          subject: {
            departmentId: hodDept.id,
            deletedAt: null,
          },
        },
        include: {
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
              description: true,
            },
          },
          subjectTeacherAssignments: {
            where: {
              academicYearId,
            },
            include: {
              teacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  staffNumber: true,
                },
              },
            },
          },
        },
        orderBy: {
          subject: { name: "asc" },
        },
      });

      // Transform the response
      const curriculum = curriculumItems.map((item) => ({
        classSubjectId: item.id,
        isCore: item.isCore,
        periodsPerWeek: item.periodsPerWeek,
        subject: {
          id: item.subject.id,
          code: item.subject.code,
          name: item.subject.name,
          description: item.subject.description,
        },
        currentAssignment: item.subjectTeacherAssignments[0]
          ? {
              id: item.subjectTeacherAssignments[0].id,
              teacher: {
                id: item.subjectTeacherAssignments[0].teacher.id,
                name: `${item.subjectTeacherAssignments[0].teacher.firstName} ${item.subjectTeacherAssignments[0].teacher.lastName}`,
                staffNumber: item.subjectTeacherAssignments[0].teacher.staffNumber,
              },
            }
          : null,
        isAssigned: item.subjectTeacherAssignments.length > 0,
      }));

      // Calculate stats
      const stats = {
        total: curriculum.length,
        assigned: curriculum.filter((c) => c.isAssigned).length,
        unassigned: curriculum.filter((c) => !c.isAssigned).length,
        totalPeriodsPerWeek: curriculum.reduce(
          (sum, c) => sum + c.periodsPerWeek,
          0
        ),
      };

      return ApiResponse.success({
        class: {
          id: classEntity.id,
          name: classEntity.name,
          grade: {
            id: classEntity.grade.id,
            name: classEntity.grade.name,
            level: classEntity.grade.level,
          },
        },
        curriculum,
        stats,
        academicYearId,
        departmentId: hodDept.id,
        departmentName: hodDept.name,
      });
    } catch (error) {
      const { classId } = await params;
      return handleApiError(error, {
        userId: user.userId,
        endpoint: `/api/hod/curriculum/${classId}`,
      });
    }
  }
);
