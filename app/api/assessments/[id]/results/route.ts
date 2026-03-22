import { NextRequest, NextResponse } from "next/server";
import { assessmentService } from "@/features/assessments/assessment.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/assessments/[id]/results
 * Get all results for an assessment
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

    const results = await assessmentService.getAssessmentResults(id, context);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error("Error fetching assessment results:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch assessment results" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assessments/[id]/results
 * Enter or update results (single or bulk)
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
    const body = await request.json();

    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    // Check if bulk or single
    if (Array.isArray(body)) {
      // Bulk entry
      const result = await assessmentService.bulkEnterResults(
        id,
        body,
        context
      );

      return NextResponse.json({
        success: true,
        data: result,
      }, { status: 201 });
    } else {
      // Single entry
      const { studentId, marksObtained, remarks } = body;

      if (!studentId || marksObtained === undefined) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        );
      }

      const result = await assessmentService.enterResult(
        id,
        { studentId, marksObtained, remarks },
        context
      );

      return NextResponse.json({
        success: true,
        data: result,
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Error entering assessment results:", error);

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
      { success: false, error: "Failed to enter assessment results" },
      { status: 500 }
    );
  }
}
