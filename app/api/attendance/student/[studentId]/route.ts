import { NextRequest, NextResponse } from "next/server";
import { attendanceRecordService } from "@/features/attendance/attendanceRecord.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/attendance/student/[studentId]
 * Get attendance history for a student
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

    const { studentId } = await params;

    const searchParams = request.nextUrl.searchParams;
    const termId = searchParams.get("termId") || undefined;

    const records = await attendanceRecordService.getStudentAttendance(
      studentId,
      termId,
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json(records);
  } catch (error: any) {
    console.error("Error fetching student attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch student attendance" },
      { status: 500 }
    );
  }
}
