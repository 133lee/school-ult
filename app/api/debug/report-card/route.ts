import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/debug/report-card
 * Debug endpoint to check report card data
 */
export async function GET() {
  try {
    // Get first report card
    const reportCard = await prisma.reportCard.findFirst({
      include: {
        student: true,
        class: {
          include: {
            grade: true,
          },
        },
        term: {
          include: {
            academicYear: true,
          },
        },
        classTeacher: true,
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!reportCard) {
      return NextResponse.json({
        error: "No report cards found in database",
      });
    }

    const debug = {
      reportCardId: reportCard.id,
      student: {
        id: reportCard.student?.id,
        name: `${reportCard.student?.firstName} ${reportCard.student?.lastName}`,
      },
      classTeacher: {
        profileId: reportCard.classTeacherId,
        profileExists: !!reportCard.classTeacher,
        firstName: reportCard.classTeacher?.firstName,
        lastName: reportCard.classTeacher?.lastName,
        userName: reportCard.classTeacher
          ? `${reportCard.classTeacher.firstName} ${reportCard.classTeacher.lastName}`
          : null,
      },
      subjects: reportCard.subjects.map((s) => ({
        name: s.subject.name,
        catMark: s.catMark,
        midMark: s.midMark,
        eotMark: s.eotMark,
        totalMark: s.totalMark,
        grade: s.grade,
      })),
      stats: {
        averageMark: reportCard.averageMark,
        attendance: reportCard.attendance,
        position: reportCard.position,
        outOf: reportCard.outOf,
      },
    };

    // Additional check - fetch assessments for this student/class/term
    const assessments = await prisma.assessment.findMany({
      where: {
        classId: reportCard.classId,
        termId: reportCard.termId,
        status: "COMPLETED",
      },
      include: {
        results: {
          where: {
            studentId: reportCard.studentId,
          },
        },
        subject: true,
      },
    });

    return NextResponse.json({
      success: true,
      debug,
      assessmentsInfo: {
        totalAssessments: assessments.length,
        assessments: assessments.map(a => ({
          examType: a.examType,
          subject: a.subject.name,
          hasResult: a.results.length > 0,
          result: a.results[0] ? {
            marksObtained: a.results[0].marksObtained,
            totalMarks: a.totalMarks,
            percentage: ((a.results[0].marksObtained / a.totalMarks) * 100).toFixed(2)
          } : null
        }))
      }
    });
  } catch (error: any) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        error: "Failed to debug report card",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
