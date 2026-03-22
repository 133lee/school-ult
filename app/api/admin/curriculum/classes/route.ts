import { NextRequest, NextResponse } from "next/server";
import { curriculumManagementService } from "@/features/curriculum-management/curriculumManagement.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, ValidationError, NotFoundError } from "@/lib/errors";

/**
 * PUT /api/admin/curriculum/classes
 * Bulk assign subjects to a class/stream (replaces existing)
 */
export async function PUT(request: NextRequest) {
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
    const { classId, subjects } = body;

    // Validate required fields
    if (!classId || !Array.isArray(subjects)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: classId, subjects (array)",
        },
        { status: 400 }
      );
    }

    // Call service
    const result = await curriculumManagementService.bulkAssignSubjectsToClass(
      { classId, subjects },
      context
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("PUT /api/admin/curriculum/classes error:", error);

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

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
