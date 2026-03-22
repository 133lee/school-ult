import { NextRequest, NextResponse } from "next/server";
import { classService } from "@/features/classes/class.service";
import { ClassStatus } from "@/types/prisma-enums";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/classes
 * - Default: paginated classes (management tables)
 * - mode=all: all classes (dropdowns, selectors, configs)
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
    const gradeId = searchParams.get("gradeId");
    const search = searchParams.get("search");

    if (status) filters.status = status as ClassStatus;
    if (gradeId) filters.gradeId = gradeId;
    if (search) filters.search = search;

    /* ================= NON-PAGINATED MODE ================= */
    if (mode === "all") {
      const classes = await classService.getAllClasses(
        Object.keys(filters).length > 0 ? filters : undefined,
        context
      );

      return NextResponse.json({
        success: true,
        data: classes,
      });
    }

    /* ================= PAGINATED MODE (DEFAULT) ================= */
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Call service
    const result = await classService.getClasses(
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
    console.error("GET /api/classes error:", error);

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
 * POST /api/classes
 * Create a new class
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

    // Call service
    const classEntity = await classService.createClass(body, context);

    return NextResponse.json(
      {
        success: true,
        data: classEntity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/classes error:", error);

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
