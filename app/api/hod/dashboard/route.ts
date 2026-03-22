import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { getHODDepartment } from "@/lib/auth/position-helpers";
import { ApiResponse } from "@/lib/http/api-response";

export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return ApiResponse.unauthorized("Missing or invalid authorization header");
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return ApiResponse.unauthorized("Invalid or expired token");
    }

    const userId = decoded.userId;

    // Check if user is HOD of any department (position-based check)
    const hodDepartment = await getHODDepartment(userId);

    if (!hodDepartment) {
      return ApiResponse.forbidden("Access denied: User is not assigned as HOD of any department");
    }

    // Get full department data with relations
    const department = await prisma.department.findUnique({
      where: { id: hodDepartment.id },
      include: {
        subjects: true,
        teachers: {
          where: {
            teacher: {
              status: "ACTIVE",
            },
          },
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    email: true,
                    isActive: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!department) {
      return ApiResponse.notFound("Department not found");
    }

    // Get active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      return ApiResponse.notFound("No active academic year found");
    }

    // Get active term
    const activeTerm = await prisma.term.findFirst({
      where: {
        academicYearId: academicYear.id,
        isActive: true,
      },
    });

    // Get all subject IDs for this department
    const subjectIds = department.subjects.map((s: any) => s.id);

    // Get total students across all classes for department subjects
    const subjectTeacherAssignments =
      await prisma.subjectTeacherAssignment.findMany({
        where: {
          subjectId: { in: subjectIds },
          academicYearId: academicYear.id,
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              capacity: true,
              grade: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        distinct: ["classId"],
      });

    // Calculate unique classes and get enrollment count
    const uniqueClasses = Array.from(
      new Map(
        subjectTeacherAssignments.map((assignment) => [
          assignment.classId,
          assignment.class,
        ])
      ).values()
    );

    // Get actual student count from enrollments
    const classIds = uniqueClasses.map((cls: any) => cls.id);
    const totalStudents = await prisma.studentClassEnrollment.count({
      where: {
        classId: { in: classIds },
        status: "ACTIVE",
      },
    });

    // Get assessments for this term
    const assessments = await prisma.assessment.findMany({
      where: {
        subjectId: { in: subjectIds },
        termId: activeTerm?.id,
      },
      include: {
        subject: {
          select: {
            name: true,
          },
        },
      },
    });

    const totalAssessments = assessments.length;
    const pendingAssessments = assessments.filter(
      (a) => a.status === "DRAFT"
    ).length;

    // Get assessment IDs for department subjects
    const assessmentIds = assessments.map((a) => a.id);

    // Calculate average performance across all department subjects
    const results = await prisma.studentAssessmentResult.findMany({
      where: {
        assessmentId: { in: assessmentIds },
      },
      include: {
        assessment: {
          select: {
            totalMarks: true,
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Calculate overall average performance
    let averagePerformance = 0;
    if (results.length > 0) {
      const totalPercentage = results.reduce((sum, result) => {
        const percentage =
          (result.marksObtained / result.assessment.totalMarks) * 100;
        return sum + percentage;
      }, 0);
      averagePerformance = Math.round(totalPercentage / results.length);
    }

    // Calculate pass rate (assuming 50% is pass mark)
    const passedResults = results.filter((result) => {
      const percentage =
        (result.marksObtained / result.assessment.totalMarks) * 100;
      return percentage >= 50;
    });
    const passRate =
      results.length > 0
        ? Math.round((passedResults.length / results.length) * 100)
        : 0;

    // Calculate performance by subject
    const subjectPerformance: {
      [key: string]: { total: number; count: number };
    } = {};

    results.forEach((result) => {
      const subjectName = result.assessment.subject.name;
      const percentage =
        (result.marksObtained / result.assessment.totalMarks) * 100;

      if (!subjectPerformance[subjectName]) {
        subjectPerformance[subjectName] = { total: 0, count: 0 };
      }

      subjectPerformance[subjectName].total += percentage;
      subjectPerformance[subjectName].count += 1;
    });

    const subjectAverages = Object.entries(subjectPerformance).map(
      ([name, data]) => ({
        name,
        average: Math.round(data.total / data.count),
      })
    );

    // Find best and worst performing subjects
    const sortedSubjects = [...subjectAverages].sort(
      (a, b) => b.average - a.average
    );
    const bestPerformingSubject = sortedSubjects[0] || null;
    const subjectNeedingAttention = sortedSubjects[sortedSubjects.length - 1] || null;

    // Extract teacher data from TeacherDepartment relation
    const teachersData = department.teachers.map((td: any) => ({
      id: td.teacher.id,
      firstName: td.teacher.firstName,
      lastName: td.teacher.lastName,
      staffNumber: td.teacher.staffNumber,
      email: td.teacher.user.email,
      isActive: td.teacher.user.isActive,
    }));

    return ApiResponse.success({
      department: {
        id: department.id,
        name: department.name,
        code: department.code,
        description: department.description,
        totalSubjects: department.subjects.length,
        totalTeachers: teachersData.length,
        totalStudents,
        activeClasses: uniqueClasses.length,
      },
      performance: {
        averagePerformance,
        passRate,
        bestPerformingSubject,
        subjectNeedingAttention,
      },
      stats: {
        totalAssessments,
        pendingAssessments,
        activeClasses: uniqueClasses.length,
        totalStudents,
      },
      subjects: department.subjects.map((s: any) => ({
        id: s.id,
        name: s.name,
        code: s.code,
      })),
      teachers: teachersData,
      academicYear: {
        id: academicYear.id,
        year: academicYear.year,
      },
      term: activeTerm
        ? {
            id: activeTerm.id,
            termType: activeTerm.termType,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching HOD dashboard:", error);
    return ApiResponse.internalError("Failed to fetch dashboard data");
  }
}
