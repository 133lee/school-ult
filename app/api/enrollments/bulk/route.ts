import { NextRequest, NextResponse } from "next/server";
import { enrollmentService } from "@/features/enrollments/enrollment.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * POST /api/enrollments/bulk
 * Bulk enroll students
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { studentIds, classId, academicYearId, enrollmentDate } = body;

    if (!studentIds || !Array.isArray(studentIds) || !classId || !academicYearId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: studentIds (array), classId, academicYearId",
        },
        { status: 400 }
      );
    }

    const result = await enrollmentService.bulkEnroll(
      {
        studentIds,
        classId,
        academicYearId,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : undefined,
      },
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error bulk enrolling students:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to bulk enroll students" },
      { status: 500 }
    );
  }
}
