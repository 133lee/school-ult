import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const timeSlotId = searchParams.get("timeSlotId");
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");
    const teacherId = searchParams.get("teacherId");
    const termId = searchParams.get("termId");
    const dayOfWeek = searchParams.get("dayOfWeek");

    if (!type || !termId || !dayOfWeek) {
      return NextResponse.json(
        { error: "Missing required fields: type, termId, dayOfWeek" },
        { status: 400 }
      );
    }

    if (type === "available-teachers") {
      if (!timeSlotId || !classId || !subjectId) {
        return NextResponse.json(
          {
            error:
              "Missing required fields for available-teachers: timeSlotId, classId, subjectId",
          },
          { status: 400 }
        );
      }

      const term = await prisma.term.findUnique({
        where: { id: termId },
        select: { academicYearId: true },
      });

      if (!term) {
        return NextResponse.json({ error: "Term not found" }, { status: 404 });
      }

      const assignedTeachers = await prisma.subjectTeacherAssignment.findMany({
        where: {
          subjectId,
          classId,
          academicYearId: term.academicYearId,
        },
        include: {
          teacher: true,
        },
      });

      const availableTeachers = [];

      for (const assignment of assignedTeachers) {
        const conflictingEntry = await prisma.secondaryTimetable.findFirst({
          where: {
            timeSlotId,
            teacherId: assignment.teacherId,
            termId,
            dayOfWeek,
          },
        });

        if (!conflictingEntry) {
          availableTeachers.push({
            id: assignment.teacher.id,
            firstName: assignment.teacher.firstName,
            lastName: assignment.teacher.lastName,
            staffNumber: assignment.teacher.staffNumber,
          });
        }
      }

      return NextResponse.json({ availableTeachers });
    }

    if (type === "available-timeslots") {
      if (!teacherId || !classId) {
        return NextResponse.json(
          {
            error:
              "Missing required fields for available-timeslots: teacherId, classId",
          },
          { status: 400 }
        );
      }

      const allTimeSlots = await prisma.timeSlot.findMany({
        orderBy: { startTime: "asc" },
      });

      const availableSlots = [];

      for (const slot of allTimeSlots) {
        const teacherConflict = await prisma.secondaryTimetable.findFirst({
          where: {
            timeSlotId: slot.id,
            teacherId,
            termId,
            dayOfWeek,
          },
        });

        const classConflict = await prisma.secondaryTimetable.findFirst({
          where: {
            timeSlotId: slot.id,
            classId,
            termId,
            dayOfWeek,
          },
        });

        if (!teacherConflict && !classConflict) {
          availableSlots.push({
            id: slot.id,
            label: slot.label,
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
        }
      }

      return NextResponse.json({ availableSlots });
    }

    return NextResponse.json(
      {
        error:
          "Invalid type. Must be 'available-teachers' or 'available-timeslots'",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
