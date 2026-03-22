import { NextRequest } from "next/server";
import { withHODAccess } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/logger/logger";

/**
 * GET /api/hod/reports/classes
 *
 * Get classes for a specific grade
 */
export const GET = withHODAccess(async (request: NextRequest, user) => {
  try {
    logger.logRequest("GET", "/api/hod/reports/classes", user.userId);

    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get("gradeId");

    if (!gradeId) {
      return ApiResponse.error("Grade ID is required", 400);
    }

    const classes = await prisma.class.findMany({
      where: {
        gradeId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        gradeId: true,
        grade: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formattedClasses = classes.map((c) => ({
      id: c.id,
      name: c.name,
      gradeId: c.gradeId,
      gradeName: c.grade.name,
    }));

    return ApiResponse.success({ classes: formattedClasses });
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      endpoint: "/api/hod/reports/classes",
    });
  }
});
