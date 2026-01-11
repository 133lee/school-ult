import { NextRequest } from "next/server";
import { withAuth } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/logger/logger";

/**
 * POST /api/departments/[id]/members
 *
 * Add teachers to a department
 * Body:
 * - teacherIds: string[] - Array of teacher IDs to add
 *
 * SECURITY: Only ADMIN role can manage department members
 */
export async function POST(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req: NextRequest, user) => {
    try {
      const params = await segmentData.params;
      const departmentId = params.id;
      logger.logRequest("POST", `/api/departments/${departmentId}/members`, user.userId);

      // Authorization check: Only admins can manage department members
      if (user.role !== "ADMIN") {
        logger.warn("Unauthorized role attempting to add department members", {
          userId: user.userId,
          role: user.role,
        });
        return ApiResponse.forbidden("Only administrators can manage department members");
      }

      // Parse request body
      const body = await req.json();
      const { teacherIds } = body;

      if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
        return ApiResponse.badRequest("teacherIds must be a non-empty array");
      }

      // Validate department exists
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        return ApiResponse.notFound("Department not found");
      }

      // Validate all teachers exist
      const teachers = await prisma.teacherProfile.findMany({
        where: { id: { in: teacherIds } },
      });

      if (teachers.length !== teacherIds.length) {
        return ApiResponse.badRequest("One or more teacher IDs are invalid");
      }

      // Create department assignments
      const assignments = await Promise.all(
        teacherIds.map((teacherId) =>
          prisma.teacherDepartment.upsert({
            where: {
              teacherId_departmentId: {
                teacherId,
                departmentId,
              },
            },
            create: {
              teacherId,
              departmentId,
              isPrimary: false, // Can be updated later if needed
            },
            update: {}, // If already exists, do nothing
          })
        )
      );

      logger.info("Teachers added to department", {
        userId: user.userId,
        departmentId,
        teacherCount: teacherIds.length,
      });

      return ApiResponse.success({
        message: `${teacherIds.length} teacher(s) added to department`,
        assignments,
      });
    } catch (error) {
      return handleApiError(error, {
        userId: user.userId,
        endpoint: `/api/departments/${params.id}/members`,
      });
    }
  })(request, {} as any);
}

/**
 * DELETE /api/departments/[id]/members
 *
 * Remove a teacher from a department
 * Body:
 * - teacherId: string - Teacher ID to remove
 *
 * SECURITY: Only ADMIN role can manage department members
 */
export async function DELETE(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req: NextRequest, user) => {
    try {
      const params = await segmentData.params;
      const departmentId = params.id;
      logger.logRequest("DELETE", `/api/departments/${departmentId}/members`, user.userId);

      // Authorization check: Only admins can manage department members
      if (user.role !== "ADMIN") {
        logger.warn("Unauthorized role attempting to remove department members", {
          userId: user.userId,
          role: user.role,
        });
        return ApiResponse.forbidden("Only administrators can manage department members");
      }

      // Parse request body
      const body = await req.json();
      const { teacherId } = body;

      if (!teacherId || typeof teacherId !== "string") {
        return ApiResponse.badRequest("teacherId is required");
      }

      // Delete the assignment
      const deleted = await prisma.teacherDepartment.deleteMany({
        where: {
          teacherId,
          departmentId,
        },
      });

      if (deleted.count === 0) {
        return ApiResponse.notFound("Teacher not found in this department");
      }

      logger.info("Teacher removed from department", {
        userId: user.userId,
        departmentId,
        teacherId,
      });

      return ApiResponse.success({
        message: "Teacher removed from department",
      });
    } catch (error) {
      return handleApiError(error, {
        userId: user.userId,
        endpoint: `/api/departments/${params.id}/members`,
      });
    }
  })(request, {} as any);
}
