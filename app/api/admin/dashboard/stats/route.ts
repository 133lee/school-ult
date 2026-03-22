import { NextRequest } from "next/server";
import { withAuth } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/logger/logger";

/**
 * GET /api/admin/dashboard/stats
 *
 * Returns derived aggregate statistics for admin dashboard.
 * All counts are computed from database, never cached.
 *
 * IMPORTANT: This is PURE DERIVED STATE.
 * No data is stored here, only queried and aggregated.
 *
 * Returns:
 * - students: { total, active }
 * - teachers: { total, active }
 * - classes: { total, active }
 * - academicYear: { year, termDisplay }
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    logger.logRequest("GET", "/api/admin/dashboard/stats", user.userId);

    // Authorization check: Only admin roles can access
    if (!["ADMIN", "HEAD_TEACHER", "CLERK"].includes(user.role)) {
      return ApiResponse.error("Unauthorized. Admin access required.", 403);
    }

    // Execute queries in parallel for performance
    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalClasses,
      activeClasses,
      activeAcademicYear,
    ] = await Promise.all([
      // Total students (all statuses)
      prisma.student.count(),

      // Active students only (enrolled and attending)
      prisma.student.count({
        where: {
          status: { in: ["ACTIVE", "SUSPENDED"] },
        },
      }),

      // Total teachers
      prisma.teacherProfile.count(),

      // Active teachers only
      prisma.teacherProfile.count({
        where: { status: "ACTIVE" },
      }),

      // Total classes
      prisma.class.count(),

      // Active classes only
      prisma.class.count({
        where: {
          status: "ACTIVE",
        },
      }),

      // Active academic year with active term
      prisma.academicYear.findFirst({
        where: { isActive: true },
        include: {
          terms: {
            where: { isActive: true },
            select: {
              id: true,
              termType: true,
            },
          },
        },
      }),
    ]);

    // Format active term display
    const activeTerm = activeAcademicYear?.terms[0];
    const termDisplay = activeTerm
      ? `Term ${activeTerm.termType.replace("TERM_", "")} in progress`
      : "No active term";

    return ApiResponse.success({
      students: {
        total: totalStudents,
        active: activeStudents,
      },
      teachers: {
        total: totalTeachers,
        active: activeTeachers,
      },
      classes: {
        total: totalClasses,
        active: activeClasses,
      },
      academicYear: {
        year: activeAcademicYear?.year || null,
        termDisplay,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      endpoint: "/api/admin/dashboard/stats",
    });
  }
});
