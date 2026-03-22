import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { calculateECZGrade, mapPrismaGradeLevelToECZLevel } from "@/lib/grading/ecz-grading-system";
import { verifyToken } from "@/lib/auth/jwt";

/**
 * POST /api/admin/fix-grades
 * Recalculate and fix incorrect grades for all assessment results
 * ADMIN ONLY
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Only ADMIN can run this
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can fix grades" },
        { status: 403 }
      );
    }

    console.log("Starting grade fix process...");

    // Get all assessment results with their class/grade info
    const results = await prisma.studentAssessmentResult.findMany({
      include: {
        assessment: {
          include: {
            class: {
              include: {
                grade: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${results.length} assessment results to check`);

    let updatedCount = 0;
    let unchangedCount = 0;
    const errors: Array<{ resultId: string; error: string }> = [];
    const updates: Array<{
      studentId: string;
      assessmentType: string;
      subject: string;
      oldGrade: string;
      newGrade: string;
      percentage: string;
    }> = [];

    for (const result of results) {
      try {
        const { assessment } = result;

        if (!assessment.class || !assessment.class.grade) {
          errors.push({
            resultId: result.id,
            error: "Missing class or grade information",
          });
          continue;
        }

        // Calculate percentage
        const percentage = (result.marksObtained! / assessment.totalMarks) * 100;

        // Determine correct grade level
        const gradeLevel = mapPrismaGradeLevelToECZLevel(assessment.class.grade.level);

        // Calculate correct grade
        const correctGrade = calculateECZGrade(percentage, gradeLevel);

        // Check if grade needs updating
        if (result.grade !== correctGrade) {
          console.log(
            `Updating result ${result.id}: ${result.grade} → ${correctGrade} (${percentage.toFixed(1)}%)`
          );

          await prisma.studentAssessmentResult.update({
            where: { id: result.id },
            data: { grade: correctGrade },
          });

          updates.push({
            studentId: result.studentId,
            assessmentType: assessment.examType,
            subject: assessment.subjectId,
            oldGrade: result.grade || "NULL",
            newGrade: correctGrade,
            percentage: percentage.toFixed(1),
          });

          updatedCount++;
        } else {
          unchangedCount++;
        }
      } catch (error: any) {
        errors.push({
          resultId: result.id,
          error: error.message || "Unknown error",
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Grade fix completed",
        summary: {
          totalChecked: results.length,
          updated: updatedCount,
          unchanged: unchangedCount,
          errors: errors.length,
        },
        updates,
        errors,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fixing grades:", error);
    return NextResponse.json(
      { error: "Failed to fix grades", details: error.message },
      { status: 500 }
    );
  }
}
