import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { ApiResponse } from "@/lib/http/api-response";

export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return ApiResponse.unauthorized("Missing or invalid authorization header");
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    if (!decoded) {
      return ApiResponse.unauthorized("Invalid or expired token");
    }

    // Get active academic year
    const activeYear = await prisma.academicYear.findFirst({
      where: {
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!activeYear) {
      // Valid empty state: no active academic year during initial setup
      return ApiResponse.success(null, {
        message: "No active academic year configured",
      });
    }

    // Get active term in the active academic year
    const activeTerm = await prisma.term.findFirst({
      where: {
        academicYearId: activeYear.id,
        isActive: true,
      },
      select: {
        id: true,
        termType: true,
        startDate: true,
        endDate: true,
        academicYear: {
          select: {
            year: true,
          },
        },
      },
    });

    if (!activeTerm) {
      // Valid empty state: no active term (between terms or during setup)
      return ApiResponse.success(null, {
        message: "No active term configured",
      });
    }

    return ApiResponse.success({
      id: activeTerm.id,
      termType: activeTerm.termType,
      startDate: activeTerm.startDate,
      endDate: activeTerm.endDate,
      academicYear: activeTerm.academicYear.year,
    });
  } catch (error) {
    console.error("Error fetching active term:", error);
    return ApiResponse.internalError("Failed to fetch active term");
  }
}
