import { NextRequest, NextResponse } from "next/server";
import { academicYearService } from "@/features/academic-years/academicYear.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/academic-years/active
 * Get the currently active academic year
 */
export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const academicYear = await academicYearService.getActiveAcademicYear({
      userId: decoded.userId,
      role: decoded.role as any,
    });

    if (!academicYear) {
      return NextResponse.json(
        { error: "No active academic year found" },
        { status: 404 }
      );
    }

    return NextResponse.json(academicYear);
  } catch (error) {
    console.error("Error fetching active academic year:", error);
    return NextResponse.json(
      { error: "Failed to fetch active academic year" },
      { status: 500 }
    );
  }
}
