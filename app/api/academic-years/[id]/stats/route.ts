import { NextRequest, NextResponse } from "next/server";
import { academicYearService } from "@/features/academic-years/academicYear.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/academic-years/[id]/stats
 * Get academic year statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
    const { id } = await params;

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

    const stats = await academicYearService.getAcademicYearStatistics(
      id,
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Error fetching academic year statistics:", error);

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch academic year statistics" },
      { status: 500 }
    );
  }
}
