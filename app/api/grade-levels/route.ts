import { NextRequest, NextResponse } from "next/server";
import { gradeRepository } from "@/features/grade-levels/grade.repository";

/**
 * GET /api/grade-levels
 * Fetch all grade levels ordered by sequence
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolLevel = searchParams.get("schoolLevel");

    let grades;

    if (schoolLevel && (schoolLevel === "PRIMARY" || schoolLevel === "SECONDARY")) {
      grades = await gradeRepository.findBySchoolLevel(schoolLevel as any);
    } else {
      grades = await gradeRepository.findAll();
    }

    return NextResponse.json({
      success: true,
      data: grades,
      count: grades.length,
    });
  } catch (error) {
    console.error("GET /api/grade-levels error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch grade levels",
      },
      { status: 500 }
    );
  }
}
