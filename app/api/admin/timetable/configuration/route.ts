import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { timetableService } from "@/features/timetables/timetable.service";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import prisma from "@/lib/db/prisma";

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

// GET - Get timetable configuration for academic year
export async function GET(request: NextRequest) {
  try {
    const context = getAuthContext(request);

    // Get active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      return NextResponse.json({ error: "No active academic year found" }, { status: 404 });
    }

    const configuration = await timetableService.getConfiguration(academicYear.id, context);

    // Always include academicYear in response
    const academicYearData = {
      id: academicYear.id,
      year: academicYear.year,
    };

    if (!configuration) {
      // Return default configuration if none exists
      return NextResponse.json({
        configuration: null,
        academicYear: academicYearData,
      });
    }

    return NextResponse.json({
      configuration,
      academicYear: academicYearData,
    });
  } catch (error: any) {
    console.error("Error fetching timetable configuration:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}

// POST - Create or update timetable configuration
export async function POST(request: NextRequest) {
  try {
    const context = getAuthContext(request);
    const body = await request.json();

    const configuration = await timetableService.createOrUpdateConfiguration(body, context);

    return NextResponse.json({ configuration });
  } catch (error: any) {
    console.error("Error saving timetable configuration:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to save configuration" },
      { status: 500 }
    );
  }
}
