import { NextRequest, NextResponse } from "next/server";
import { enrollmentService } from "@/features/enrollments/enrollment.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError } from "@/lib/errors";

/**
 * GET /api/students/[id]/enrollments
 * Get student's enrollment history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params;

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

    // Build service context
    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    const enrollments = await enrollmentService.getStudentEnrollmentHistory(
      id,
      context
    );

    return NextResponse.json(enrollments);
  } catch (error) {
    const { id } = await params;
    console.error(`GET /api/students/${id}/enrollments error:`, error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch student enrollments" },
      { status: 500 }
    );
  }
}
