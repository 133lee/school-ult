import { NextRequest } from "next/server";
import { withHODAccess } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/logger/logger";

/**
 * GET /api/hod/reports/grades
 *
 * Get secondary grades (8-12) for HOD reports filtering
 * HOD can only manage and report on secondary grades
 */
export const GET = withHODAccess(async (request: NextRequest, user) => {
  try {
    logger.logRequest("GET", "/api/hod/reports/grades", user.userId);

    // HOD is scoped to secondary grades only
    const grades = await prisma.grade.findMany({
      where: {
        level: {
          in: ["GRADE_8", "GRADE_9", "GRADE_10", "GRADE_11", "GRADE_12"],
        },
      },
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
      endpoint: "/api/hod/reports/grades",
    });
  }
});
