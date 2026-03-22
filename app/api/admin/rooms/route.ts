import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { timetableService } from "@/features/timetables/timetable.service";
import { ValidationError, ConflictError, NotFoundError, UnauthorizedError } from "@/lib/errors";

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

// GET - List all rooms
export async function GET(request: NextRequest) {
  try {
    const context = getAuthContext(request);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const type = searchParams.get("type");

    const filters: any = {};
    if (isActive !== null) {
      filters.isActive = isActive === "true";
    }
    if (type) {
      filters.type = type;
    }

    const rooms = await timetableService.getRooms(context, filters);

    return NextResponse.json({ rooms });
  } catch (error: any) {
    console.error("Error fetching rooms:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// POST - Create a new room
export async function POST(request: NextRequest) {
  try {
    const context = getAuthContext(request);
    const body = await request.json();

    const room = await timetableService.createRoom(body, context);

    return NextResponse.json({ room }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating room:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to create room" },
      { status: 500 }
    );
  }
}
