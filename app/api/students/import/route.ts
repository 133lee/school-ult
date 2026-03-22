import { NextRequest, NextResponse } from "next/server";
import { studentService, BulkImportStudentRow } from "@/features/students/student.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, ValidationError } from "@/lib/errors";

/**
 * POST /api/students/import
 * Bulk import students from CSV data
 *
 * Expected body format:
 * {
 *   rows: Array<{
 *     firstName: string;
 *     middleName?: string;
 *     lastName: string;
 *     gender: string;
 *     dateOfBirth: string;
 *     studentNumber: string;
 *     admissionDate: string;
 *     status?: string;
 *     address?: string;
 *     medicalInfo?: string;
 *     vulnerability?: string;
 *   }>
 * }
 */
export async function POST(request: NextRequest) {
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

    // Build service context
    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    // Parse request body
    const body = await request.json();

    if (!body.rows || !Array.isArray(body.rows)) {
      return NextResponse.json(
        { success: false, error: "Invalid request body. Expected { rows: [...] }" },
        { status: 400 }
      );
    }

    if (body.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "No data to import. CSV appears to be empty." },
        { status: 400 }
      );
    }

    // Limit bulk import size
    const MAX_IMPORT_ROWS = 500;
    if (body.rows.length > MAX_IMPORT_ROWS) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many rows. Maximum allowed is ${MAX_IMPORT_ROWS} students per import.`
        },
        { status: 400 }
      );
    }

    const rows: BulkImportStudentRow[] = body.rows;

    // Call service
    const result = await studentService.bulkImportStudents(rows, context);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("POST /api/students/import error:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
