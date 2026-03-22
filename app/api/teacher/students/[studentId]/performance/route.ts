import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { ExamType } from "@/types/prisma-enums";
import { ApiResponse } from "@/lib/http/api-response";
import {
  getStudentSubjectScores,
  getStudentSubjectScoresWithCore,
  getStudentClassRankings,
  calculateClassPosition,
  calculateBestSixPoints,
  calculateOverallTrend,
  calculatePercentage,
  getCurriculumType,
} from "@/lib/services/performance-calculator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return ApiResponse.unauthorized("Missing or invalid authorization header");
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    if (!decoded) {
      return ApiResponse.unauthorized("Invalid or expired token");
    }

    const userId = decoded.userId;
    const { studentId } = await params;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const assessmentType = searchParams.get("assessmentType") as ExamType;
    const termId = searchParams.get("termId");

    if (!assessmentType || !termId) {
      return ApiResponse.badRequest("Missing required parameters: assessmentType, termId");
    }

    // Validate assessment type
    if (!["CAT", "MID", "EOT"].includes(assessmentType)) {
      return ApiResponse.badRequest("Invalid assessment type. Must be CAT, MID, or EOT");
    }

    // Get teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!teacherProfile) {
      return ApiResponse.notFound("Teacher profile not found");
    }

    // Verify teacher has access to this student
    const hasAccess = await verifyTeacherStudentAccess(
      teacherProfile.id,
      studentId
    );

    if (!hasAccess) {
      return ApiResponse.forbidden("You do not have access to this student's data");
    }

    // Get teacher's subjects
    const teacherSubjects = await getTeacherSubjects(teacherProfile.id);

    // Get student's grade level to determine curriculum type
    const enrollment = await prisma.studentClassEnrollment.findFirst({
      where: {
        studentId,
        status: "ACTIVE",
      },
      select: {
        class: {
          select: {
            grade: {
              select: {
                level: true,
              },
            },
          },
        },
      },
    });

    // Determine curriculum type (OLD_SYSTEM for Grades 1-9, NEW_SYSTEM for Forms/Grades 10-12)
    const curriculumType = enrollment?.class.grade.level
      ? getCurriculumType(enrollment.class.grade.level)
      : "NEW_SYSTEM";

    // Get student subject scores (for radar chart)
    const subjectScores = await getStudentSubjectScores(
      studentId,
      assessmentType,
      termId
    );

    // Get student subject scores with core status (for best six calculation)
    const subjectScoresWithCore = await getStudentSubjectScoresWithCore(
      studentId,
      assessmentType,
      termId
    );

    // Valid empty state: no assessment results yet
    // This is normal during term start or when assessments haven't been created
    if (subjectScores.length === 0) {
      return ApiResponse.success({
        studentId,
        assessmentType,
        termId,
        radarChartData: [],
        classRankings: [],
        classPosition: null,
        classTotal: 0,
        bestSix: null,
        bestSixCount: null,
        bestSixType: curriculumType === "OLD_SYSTEM" ? "percentage" : "points",
        trend: "same" as const,
      });
    }

    // Transform to radar chart format
    const radarChartData = subjectScores.map((score) => ({
      subject: score.subject,
      score: calculatePercentage(score.score, score.totalMarks),
    }));

    // Get class rankings
    const classRankings = await getStudentClassRankings(
      studentId,
      assessmentType,
      termId,
      teacherSubjects
    );

    // Calculate class position
    const classPositionData = await calculateClassPosition(
      studentId,
      assessmentType,
      termId
    );

    // Calculate best six based on curriculum type
    // OLD_SYSTEM: Sum top 6 percentages (higher is better, out of 600)
    // NEW_SYSTEM: Sum ECZ points (lower is better, 9-point scale)
    const bestSixResult = calculateBestSixPoints(subjectScoresWithCore, curriculumType);

    // Calculate overall trend
    const trend = await calculateOverallTrend(studentId, assessmentType, termId);

    return ApiResponse.success({
      studentId,
      assessmentType,
      termId,
      radarChartData,
      classRankings,
      classPosition: classPositionData.position,
      classTotal: classPositionData.total,
      bestSix: bestSixResult?.value ?? null,
      bestSixCount: bestSixResult?.count ?? null,
      bestSixType: bestSixResult?.type ?? (curriculumType === "OLD_SYSTEM" ? "percentage" : "points"),
      trend,
    });
  } catch (error) {
    console.error("Error fetching student performance:", error);
    return ApiResponse.internalError("Failed to fetch student performance data");
  }
}

/**
 * Verify teacher has access to student's data
 * Teacher has access if they are:
 * 1. Class teacher of student's class
 * 2. Subject teacher for any of student's subjects
 */
async function verifyTeacherStudentAccess(
  teacherId: string,
  studentId: string
): Promise<boolean> {
  // Get student's current class
  const enrollment = await prisma.studentClassEnrollment.findFirst({
    where: {
      studentId,
      status: "ACTIVE",
    },
    select: {
      classId: true,
    },
  });

  if (!enrollment) return false;

  // Check if teacher is class teacher
  const isClassTeacher = await prisma.classTeacherAssignment.findFirst({
    where: {
      teacherId: teacherId,
      classId: enrollment.classId,
    },
  });

  if (isClassTeacher) return true;

  // Check if teacher teaches any subject to this class
  const isSubjectTeacher = await prisma.subjectTeacherAssignment.findFirst({
    where: {
      teacherId: teacherId,
      classId: enrollment.classId,
    },
  });

  return !!isSubjectTeacher;
}

/**
 * Get list of subjects taught by teacher
 */
async function getTeacherSubjects(teacherId: string): Promise<string[]> {
  const assignments = await prisma.subjectTeacherAssignment.findMany({
    where: {
      teacherId: teacherId,
    },
    include: {
      subject: {
        select: {
          name: true,
        },
      },
    },
    distinct: ['subjectId'],
  });

  return assignments.map((a) => a.subject.name);
}
