import { NextRequest, NextResponse } from "next/server";
import { academicYearService } from "@/features/academic-years/academicYear.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError, ConflictError } from "@/lib/errors";
import { ApiResponse } from "@/lib/http/api-response";

/**
 * GET /api/academic-years
 * List all academic years with pagination and filters
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
    const isActive = searchParams.get("isActive");
    const isClosed = searchParams.get("isClosed");
    const search = searchParams.get("search") || undefined;

    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    const result = await academicYearService.listAcademicYears(
      {
        isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
        isClosed: isClosed === "true" ? true : isClosed === "false" ? false : undefined,
        search,
      },
      { page, pageSize },
      context
    );

    return ApiResponse.success(result.data, result.pagination);
  } catch (error) {
    console.error("Error listing academic years:", error);

    if (error instanceof UnauthorizedError) {
      return ApiResponse.forbidden(error.message);
    }

    return ApiResponse.internalError("Failed to list academic years");
  }
}

/**
 * POST /api/academic-years
 * Create a new academic year
 */
export async function POST(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return ApiResponse.unauthorized();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return ApiResponse.unauthorized("Invalid or expired token");
    }

    const body = await request.json();
    const { year, startDate, endDate } = body;

    // Validate required fields
    if (!year || !startDate || !endDate) {
      return ApiResponse.badRequest("Missing required fields: year, startDate, endDate");
    }

    const academicYear = await academicYearService.createAcademicYear(
      {
        year: parseInt(year),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return ApiResponse.created(academicYear);
  } catch (error: any) {
    console.error("Error creating academic year:", error);

    if (error instanceof UnauthorizedError) {
      return ApiResponse.forbidden(error.message);
    }

    if (error instanceof ValidationError) {
      return ApiResponse.badRequest(error.message);
    }

    if (error instanceof ConflictError) {
      return ApiResponse.conflict(error.message);
    }

    return ApiResponse.internalError("Failed to create academic year");
  }
}
