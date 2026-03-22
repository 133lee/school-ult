import { NextRequest, NextResponse } from "next/server";
import { subjectTeacherAssignmentService } from "@/features/subject-teacher-assignments/subjectTeacherAssignment.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/teachers/[id]/assignments
 * Get assignments for a teacher
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
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

    const searchParams = request.nextUrl.searchParams;
    const academicYearId = searchParams.get("academicYearId") || undefined;

    const assignments = await subjectTeacherAssignmentService.getTeacherAssignments(
      id,
      academicYearId,
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json(assignments);
  } catch (error: any) {
    console.error("Error fetching teacher assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher assignments" },
      { status: 500 }
    );
  }
}
