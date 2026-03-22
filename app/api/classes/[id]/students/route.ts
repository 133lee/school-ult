import { NextRequest, NextResponse } from "next/server";
import { enrollmentService } from "@/features/enrollments/enrollment.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/classes/[id]/students
 * Get students enrolled in a class for a specific academic year
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get("academicYearId");

    if (!academicYearId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: academicYearId" },
        { status: 400 }
      );
    }

    const enrollments = await enrollmentService.getStudentsByClass(
      id,
      academicYearId,
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error("Error fetching class students:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch class students" },
      { status: 500 }
    );
  }
}
