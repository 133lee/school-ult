import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Get user with teacher profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user || !user.profile) {
      return NextResponse.json(
        { hasTeachingContext: false, contexts: null },
        { status: 200 }
      );
    }

    const teacherId = user.profile.id;

    // Get active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { hasTeachingContext: false, contexts: null },
        { status: 200 }
      );
    }

    // Check for class teacher assignments
    const classAssignments = await prisma.classTeacherAssignment.findMany({
      where: {
        teacherId: teacherId,
        academicYearId: academicYear.id,
      },
      include: {
        class: {
          include: {
            grade: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Check for subject teacher assignments
    const subjectAssignments = await prisma.subjectTeacherAssignment.findMany({
      where: {
        teacherId: teacherId,
        academicYearId: academicYear.id,
      },
      include: {
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
        class: {
          include: {
            grade: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const isClassTeacher = classAssignments.length > 0;
    const isSubjectTeacher = subjectAssignments.length > 0;
    const hasTeachingContext = isClassTeacher || isSubjectTeacher;

    return NextResponse.json({
      hasTeachingContext,
      contexts: hasTeachingContext
        ? {
            isClassTeacher,
            isSubjectTeacher,
            classAssignments: classAssignments.map((assignment) => ({
              id: assignment.id,
              classId: assignment.classId,
              className: assignment.class.name,
              gradeName: assignment.class.grade.name,
            })),
            subjectAssignments: subjectAssignments.map((assignment) => ({
              id: assignment.id,
              subjectId: assignment.subjectId,
              subjectName: assignment.subject.name,
              subjectCode: assignment.subject.code,
              classId: assignment.classId,
              className: assignment.class.name,
              gradeName: assignment.class.grade.name,
            })),
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching teaching context:", error);
    return NextResponse.json(
      { error: "Failed to fetch teaching context" },
      { status: 500 }
    );
  }
}
