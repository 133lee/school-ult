import { NextRequest, NextResponse } from "next/server";
import { attendanceRecordService } from "@/features/attendance/attendanceRecord.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/attendance/reports
 * Get attendance summary report for a class over a date range
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

    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("classId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!classId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "classId, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const summary = await attendanceRecordService.getClassAttendanceSummary(
      classId,
      new Date(startDate),
      new Date(endDate),
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Error fetching attendance report:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance report" },
      { status: 500 }
    );
  }
}
