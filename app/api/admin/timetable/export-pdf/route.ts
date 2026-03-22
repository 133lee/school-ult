import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import JSZip from "jszip";
import { TimetablePDF } from "@/lib/pdf/timetable-pdf";
import { timetableService } from "@/features/timetables/timetable.service";
import { timetableConfigurationRepository } from "@/features/timetables/timetableConfiguration.repository";
import { UnauthorizedError, NotFoundError } from "@/lib/http/errors";
import prisma from "@/lib/db/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper to generate period slots from configuration
// Uses periodsBeforeBreak and periodsAfterBreak for clarity
function generatePeriodSlots(config: any) {
  // Validate configuration exists
  if (!config) {
    throw new Error("Timetable configuration is null or undefined");
  }

  if (!config.schoolStartTime) {
    throw new Error("Configuration missing schoolStartTime");
  }

  if (!config.periodsBeforeBreak || config.periodsBeforeBreak <= 0) {
    throw new Error(`Invalid periodsBeforeBreak: ${config.periodsBeforeBreak}`);
  }

  if (!config.periodsAfterBreak || config.periodsAfterBreak <= 0) {
    throw new Error(`Invalid periodsAfterBreak: ${config.periodsAfterBreak}`);
  }

  if (!config.periodDuration || config.periodDuration <= 0) {
    throw new Error(`Invalid periodDuration: ${config.periodDuration}`);
  }

  const periodSlots = [];
  let currentTime = config.schoolStartTime; // e.g., "07:00"

  const addMinutes = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(":").map(Number);

    if (isNaN(hours) || isNaN(mins)) {
      throw new Error(`Invalid time format: ${time}`);
    }

    const totalMins = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMins / 60);
    const newMins = totalMins % 60;
    return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
  };

  let periodNumber = 1;

  // 1. Periods BEFORE break
  for (let i = 0; i < config.periodsBeforeBreak; i++) {
    const endTime = addMinutes(currentTime, config.periodDuration);
    periodSlots.push({
      periodNumber: periodNumber++,
      startTime: currentTime,
      endTime: endTime,
      isBreak: false,
    });
    currentTime = endTime;
  }

  // 2. Break period
  const breakEndTime = addMinutes(currentTime, config.breakDuration || 15);
  periodSlots.push({
    periodNumber: periodNumber++,
    startTime: currentTime,
    endTime: breakEndTime,
    isBreak: true,
  });
  currentTime = breakEndTime;

  // 3. Periods AFTER break
  for (let i = 0; i < config.periodsAfterBreak; i++) {
    const endTime = addMinutes(currentTime, config.periodDuration);
    periodSlots.push({
      periodNumber: periodNumber++,
      startTime: currentTime,
      endTime: endTime,
      isBreak: false,
    });
    currentTime = endTime;
  }

  if (periodSlots.length === 0) {
    throw new Error("generatePeriodSlots produced empty array");
  }

  console.log("Generated period slots:", {
    periodsBeforeBreak: config.periodsBeforeBreak,
    periodsAfterBreak: config.periodsAfterBreak,
    totalSlots: periodSlots.length,
    breakAt: config.periodsBeforeBreak + 1,
  });

  return periodSlots;
}

// Helper to get auth context
function getAuthContext(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new UnauthorizedError("No authorization token provided");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

  return {
    userId: decoded.userId,
    role: decoded.role as any,
  };
}

