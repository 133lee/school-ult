import { NextRequest, NextResponse } from "next/server";
import { assessmentService } from "@/features/assessments/assessment.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/assessments/[id]
 * Get assessment by ID with relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
    }

    const { id } = await params;

    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    const assessment = await assessmentService.getAssessmentWithRelations(
      id,
      context
    );

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error: any) {
    console.error("Error fetching assessment:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/assessments/[id]
 * Update assessment
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const {
      title,
      description,
      totalMarks,
      passMark,
      weight,
      assessmentDate,
      status,
    } = body;

    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    const assessment = await assessmentService.updateAssessment(
      id,
      {
        title,
        description,
        totalMarks,
        passMark,
        weight,
        assessmentDate: assessmentDate ? new Date(assessmentDate) : undefined,
        status,
      },
      context
    );

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error: any) {
    console.error("Error updating assessment:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: "Failed to update assessment" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/assessments/[id]
 * Delete assessment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
    }

    const { id } = await params;

    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    await assessmentService.deleteAssessment(id, context);

    return NextResponse.json({
      success: true,
      data: { message: "Assessment deleted successfully" },
    });
  } catch (error: any) {
    console.error("Error deleting assessment:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete assessment" },
      { status: 500 }
    );
  }
}
