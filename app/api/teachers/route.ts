import { NextRequest, NextResponse } from "next/server";
import { teacherService } from "@/features/teachers/teacher.service";
import { Gender, StaffStatus, QualificationLevel } from "@/types/prisma-enums";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * Sanitize string input to prevent XSS
 */
function sanitizeString(input: string | undefined): string | undefined {
  if (!input) return input;
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * GET /api/teachers
 * - Default: paginated teachers (management tables)
 * - mode=all: all teachers (dropdowns, selectors, configs)
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

    // Build service context
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
    const qualification = searchParams.get("qualification");
    const search = searchParams.get("search");

    if (status) filters.status = status as StaffStatus;
    if (gender) filters.gender = gender as Gender;
    if (qualification) filters.qualification = qualification as QualificationLevel;
    if (search) filters.search = search;

    /* ================= NON-PAGINATED MODE ================= */
    if (mode === "all") {
      const teachers = await teacherService.getAllTeachers(
        Object.keys(filters).length > 0 ? filters : undefined,
        context
      );

      return NextResponse.json({
        success: true,
        data: teachers,
      });
    }

    /* ================= PAGINATED MODE (DEFAULT) ================= */
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Call service
    const result = await teacherService.getTeachers(
      Object.keys(filters).length > 0 ? filters : undefined,
      { page, pageSize },
      context
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error("GET /api/teachers error:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
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
 * POST /api/teachers
 * Create a new teacher
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

    // Sanitize string inputs to prevent XSS
    const input = {
      email: sanitizeString(body.email), // Changed from userId to email
      staffNumber: sanitizeString(body.staffNumber),
      firstName: sanitizeString(body.firstName),
      middleName: sanitizeString(body.middleName),
      lastName: sanitizeString(body.lastName),
      dateOfBirth: new Date(body.dateOfBirth),
      gender: body.gender,
      phone: sanitizeString(body.phone),
      address: sanitizeString(body.address),
      qualification: body.qualification,
      yearsExperience: body.yearsExperience,
      status: body.status,
      hireDate: new Date(body.hireDate),
      primarySubjectId: body.primarySubjectId,
      secondarySubjectId: body.secondarySubjectId,
    };

    // Call service
    const teacher = await teacherService.createTeacher(input, context);

    return NextResponse.json(
      {
        success: true,
        data: teacher,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/teachers error:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
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
