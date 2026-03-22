import { NextRequest } from "next/server";
import { withHODAccess } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/logger/logger";
import { StaffStatus } from "@/generated/prisma/client";

/**
 * GET /api/hod/profile
 *
 * Get the complete profile for the logged-in HOD including:
 * - User information (email, role)
 * - Department information
 * - Department statistics (subjects, teachers)
 *
 * SECURITY: Only HOD role can access their own profile
 */
export const GET = withHODAccess(async (request: NextRequest, user) => {
  try {
    logger.logRequest("GET", "/api/hod/profile", user.userId);

    // Get HOD user with department information
    const hodUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        hasDefaultPassword: true,
        lastLogin: true,
        createdAt: true,
        departmentAsHOD: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            status: true,
            createdAt: true,
            subjects: {
              where: {
                deletedAt: null,
              },
              select: {
                id: true,
                name: true,
                code: true,
              },
              orderBy: {
                name: "asc",
              },
            },
            teachers: {
              where: {
                teacher: {
                  status: StaffStatus.ACTIVE,
                },
              },
              select: {
                teacher: {
                  select: {
                    id: true,
                    staffNumber: true,
                    firstName: true,
                    lastName: true,
                    qualification: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!hodUser) {
      return ApiResponse.error("User not found", 404);
    }

    if (!hodUser.departmentAsHOD) {
      return ApiResponse.error(
        "You are not assigned to any department. Please contact the administrator to assign you to a department as the Head of Department.",
        404
      );
    }

    // Transform the data for frontend
    const profile = {
      id: hodUser.id,
      email: hodUser.email,
      role: hodUser.role,
      hasDefaultPassword: hodUser.hasDefaultPassword,
      lastLogin: hodUser.lastLogin,
      createdAt: hodUser.createdAt,
      department: {
        id: hodUser.departmentAsHOD.id,
        name: hodUser.departmentAsHOD.name,
        code: hodUser.departmentAsHOD.code,
        description: hodUser.departmentAsHOD.description,
        status: hodUser.departmentAsHOD.status,
        createdAt: hodUser.departmentAsHOD.createdAt,
        totalSubjects: hodUser.departmentAsHOD.subjects.length,
        totalTeachers: hodUser.departmentAsHOD.teachers.length,
        subjects: hodUser.departmentAsHOD.subjects,
        teachers: hodUser.departmentAsHOD.teachers.map((t) => t.teacher),
      },
    };

    return ApiResponse.success(profile);
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      endpoint: "/api/hod/profile",
    });
  }
});
