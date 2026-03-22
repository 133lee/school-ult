import { NextRequest } from "next/server";
import { withHODAccess } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/logger/logger";

/**
 * GET /api/hod/reports/performance
 *
 * Get student performance data including pass/fail lists and top improvers
 * HOD can only access classes that have subjects from their department
 */
export const GET = withHODAccess(async (request: NextRequest, user) => {
  try {
    logger.logRequest("GET", "/api/hod/reports/performance", user.userId);

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const termId = searchParams.get("termId");

    if (!classId || !termId) {
      return ApiResponse.error("Class ID and Term ID are required", 400);
    }

    // Get HOD's teacher profile, department and verify access to this class
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: user.userId },
      include: {
        departmentAsHOD: {
          include: {
            subjects: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!teacherProfile?.departmentAsHOD) {
      return ApiResponse.error("HOD department not found", 404);
    }

    // Get subject IDs in HOD's department
    const departmentSubjectIds = teacherProfile.departmentAsHOD.subjects.map((s) => s.id);

    // Verify that this class has at least one subject from the HOD's department
    const subjectAssignments = await prisma.subjectTeacherAssignment.findFirst({
      where: {
        classId,
        subjectId: { in: departmentSubjectIds },
      },
    });

    if (!subjectAssignments) {
      return ApiResponse.error(
        "Access denied: This class does not have subjects from your department",
        403
      );
    }

    // Get current term's report cards
    const currentReportCards = await prisma.reportCard.findMany({
      where: {
        classId,
        termId,
      },
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
            gender: true,
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    // Get the current term to find previous term
    const currentTerm = await prisma.term.findUnique({
      where: { id: termId },
      include: {
        academicYear: true,
      },
    });

    if (!currentTerm) {
      return ApiResponse.error("Term not found", 404);
    }

    // Find previous term (previous term in same year, or Term 3 of previous year)
    let previousTerm;
    if (currentTerm.termType === "TERM_1") {
      // Look for TERM_3 of previous academic year
      previousTerm = await prisma.term.findFirst({
        where: {
          termType: "TERM_3",
          academicYear: {
            year: currentTerm.academicYear.year - 1,
          },
        },
      });
    } else if (currentTerm.termType === "TERM_2") {
      previousTerm = await prisma.term.findFirst({
        where: {
          termType: "TERM_1",
          academicYearId: currentTerm.academicYearId,
        },
      });
    } else {
      // TERM_3
      previousTerm = await prisma.term.findFirst({
        where: {
          termType: "TERM_2",
          academicYearId: currentTerm.academicYearId,
        },
      });
    }

    // Get previous term's report cards if available
    let previousReportCards: any[] = [];
    if (previousTerm) {
      previousReportCards = await prisma.reportCard.findMany({
        where: {
          termId: previousTerm.id,
          studentId: {
            in: currentReportCards.map((rc) => rc.studentId),
          },
        },
        select: {
          studentId: true,
          averageMark: true,
          position: true,
        },
      });
    }

    // Create a map of previous performance
    const previousPerformanceMap = new Map(
      previousReportCards.map((rc) => [rc.studentId, rc])
    );

    // Separate passed and failed students (50% is passing mark)
    const passed = currentReportCards
      .filter((rc) => rc.averageMark && rc.averageMark >= 50)
      .map((rc) => ({
        id: rc.student.id,
        studentNumber: rc.student.studentNumber,
        firstName: rc.student.firstName,
        lastName: rc.student.lastName,
        averageMark: rc.averageMark || 0,
        position: rc.position || 0,
        gender: rc.student.gender,
      }));

    const failed = currentReportCards
      .filter((rc) => !rc.averageMark || rc.averageMark < 50)
      .map((rc) => ({
        id: rc.student.id,
        studentNumber: rc.student.studentNumber,
        firstName: rc.student.firstName,
        lastName: rc.student.lastName,
        averageMark: rc.averageMark || 0,
        position: rc.position || 0,
        gender: rc.student.gender,
      }));

    // Calculate top improvers
    const improvementData = currentReportCards
      .map((rc) => {
        const previousData = previousPerformanceMap.get(rc.studentId);
        if (!previousData || !rc.averageMark || !previousData.averageMark) {
          return null;
        }

        const improvement = rc.averageMark - previousData.averageMark;

        return {
          id: rc.student.id,
          studentNumber: rc.student.studentNumber,
          firstName: rc.student.firstName,
          lastName: rc.student.lastName,
          currentAverage: rc.averageMark,
          previousAverage: previousData.averageMark,
          improvement,
          position: rc.position || 0,
          previousPosition: previousData.position || 0,
        };
      })
      .filter((data) => data !== null) as any[];

    // Sort by improvement and get top 3
    const topImprovers = improvementData
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 3);

    // Calculate statistics
    const stats = {
      totalStudents: currentReportCards.length,
      passedCount: passed.length,
      failedCount: failed.length,
      passRate: currentReportCards.length > 0
        ? (passed.length / currentReportCards.length) * 100
        : 0,
    };

    return ApiResponse.success({
      passed,
      failed,
      topImprovers,
      stats,
    });
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      endpoint: "/api/hod/reports/performance",
    });
  }
});
