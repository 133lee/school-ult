import { NextRequest, NextResponse } from "next/server";
import { attendanceRecordService } from "@/features/attendance/attendanceRecord.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AttendanceStatus } from "@/types/prisma-enums";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/attendance
 * List attendance records with filters and pagination
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
    const studentId = searchParams.get("studentId") || undefined;
    const classId = searchParams.get("classId") || undefined;
    const termId = searchParams.get("termId") || undefined;
    const status =
      (searchParams.get("status") as AttendanceStatus) || undefined;
    const dateFrom = searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : undefined;
    const dateTo = searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!)
      : undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    const result = await attendanceRecordService.listAttendance(
      { studentId, classId, termId, status, dateFrom, dateTo },
      { page, pageSize },
      context
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.pagination,
    });
  } catch (error: any) {
    console.error("Error listing attendance:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to list attendance" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance
 * Mark attendance (single or bulk)
 */
export async function POST(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    // Check if bulk or single
    if (body.records && Array.isArray(body.records)) {
      // Bulk attendance
      const { classId, termId, date, records } = body;

      if (!classId || !termId || !date || !records) {
        return NextResponse.json(
          { success: false, error: "Missing required fields for bulk attendance" },
          { status: 400 }
        );
      }

      const result = await attendanceRecordService.bulkMarkAttendance(
        {
          classId,
          termId,
          date: new Date(date),
          records,
        },
        context
      );

      return NextResponse.json(
        {
          success: true,
          data: result,
        },
        { status: 201 }
      );
    } else {
      // Single attendance
      const { studentId, classId, termId, date, status, remarks } = body;

      if (!studentId || !classId || !termId || !date || !status) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        );
      }

      const record = await attendanceRecordService.markAttendance(
        {
          studentId,
          classId,
          termId,
          date: new Date(date),
          status,
          remarks,
        },
        context
      );

      return NextResponse.json(
        {
          success: true,
          data: record,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Error marking attendance:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to mark attendance" },
      { status: 500 }
    );
  }
}
