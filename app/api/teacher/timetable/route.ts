import { NextRequest } from "next/server";
import { withAuth } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import { timetableService } from "@/features/timetables/timetable.service";
import { logger } from "@/lib/logger/logger";
import prisma from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/http/errors";

/**
 * GET /api/teacher/timetable
 *
 * Get the authenticated teacher's personal timetable.
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    logger.logRequest("GET", "/api/teacher/timetable", user.userId);

    // Get teacher profile ID
    const teacherProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { profile: true },
    });

    if (!teacherProfile || !teacherProfile.profile) {
      throw new NotFoundError("Teacher profile not found");
    }

    // Note: timetableService already has authorization logic
    const result = await timetableService.getTeacherTimetable(
      teacherProfile.profile.id!,
      {
        userId: user.userId,
        role: user.role as any,
        teacherProfileId: teacherProfile.profile.id!,
      }
    );

    return ApiResponse.success(result);
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      endpoint: "/api/teacher/timetable",
    });
  }
});
