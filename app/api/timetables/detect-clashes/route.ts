import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const termId = searchParams.get("termId");
    const classId = searchParams.get("classId");

    if (!termId) {
      return NextResponse.json(
        { error: "Missing required field: termId" },
        { status: 400 }
      );
    }

    const whereClause: any = {
      termId,
    };

    if (classId) {
      whereClause.classId = classId;
    }

    const timetableEntries = await prisma.secondaryTimetable.findMany({
      where: whereClause,
      include: {
        timeSlot: true,
        teacher: true,
        class: { include: { grade: true } },
        subject: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { timeSlot: { startTime: "asc" } }],
    });

    const teacherClashes: any[] = [];
    const classClashes: any[] = [];

    const teacherSlotMap = new Map<string, any>();
    const classSlotMap = new Map<string, any>();

    for (const entry of timetableEntries) {
      const teacherSlotKey = `${entry.teacherId}-${entry.timeSlotId}-${entry.dayOfWeek}`;
      const classSlotKey = `${entry.classId}-${entry.timeSlotId}-${entry.dayOfWeek}`;

      if (teacherSlotMap.has(teacherSlotKey)) {
        const existingEntry = teacherSlotMap.get(teacherSlotKey);
        teacherClashes.push({
          type: "teacher",
          teacherId: entry.teacherId,
          teacherName: `${entry.teacher.firstName} ${entry.teacher.lastName}`,
          timeSlotId: entry.timeSlotId,
          timeSlotLabel: entry.timeSlot.label,
          startTime: entry.timeSlot.startTime,
          endTime: entry.timeSlot.endTime,
          dayOfWeek: entry.dayOfWeek,
          conflictingEntries: [
            {
              id: existingEntry.id,
              className: `${existingEntry.class.grade.name} ${existingEntry.class.name}`,
              subjectName: existingEntry.subject.name,
            },
            {
              id: entry.id,
              className: `${entry.class.grade.name} ${entry.class.name}`,
              subjectName: entry.subject.name,
            },
          ],
        });
      } else {
        teacherSlotMap.set(teacherSlotKey, entry);
      }

      if (classSlotMap.has(classSlotKey)) {
        const existingEntry = classSlotMap.get(classSlotKey);
        classClashes.push({
          type: "class",
          classId: entry.classId,
          className: `${entry.class.grade.name} ${entry.class.name}`,
          timeSlotId: entry.timeSlotId,
          timeSlotLabel: entry.timeSlot.label,
          startTime: entry.timeSlot.startTime,
          endTime: entry.timeSlot.endTime,
          dayOfWeek: entry.dayOfWeek,
          conflictingEntries: [
            {
              id: existingEntry.id,
              teacherName: `${existingEntry.teacher.firstName} ${existingEntry.teacher.lastName}`,
              subjectName: existingEntry.subject.name,
            },
            {
              id: entry.id,
              teacherName: `${entry.teacher.firstName} ${entry.teacher.lastName}`,
              subjectName: entry.subject.name,
            },
          ],
        });
      } else {
        classSlotMap.set(classSlotKey, entry);
      }
    }

    const totalClashes = teacherClashes.length + classClashes.length;

    return NextResponse.json({
      totalClashes,
      teacherClashes,
      classClashes,
      summary: {
        teacherClashCount: teacherClashes.length,
        classClashCount: classClashes.length,
        entriesScanned: timetableEntries.length,
      },
    });
  } catch (error: any) {
    console.error("Error detecting clashes:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
