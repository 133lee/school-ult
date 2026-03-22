import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import { ExamType } from "@/types/prisma-enums";
import { calculatePercentage, calculateTrend } from "@/lib/services/performance-calculator";

interface StudentSubjectPerformance {
  studentId: string;
  studentName: string;
  assessments: Array<{
    type: ExamType;
    score: number;
    rank: number;
    total: number;
    trend: "up" | "down" | "same";
  }>;
}

export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const classId = searchParams.get("classId");
    const termId = searchParams.get("termId");

    if (!subjectId || !termId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: subjectId, termId" },
        { status: 400 }
      );
    }

    // Get teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { success: false, error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Get active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { success: false, error: "No active academic year found" },
        { status: 404 }
      );
    }

    // Verify teacher teaches this subject
    const teachesSubject = await prisma.subjectTeacherAssignment.findFirst({
      where: {
        teacherId: teacherProfile.id,
        subjectId: subjectId,
        academicYearId: academicYear.id,
        ...(classId && { classId }),
      },
    });

    if (!teachesSubject) {
      console.error("Teacher does not teach this subject:", {
        teacherId: teacherProfile.id,
        subjectId,
        classId,
        academicYearId: academicYear.id,
      });
      return NextResponse.json(
        { success: false, error: "You do not have access to this subject" },
        { status: 403 }
      );
    }

    // Get all students from the specified class(es)
    let studentIds: string[] = [];

    if (classId) {
      // Get students from specific class
      const enrollments = await prisma.studentClassEnrollment.findMany({
        where: {
          classId,
          status: "ACTIVE",
        },
        select: {
          studentId: true,
        },
      });
      studentIds = enrollments.map((e) => e.studentId);
    } else {
      // Get students from all classes where teacher teaches this subject
      const assignments = await prisma.subjectTeacherAssignment.findMany({
        where: {
          teacherId: teacherProfile.id,
          subjectId: subjectId,
        },
        select: {
          classId: true,
        },
      });

      const classIds = assignments.map((a) => a.classId);

      const enrollments = await prisma.studentClassEnrollment.findMany({
        where: {
          classId: {
            in: classIds,
          },
          status: "ACTIVE",
        },
        select: {
          studentId: true,
        },
      });

      studentIds = enrollments.map((e) => e.studentId);
    }

    // Get student details
    const students = await prisma.student.findMany({
      where: {
        id: {
          in: studentIds,
        },
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
      },
    });

    // Get all assessments for this subject in the term
    const assessments = await prisma.assessment.findMany({
      where: {
        subjectId,
        termId,
        ...(classId && { classId }),
      },
      select: {
        id: true,
        examType: true,
        totalMarks: true,
        classId: true,
      },
      orderBy: {
        examType: "asc", // CAT, MID, EOT order
      },
    });

    // Build performance data for each student
    const performanceData: StudentSubjectPerformance[] = [];

    for (const student of students) {
      const studentName = `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim();
      const studentAssessments: StudentSubjectPerformance["assessments"] = [];

      let previousScore: number | null = null;

      for (const assessment of assessments) {
        // Get student's result for this assessment
        const result = await prisma.studentAssessmentResult.findFirst({
          where: {
            studentId: student.id,
            assessmentId: assessment.id,
          },
          select: {
            marksObtained: true,
          },
        });

        if (!result) continue;

        const scorePercentage = calculatePercentage(
          result.marksObtained,
          assessment.totalMarks
        );

        // Calculate rank for this assessment
        const allResults = await prisma.studentAssessmentResult.findMany({
          where: {
            assessmentId: assessment.id,
          },
          select: {
            studentId: true,
            marksObtained: true,
          },
          orderBy: {
            marksObtained: "desc",
          },
        });

        const rank = allResults.findIndex((r) => r.studentId === student.id) + 1;
        const total = allResults.length;

        // Calculate trend
        const trend = calculateTrend(scorePercentage, previousScore);
        previousScore = scorePercentage;

        studentAssessments.push({
          type: assessment.examType,
          score: scorePercentage,
          rank,
          total,
          trend,
        });
      }

      if (studentAssessments.length > 0) {
        performanceData.push({
          studentId: student.id,
          studentName,
          assessments: studentAssessments,
        });
      }
    }

    // Sort by latest score (descending)
    performanceData.sort((a, b) => {
      const aLatest = a.assessments[a.assessments.length - 1]?.score || 0;
      const bLatest = b.assessments[b.assessments.length - 1]?.score || 0;
      return bLatest - aLatest;
    });

    return NextResponse.json({
      success: true,
      data: {
        subjectId,
        termId,
        classId: classId || null,
        students: performanceData,
      },
    });
  } catch (error) {
    console.error("Error fetching subject performance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subject performance data" },
      { status: 500 }
    );
  }
}
