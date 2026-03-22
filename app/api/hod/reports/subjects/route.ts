import { NextRequest } from "next/server";
import { withHODAccess } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/logger/logger";

/**
 * GET /api/hod/reports/subjects
 *
 * Get all subjects for HOD reports filtering
 */
export const GET = withHODAccess(async (request: NextRequest, user) => {
  try {
    logger.logRequest("GET", "/api/hod/reports/subjects", user.userId);

    // Get HOD's teacher profile and department
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: user.userId },
      include: {
        departmentAsHOD: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!teacherProfile?.departmentAsHOD) {
      return ApiResponse.error("HOD department not found", 404);
    }

    // Get only subjects in HOD's department
    const subjects = await prisma.subject.findMany({
      where: {
        departmentId: teacherProfile.departmentAsHOD.id,
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
    });

    return ApiResponse.success({ subjects });
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      endpoint: "/api/hod/reports/subjects",
    });
  }
});
