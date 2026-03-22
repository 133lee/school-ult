import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { timetableService } from "@/features/timetables/timetable.service";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { DayOfWeek } from "@/types/prisma-enums";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper to get auth context from request
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

// GET - Get complete timetable (admin view)
export async function GET(request: NextRequest) {
  try {
    const context = getAuthContext(request);

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const teacherId = searchParams.get("teacherId");
    const roomId = searchParams.get("roomId");
    const dayOfWeek = searchParams.get("dayOfWeek");

    const filters: any = {};
    if (classId) filters.classId = classId;
    if (teacherId) filters.teacherId = teacherId;
    if (roomId) filters.roomId = roomId;
    if (dayOfWeek) filters.dayOfWeek = dayOfWeek as DayOfWeek;

    const result = await timetableService.getAllTimetables(context, filters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching admin timetable:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}
