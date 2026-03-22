import { NextRequest, NextResponse } from "next/server";
import { studentAssessmentResultService as gradeService } from "@/features/assessment-results/studentAssessmentResult.service";

/**
 * GET /api/grades/[id]
 * Fetch a single grade by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const grade = await gradeService.getGradeById(id);

    if (!grade) {
      return NextResponse.json(
        {
          success: false,
          error: "Grade not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: grade,
    });
  } catch (error) {
    const { id } = await params;
    console.error(`GET /api/grades/${id} error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch grade",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/grades/[id]
 * Update a grade by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedGrade = await gradeService.updateGrade(id, body);

    return NextResponse.json({
      success: true,
      data: updatedGrade,
      message: "Grade updated successfully",
    });
  } catch (error) {
    const { id } = await params;
    console.error(`PUT /api/grades/${id} error:`, error);

    const statusCode = error instanceof Error && error.message === "Grade not found"
      ? 404
      : error instanceof Error && error.message.includes("between 0 and 100")
      ? 400
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update grade",
      },
      { status: statusCode }
    );
  }
}

/**
 * DELETE /api/grades/[id]
 * Delete a grade by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await gradeService.deleteGrade(id);

    return NextResponse.json({
      success: true,
      message: "Grade deleted successfully",
    });
  } catch (error) {
    const { id } = await params;
    console.error(`DELETE /api/grades/${id} error:`, error);

    const statusCode = error instanceof Error && error.message === "Grade not found"
      ? 404
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete grade",
      },
      { status: statusCode }
    );
  }
}
