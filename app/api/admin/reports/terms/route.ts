import { NextRequest } from "next/server";
import { withAuth } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/logger/logger";

/**
 * GET /api/admin/reports/terms
 *
 * Get all terms for admin reports filtering
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    logger.logRequest("GET", "/api/admin/reports/terms", user.userId);

    const terms = await prisma.term.findMany({
      select: {
        id: true,
        termType: true,
        isActive: true,
        academicYear: {
          select: {
            year: true,
          },
        },
      },
      orderBy: [
        { academicYear: { year: "desc" } },
        { termType: "asc" },
      ],
    });

    const formattedTerms = terms.map((term) => ({
      id: term.id,
      name: `${term.termType.replace("_", " ")} - ${term.academicYear.year}`,
      termType: term.termType,
      academicYear: term.academicYear.year.toString(),
      isActive: term.isActive,
    }));

    return ApiResponse.success({ terms: formattedTerms });
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      endpoint: "/api/admin/reports/terms",
    });
  }
}, ["ADMIN", "HEAD_TEACHER"]);
