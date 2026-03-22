import { NextRequest, NextResponse } from "next/server";
import { studentService } from "@/features/students/student.service";
import {
  Gender,
  StudentStatus,
  VulnerabilityStatus,
} from "@/types/prisma-enums";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, ValidationError } from "@/lib/errors";

/**
 * GET /api/students
 * - Default: paginated students (management tables)
 * - mode=all: all students (dropdowns, selectors, configs)
 */
export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid authorization header" },
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

    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get("mode"); // 👈 "all" or null

    // Filters
    const filters: any = {};
    const status = searchParams.get("status");
    const gender = searchParams.get("gender");
    const search = searchParams.get("search");
    const vulnerability = searchParams.get("vulnerability");
    const academicYearId = searchParams.get("academicYearId");
    const filterUnenrolled = searchParams.get("filterUnenrolled") === "true";
    const filterEnrolled = searchParams.get("filterEnrolled") === "true";

    if (status) filters.status = status as StudentStatus;
    if (gender) filters.gender = gender as Gender;
    if (search) filters.search = search;
    if (vulnerability)
      filters.vulnerability = vulnerability as VulnerabilityStatus;

    /* ================= NON-PAGINATED MODE ================= */
    if (mode === "all") {
      const students = await studentService.getAllStudents(
        Object.keys(filters).length > 0 ? filters : undefined,
        context,
        academicYearId || undefined,
        filterUnenrolled,
        filterEnrolled
      );

      return NextResponse.json({
        success: true,
        data: students,
      });
    }

    /* ================= PAGINATED MODE (DEFAULT) ================= */
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Call service with enrollment filters
    const result = await studentService.getStudents(
      Object.keys(filters).length > 0 ? filters : undefined,
      { page, pageSize },
      context,
      academicYearId || undefined,
      filterUnenrolled,
      filterEnrolled
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error("GET /api/students error:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/students
 * Create a new student
 */
export async function POST(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid authorization header" },
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

    // Build service context
    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    // Parse request body
    const body = await request.json();

    // Convert date strings to Date objects
    const input = {
      ...body,
      dateOfBirth: new Date(body.dateOfBirth),
      admissionDate: new Date(body.admissionDate),
    };

    // Call service
    const student = await studentService.createStudent(input, context);

    return NextResponse.json(
      {
        success: true,
        data: student,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/students error:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
