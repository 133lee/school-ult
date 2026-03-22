import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { timetableService } from "@/features/timetables/timetable.service";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import prisma from "@/lib/db/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper to get auth context with teacher profile ID
async function getAuthContext(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new UnauthorizedError("No authorization token provided");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

  // Get teacher profile ID for tracking who generated the timetable
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { profile: true },
  });

  return {
    userId: decoded.userId,
    role: decoded.role as any,
    teacherProfileId: user?.profile?.id,
  };
}

// POST - Generate timetable
export async function POST(request: NextRequest) {
  try {
    const context = await getAuthContext(request);

    // Get active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      return NextResponse.json({ error: "No active academic year found" }, { status: 404 });
    }

    const result = await timetableService.generateTimetable(academicYear.id, context);

    return NextResponse.json({
      message: "Timetable generated successfully",
      stats: result.stats,
      conflicts: result.conflicts,
    });
  } catch (error: any) {
    console.error("Error generating timetable:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate timetable" },
      { status: 500 }
    );
  }
}
