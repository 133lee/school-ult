import { NextRequest, NextResponse } from "next/server";
import { curriculumManagementService } from "@/features/curriculum-management/curriculumManagement.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, ValidationError, NotFoundError } from "@/lib/errors";

/**
 * PATCH /api/admin/curriculum/grades/[gradeId]/subjects/[subjectId]
 * Update isCore flag for a grade-subject assignment
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ gradeId: string; subjectId: string }> }
) {
  try {
    const { gradeId, subjectId } = await params;

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
    const { isCore } = body;

    // Validate required fields
    if (typeof isCore !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Missing required field: isCore (boolean)" },
        { status: 400 }
      );
    }

    // Call service
    const result = await curriculumManagementService.updateSubjectCoreStatus(
      gradeId,
      subjectId,
      isCore,
      context
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const { gradeId, subjectId } = await params;
    console.error(
      `PATCH /api/admin/curriculum/grades/${gradeId}/subjects/${subjectId} error:`,
      error
    );

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

/**
 * DELETE /api/admin/curriculum/grades/[gradeId]/subjects/[subjectId]
 * Remove a subject from a grade
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ gradeId: string; subjectId: string }> }
) {
  try {
    const { gradeId, subjectId } = await params;

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

    // Call service
    await curriculumManagementService.removeSubjectFromGrade(
      gradeId,
      subjectId,
      context
    );

    return NextResponse.json(
      {
        success: true,
        message: "Subject removed from grade successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    const { gradeId, subjectId } = await params;
    console.error(
      `DELETE /api/admin/curriculum/grades/${gradeId}/subjects/${subjectId} error:`,
      error
    );

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

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
