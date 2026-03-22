import { NextRequest, NextResponse } from "next/server";
import { studentAssessmentResultService as gradeService } from "@/features/assessment-results/studentAssessmentResult.service";

/**
 * GET /api/grades
 * Fetch all grades or filter by query params
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get("studentId");
    const assessmentId = searchParams.get("assessmentId");

    let grades;

    if (studentId) {
      grades = await gradeService.getGradesByStudent(studentId);
    } else if (assessmentId) {
      grades = await gradeService.getGradesByAssessment(assessmentId);
    } else {
      grades = await gradeService.getAllGrades();
    }

    return NextResponse.json({
      success: true,
      data: grades,
      count: grades.length,
    });
  } catch (error) {
    console.error("GET /api/grades error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch grades",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/grades
 * Create a new grade
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const grade = await gradeService.createGrade(body);

    return NextResponse.json(
      {
        success: true,
        data: grade,
        message: "Grade created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/grades error:", error);

    const statusCode = error instanceof Error && error.message.includes("already exists")
      ? 409
      : error instanceof Error && error.message.includes("between 0 and 100")
      ? 400
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create grade",
      },
      { status: statusCode }
    );
  }
}
