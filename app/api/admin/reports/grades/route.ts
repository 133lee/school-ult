import { NextRequest } from "next/server";
import { withAuth } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/logger/logger";

/**
 * GET /api/admin/reports/grades
 *
 * Get all grades for admin reports filtering
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    logger.logRequest("GET", "/api/admin/reports/grades", user.userId);

    const grades = await prisma.grade.findMany({
      select: {
        id: true,
        name: true,
        level: true,
        sequence: true,
      },
      orderBy: {
        sequence: "asc",
      },
    });

    return ApiResponse.success({ grades });
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      endpoint: "/api/admin/reports/grades",
    });
  }
}, ["ADMIN", "HEAD_TEACHER"]);
