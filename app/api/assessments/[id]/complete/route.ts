import { NextRequest, NextResponse } from "next/server";
import { assessmentService } from "@/features/assessments/assessment.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * POST /api/assessments/[id]/complete
 * Complete assessment (finalize grading)
 */
export async function POST(
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

    const assessment = await assessmentService.completeAssessment(id, context);

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error: any) {
    console.error("Error completing assessment:", error);

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
      { success: false, error: "Failed to complete assessment" },
      { status: 500 }
    );
  }
}
