import { NextRequest, NextResponse } from "next/server";
import { attendanceRecordService } from "@/features/attendance/attendanceRecord.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError } from "@/lib/errors";

/**
 * GET /api/attendance/class/[classId]
 * Get attendance for a class on a specific date
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
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

    const { classId } = await params;

    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);

    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    const records = await attendanceRecordService.getClassAttendance(
      classId,
      date,
      context
    );

    return NextResponse.json(records);
  } catch (error: any) {
    console.error("Error fetching class attendance:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to fetch class attendance" },
      { status: 500 }
    );
  }
}