// GET - Export timetable as PDF (single class/teacher) or ZIP (all classes)
export async function GET(request: NextRequest) {
  try {
    const context = getAuthContext(request);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const teacherId = searchParams.get("teacherId");
    const exportAll = searchParams.get("exportAll") === "true";

    // Get active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      throw new NotFoundError("No active academic year found");
    }

    // Get configuration for period slots
    const config = await timetableConfigurationRepository.findByAcademicYearId(
      academicYear.id
    );

    if (!config) {
      throw new NotFoundError("Timetable configuration not found");
    }

    // Generate period slots from configuration
    const periodSlots = generatePeriodSlots(config);

    console.log("Generated period slots:", {
      count: periodSlots.length,
      first: periodSlots[0],
      last: periodSlots[periodSlots.length - 1],
    });

    if (!periodSlots || periodSlots.length === 0) {
      throw new Error("Failed to generate period slots from configuration");
    }

    // CASE 1: Export all classes as ZIP
    if (exportAll) {
      const allClasses = await prisma.class.findMany({
        where: { status: "ACTIVE" },
        include: { grade: true },
        orderBy: [{ grade: { level: "asc" } }, { name: "asc" }],
      });

      if (allClasses.length === 0) {
        return NextResponse.json(
          { error: "No active classes found" },
          { status: 404 }
        );
      }

      const zip = new JSZip();

      // Generate PDF for each class
      for (const classItem of allClasses) {
        try {
          const result = await timetableService.getAllTimetables(context, {
            classId: classItem.id,
          });

          // Skip classes with no timetable data
          if (!result.slots || result.slots.length === 0) {
            console.log(`Skipping ${classItem.grade.name} ${classItem.name} - no timetable data`);
            continue;
          }

          console.log(`EXPORT DEBUG - Bulk PDF for ${classItem.grade.name} ${classItem.name}:`, {
            slotsCount: result.slots.length,
            periodSlotsCount: periodSlots.length,
          });

          const pdfComponent = React.createElement(TimetablePDF, {
            className: `${classItem.grade.name} ${classItem.name}`,
            slots: result.slots as any,
            periodSlots,
            generatedDate: new Date().toLocaleDateString("en-GB"),
          });

          const stream = await renderToStream(pdfComponent as any);

          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
          }
          const buffer = Buffer.concat(chunks);

          if (buffer.length === 0) {
            console.error(`Empty PDF buffer for ${classItem.grade.name} ${classItem.name}`);
          } else {
            console.log(`Generated PDF for ${classItem.grade.name} ${classItem.name}: ${buffer.length} bytes`);
            zip.file(`${classItem.grade.name}_${classItem.name}.pdf`, buffer);
          }
        } catch (error) {
          console.error(`Failed to generate PDF for ${classItem.grade.name} ${classItem.name}:`, error);
          // Continue with other classes
        }
      }

      // Generate ZIP buffer
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      const timestamp = Date.now();

      return new NextResponse(zipBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Length": zipBuffer.length.toString(),
          "Content-Disposition": `attachment; filename="all_timetables_${timestamp}.zip"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // CASE 2: Export single class timetable
    if (classId) {
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: { grade: true },
      });

      if (!classData) {
        throw new NotFoundError("Class not found");
      }

      const result = await timetableService.getAllTimetables(context, {
        classId,
      });

      // HARD GUARD: Prevent 0-byte PDF from empty data
      if (!result.slots || result.slots.length === 0) {
        return NextResponse.json(
          { error: "No timetable slots found for export. Generate a timetable first." },
          { status: 400 }
        );
      }

      if (!periodSlots || periodSlots.length === 0) {
        return NextResponse.json(
          { error: "Invalid period configuration - cannot generate PDF" },
          { status: 400 }
        );
      }

      // FORCE-LOG: What React-PDF will receive
      console.log("EXPORT DEBUG - PDF Input Data:", {
        mode: "CLASS",
        className: `${classData.grade.name} ${classData.name}`,
        slotsCount: result.slots.length,
        periodSlotsCount: periodSlots.length,
        classId: classData.id,
        academicYearId: academicYear.id,
        sampleSlot: result.slots[0],
        periodSlotsStructure: periodSlots.slice(0, 2),
      });

      try {
        const pdfComponent = React.createElement(TimetablePDF, {
          className: `${classData.grade.name} ${classData.name}`,
          slots: result.slots as any,
          periodSlots,
          generatedDate: new Date().toLocaleDateString("en-GB"),
        });

        console.log("Rendering PDF stream...");
        const stream = await renderToStream(pdfComponent as any);

        console.log("Converting stream to buffer...");
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
        }
        const pdfBuffer = Buffer.concat(chunks);

        console.log("PDF buffer created, size:", pdfBuffer.length, "bytes");

        if (pdfBuffer.length === 0) {
          console.error("PDF buffer is empty! Stream produced no data.");
          throw new Error("PDF rendering produced empty buffer");
        }

        // Add timestamp to filename to avoid Chrome caching issues
        const timestamp = Date.now();
        const safeClassName = `${classData.grade.name}_${classData.name}`.replace(/[^a-zA-Z0-9_-]/g, '_');

        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Length": pdfBuffer.length.toString(),
            "Content-Disposition": `attachment; filename="timetable_${safeClassName}_${timestamp}.pdf"`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      } catch (pdfError: any) {
        console.error("PDF rendering error:", pdfError);
        console.error("PDF error stack:", pdfError.stack);
        throw new Error(`Failed to render PDF: ${pdfError.message}`);
      }
    }

    // CASE 3: Export teacher timetable
    if (teacherId) {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { id: teacherId },
      });

      if (!teacher) {
        throw new NotFoundError("Teacher not found");
      }

      const result = await timetableService.getAllTimetables(context, {
        teacherId,
      });

      // HARD GUARD: Prevent 0-byte PDF from empty data
      if (!result.slots || result.slots.length === 0) {
        return NextResponse.json(
          { error: "No timetable slots found for this teacher. Generate a timetable first." },
          { status: 400 }
        );
      }

      if (!periodSlots || periodSlots.length === 0) {
        return NextResponse.json(
          { error: "Invalid period configuration - cannot generate PDF" },
          { status: 400 }
        );
      }

      // FORCE-LOG: What React-PDF will receive
      console.log("EXPORT DEBUG - PDF Input Data:", {
        mode: "TEACHER",
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        slotsCount: result.slots.length,
        periodSlotsCount: periodSlots.length,
        teacherId: teacher.id,
        academicYearId: academicYear.id,
      });

      try {
        const pdfComponent = React.createElement(TimetablePDF, {
          className: `${teacher.firstName} ${teacher.lastName} - Teacher Timetable`,
          slots: result.slots as any,
          periodSlots,
          generatedDate: new Date().toLocaleDateString("en-GB"),
        });

        const stream = await renderToStream(pdfComponent as any);

        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
        }
        const pdfBuffer = Buffer.concat(chunks);

        if (pdfBuffer.length === 0) {
          console.error("PDF buffer is empty for teacher timetable!");
          throw new Error("PDF rendering produced empty buffer");
        }

        // Add timestamp to filename to avoid Chrome caching issues
        const timestamp = Date.now();
        const safeTeacherName = `${teacher.lastName}_${teacher.firstName}`.replace(/[^a-zA-Z0-9_-]/g, '_');

        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Length": pdfBuffer.length.toString(),
            "Content-Disposition": `attachment; filename="timetable_teacher_${safeTeacherName}_${timestamp}.pdf"`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      } catch (pdfError: any) {
        console.error("Teacher PDF rendering error:", pdfError);
        console.error("Teacher PDF error stack:", pdfError.stack);
        throw new Error(`Failed to render teacher PDF: ${pdfError.message}`);
      }
    }

    // No valid parameters
    return NextResponse.json(
      { error: "Please provide classId, teacherId, or set exportAll=true" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    console.error("Error stack:", error.stack);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
