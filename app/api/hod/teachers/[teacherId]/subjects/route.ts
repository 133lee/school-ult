import { NextRequest } from "next/server";
import { withHODAccess } from "@/lib/http/with-auth";
import { getHODDepartment } from "@/lib/auth/position-helpers";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/logger/logger";

/**
 * GET /api/hod/teachers/[teacherId]/subjects
 *
 * Get subjects a specific teacher is qualified to teach
 * Only returns subjects that are:
 * 1. In the HOD's department
 * 2. The teacher is qualified for (has TeacherSubject relationship)
 */
export const GET = withHODAccess(
  async (request: NextRequest, user, { params }) => {
    try {
      const { teacherId } = await params;
      logger.logRequest(
        "GET",
        `/api/hod/teachers/${teacherId}/subjects`,
        user.userId
      );

      // Get HOD's department
      const hodDept = await getHODDepartment(user.userId);
      if (!hodDept) {
        return ApiResponse.forbidden("Not assigned as HOD of any department");
      }

      // Verify teacher exists and belongs to HOD's department
      const hodTeacher = await prisma.teacherProfile.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });

      const teacher = await prisma.teacherProfile.findUnique({
        where: { id: teacherId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          departments: {
            where: { departmentId: hodDept.id },
            select: { departmentId: true },
          },
        },
      });

      if (!teacher) {
        return ApiResponse.notFound("Teacher not found");
      }

      // Allow if teacher is in department OR is the HOD themselves
      const isInDepartment = teacher.departments.length > 0;
      const isHOD = hodTeacher?.id === teacherId;

      if (!isInDepartment && !isHOD) {
        return ApiResponse.forbidden(
          "Teacher does not belong to your department"
        );
      }

      // Get subjects the teacher is qualified for (TeacherSubject)
      // that are also in the HOD's department
      // NOTE: Being HOD doesn't automatically qualify you to teach all subjects
      // Teaching qualifications are separate from administrative role
      const teacherSubjects = await prisma.teacherSubject.findMany({
        where: {
          teacherId: teacherId,
          subject: {
            departmentId: hodDept.id,
            deletedAt: null,
          },
        },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              departmentId: true,
            },
          },
        },
        orderBy: {
          subject: {
            name: "asc",
          },
        },
      });

      const subjects = teacherSubjects.map((ts) => ts.subject);

      return ApiResponse.success(subjects);
    } catch (error) {
      return handleApiError(error, {
        userId: user.userId,
        endpoint: `/api/hod/teachers/${(await params).teacherId}/subjects`,
      });
    }
  }
);
