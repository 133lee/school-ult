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

// GET - Get a single room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const context = getAuthContext(request);
    const { roomId } = await params;

    const room = await timetableService.getRoomById(roomId, context);

    return NextResponse.json({ room });
  } catch (error: any) {
    console.error("Error fetching room:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch room" },
      { status: 500 }
    );
  }
}

// PUT - Update a room
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const context = getAuthContext(request);
    const { roomId } = await params;
    const body = await request.json();

    const room = await timetableService.updateRoom(roomId, body, context);

    return NextResponse.json({ room });
  } catch (error: any) {
    console.error("Error updating room:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update room" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const context = getAuthContext(request);
    const { roomId } = await params;

    await timetableService.deleteRoom(roomId, context);

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting room:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete room" },
      { status: 500 }
    );
  }
}
