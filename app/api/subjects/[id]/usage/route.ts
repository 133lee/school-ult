import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/http/with-auth";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/subjects/[id]/usage
 *
 * Check if a subject is actively being used in the system.
 * Returns usage statistics including teachers, classes, assessments, and grades.
 *
 * Used to warn admins before changing critical subject properties like department.
 */
export const GET = withAuth(async (
  request: NextRequest,
  user,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    // Await params (Next.js 15+ requirement)
    const { id } = await params;
    const subjectId = id;

    // Fetch subject with all related data
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        teacherSubjects: {
          select: { id: true },
        },
        subjectTeacherAssignments: {
          select: { id: true },
        },
        assessments: {
          select: { id: true },
        },
        reportCardSubjects: {
          select: { id: true },
        },
        classTimetables: {
          select: { id: true },
        },
        secondaryTimetables: {
          select: { id: true },
        },
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    // Calculate usage statistics
    const teacherCount = subject.teacherSubjects.length;
    const classCount = subject.subjectTeacherAssignments.length;
    const assessmentCount = subject.assessments.length;
    const gradeCount = subject.reportCardSubjects.length;
    const timetableSlotCount = subject.classTimetables.length + subject.secondaryTimetables.length;

    const isInUse =
      teacherCount > 0 ||
      classCount > 0 ||
      assessmentCount > 0 ||
      gradeCount > 0 ||
      timetableSlotCount > 0;

    const usage = {
      isInUse,
      hasTeachers: teacherCount > 0,
      teacherCount,
      hasClasses: classCount > 0,
      classCount,
      hasAssessments: assessmentCount > 0,
      assessmentCount,
      hasGrades: gradeCount > 0,
      gradeCount,
      hasTimetableSlots: timetableSlotCount > 0,
      timetableSlotCount,
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        departmentId: subject.departmentId,
      },
    };

    return NextResponse.json(usage);
  } catch (error) {
    console.error("Error checking subject usage:", error);
    return NextResponse.json(
      { error: "Failed to check subject usage" },
      { status: 500 }
    );
  }
});
