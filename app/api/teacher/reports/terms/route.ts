import { NextRequest } from "next/server";
import { withAuth } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import { logger } from "@/lib/logger/logger";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/teacher/reports/terms
 *
 * Fetch all available terms for report viewing.
 * Returns terms ordered by academic year (newest first) and term type.
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    logger.logRequest("GET", "/api/teacher/reports/terms", user.userId);

    // Fetch all terms with academic year info
    // Note: This is a simple lookup that doesn't require service layer
    // Any authenticated teacher can view available terms
    const terms = await prisma.term.findMany({
      include: {
        academicYear: {
          select: {
            year: true,
            isActive: true,
          },
        },
      },
      orderBy: [
        { academicYear: { year: "desc" } },
        { termType: "asc" },
      ],
    });

    // Format terms for response
    const formattedTerms = terms.map((term) => ({
      id: term.id,
      name: `${term.termType} ${term.academicYear.year}`,
      termType: term.termType,
      academicYear: term.academicYear.year,
      isActive: term.isActive,
      startDate: term.startDate,
      endDate: term.endDate,
    }));

    return ApiResponse.success({ terms: formattedTerms });
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      endpoint: "/api/teacher/reports/terms",
    });
  }
});
