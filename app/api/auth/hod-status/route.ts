import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { getHODDepartmentWithDetails } from "@/lib/auth/position-helpers";

/**
 * GET /api/auth/hod-status
 * Check if current user is assigned as HOD of any department
 * Returns department info if HOD, null otherwise
 */
export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check HOD position (not role)
    const hodDepartment = await getHODDepartmentWithDetails(decoded.userId);

    return NextResponse.json({
      success: true,
      isHOD: hodDepartment !== null,
      department: hodDepartment,
    });
  } catch (error) {
    console.error("Error checking HOD status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check HOD status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
