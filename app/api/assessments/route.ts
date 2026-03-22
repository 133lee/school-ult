import { NextRequest, NextResponse } from "next/server";
import { assessmentService } from "@/features/assessments/assessment.service";
import { verifyToken } from "@/lib/auth/jwt";
import { ExamType, AssessmentStatus } from "@/types/prisma-enums";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/assessments
 * List assessments with filters and pagination
 */
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const subjectId = searchParams.get("subjectId") || undefined;
    const classId = searchParams.get("classId") || undefined;
    const termId = searchParams.get("termId") || undefined;
    const examType = (searchParams.get("examType") as ExamType) || undefined;
    const status =
      (searchParams.get("status") as AssessmentStatus) || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    const result = await assessmentService.listAssessments(
      { subjectId, classId, termId, examType, status },
      { page, pageSize },
      context
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.pagination,
    });
  } catch (error: any) {
    console.error("Error listing assessments:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to list assessments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assessments
 * Create a new assessment
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      description,
      subjectId,
      classId,
      termId,
      examType,
      totalMarks,
      passMark,
      weight,
      assessmentDate,
    } = body;

    if (!title || !subjectId || !classId || !termId || !examType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    const assessment = await assessmentService.createAssessment(
      {
        title,
        description,
        subjectId,
        classId,
        termId,
        examType,
        totalMarks,
        passMark,
        weight,
        assessmentDate: assessmentDate ? new Date(assessmentDate) : undefined,
      },
      context
    );

    return NextResponse.json(
      {
        success: true,
        data: assessment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating assessment:", error);

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

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}
