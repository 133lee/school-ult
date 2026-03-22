import { NextRequest, NextResponse } from "next/server";
import { reportCardService } from "@/features/report-cards/reportCard.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * POST /api/report-cards/positions
 * Calculate class positions for all report cards in a term
 */
export async function POST(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const body = await request.json();
    const { classId, termId } = body;

    if (!classId || !termId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await reportCardService.calculateClassPositions(
      classId,
      termId,
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error calculating positions:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to calculate positions" },
      { status: 500 }
    );
  }
}
