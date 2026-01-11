import { NextRequest, NextResponse } from "next/server";
import { departmentService } from "@/features/departments/department.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import { DepartmentStatus } from "@/types/prisma-enums";

/**
 * GET /api/departments
 * List all departments with optional filters and pagination
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
    const status = searchParams.get("status") as DepartmentStatus | null;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Build filters
    const filters: any = {};
    if (status) filters.status = status;
    if (search) filters.search = search;

    // Call service
    const result = await departmentService.getDepartments(
      filters,
      { page, pageSize },
      context
    );

    console.log("[API] GET /api/departments response - HOD data:", result.data.map((d: any) => ({
      departmentId: d.id,
      departmentName: d.name,
      hodId: d.hodId,
      hod: d.hod,
    })));

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error(`GET /api/departments error:`, error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

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
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/departments
 * Create a new department
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
    const department = await departmentService.createDepartment(body, context);

    return NextResponse.json(
      {
        success: true,
        data: department,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`POST /api/departments error:`, error);

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
