import { NextRequest, NextResponse } from "next/server";
import { attendanceRecordService } from "@/features/attendance/attendanceRecord.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/attendance/student/[studentId]/stats
 * Get attendance statistics for a student in a term
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
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

    const searchParams = request.nextUrl.searchParams;
    const termId = searchParams.get("termId");

    if (!termId) {
      return NextResponse.json(
        { error: "termId is required" },
        { status: 400 }
      );
    }

    const { studentId } = await params;

    const stats = await attendanceRecordService.getStudentTermStatistics(
      studentId,
      termId,
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Error fetching attendance statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance statistics" },
      { status: 500 }
    );
  }
}
