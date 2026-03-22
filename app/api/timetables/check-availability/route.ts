import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, timeSlotId, classId, teacherId, termId, dayOfWeek } = body;

    if (!type || !timeSlotId || !termId || !dayOfWeek) {
      return NextResponse.json(
        { error: "Missing required fields: type, timeSlotId, termId, dayOfWeek" },
        { status: 400 }
      );
    }

    if (type === "teacher") {
      if (!teacherId) {
        return NextResponse.json(
          { error: "teacherId is required for teacher availability check" },
          { status: 400 }
        );
      }

      const conflictingEntry = await prisma.secondaryTimetable.findFirst({
        where: {
          timeSlotId,
          teacherId,
          termId,
          dayOfWeek,
        },
        include: {
          class: { include: { grade: true } },
          subject: true,
          teacher: true,
        },
      });

      if (conflictingEntry) {
        return NextResponse.json({
          available: false,
          conflict: {
            type: "teacher",
            message: `Teacher is already scheduled at this time`,
            details: {
              className: conflictingEntry.class.name,
              gradeName: conflictingEntry.class.grade.name,
              subjectName: conflictingEntry.subject.name,
              dayOfWeek: conflictingEntry.dayOfWeek,
            },
          },
        });
      }

      return NextResponse.json({ available: true });
    }

    if (type === "class") {
      if (!classId) {
        return NextResponse.json(
          { error: "classId is required for class availability check" },
          { status: 400 }
        );
      }

      const conflictingEntry = await prisma.secondaryTimetable.findFirst({
        where: {
          timeSlotId,
          classId,
          termId,
          dayOfWeek,
        },
        include: {
          teacher: true,
          subject: true,
        },
      });

      if (conflictingEntry) {
        return NextResponse.json({
          available: false,
          conflict: {
            type: "class",
            message: `Class is already scheduled at this time`,
            details: {
              teacherName: `${conflictingEntry.teacher.firstName} ${conflictingEntry.teacher.lastName}`,
              subjectName: conflictingEntry.subject.name,
              dayOfWeek: conflictingEntry.dayOfWeek,
            },
          },
        });
      }

      return NextResponse.json({ available: true });
    }

    return NextResponse.json(
      { error: "Invalid type. Must be 'teacher' or 'class'" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
