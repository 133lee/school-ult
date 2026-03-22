import { NextRequest, NextResponse } from "next/server";
import { enrollmentService } from "@/features/enrollments/enrollment.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import { EnrollmentStatus } from "@/types/prisma-enums";

/**
 * GET /api/enrollments
 * List enrollments with filters
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

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // Filters
    const classId = searchParams.get("classId") || undefined;
    const academicYearId = searchParams.get("academicYearId") || undefined;
    const status = searchParams.get("status") as EnrollmentStatus | undefined;
    const studentId = searchParams.get("studentId") || undefined;

    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    const result = await enrollmentService.listEnrollments(
      { classId, academicYearId, status, studentId },
      { page, pageSize },
      context
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing enrollments:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to list enrollments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/enrollments
 * Create a new enrollment
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
    const { studentId, classId, academicYearId, enrollmentDate } = body;

    if (!studentId || !classId || !academicYearId) {
      return NextResponse.json(
        { error: "Missing required fields: studentId, classId, academicYearId" },
        { status: 400 }
      );
    }

    const enrollment = await enrollmentService.createEnrollment(
      {
        studentId,
        classId,
        academicYearId,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : undefined,
      },
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating enrollment:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to create enrollment" },
      { status: 500 }
    );
  }
}
