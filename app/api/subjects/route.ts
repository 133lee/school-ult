import { NextRequest, NextResponse } from "next/server";
import { subjectService } from "@/features/subjects/subject.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, ValidationError } from "@/lib/errors";

/**
 * GET /api/subjects
 * - Default: paginated subjects (management tables)
 * - mode=all: all subjects (curriculum, dropdowns, configs)
 */
export async function GET(request: NextRequest) {
  try {
    /* ================= AUTH ================= */
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

    /* ================= QUERY PARAMS ================= */
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get("mode"); // 👈 "all" or null
    const departmentId = searchParams.get("departmentId");
    const search = searchParams.get("search");

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    /* ================= FILTERS ================= */
    const filters: any = {};
    if (departmentId) filters.departmentId = departmentId;
    if (search) filters.search = search;

    /* ================= NON-PAGINATED MODE ================= */
    if (mode === "all") {
      const subjects = await subjectService.getAllSubjects(filters, context);

      return NextResponse.json({
        success: true,
        data: subjects,
      });
    }

    /* ================= PAGINATED MODE (DEFAULT) ================= */
    const result = await subjectService.getSubjects(
      filters,
      { page, pageSize },
      context
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error("GET /api/subjects error:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subjects
 * Create a new subject
 */
export async function POST(request: NextRequest) {
  try {
    /* ================= AUTH ================= */
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

    /* ================= BODY ================= */
    const body = await request.json();

    const subject = await subjectService.createSubject(body, context);

    return NextResponse.json(
      {
        success: true,
        data: subject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/subjects error:", error);

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
