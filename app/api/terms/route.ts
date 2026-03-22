import { NextRequest, NextResponse } from "next/server";
import { termService } from "@/features/terms/term.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import { TermType } from "@/types/prisma-enums";

/**
 * GET /api/terms
 * List all terms with pagination and filters
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // Filters
    const academicYearId = searchParams.get("academicYearId") || undefined;
    const termType = searchParams.get("termType") as TermType | undefined;
    const isActive = searchParams.get("isActive");

    const result = await termService.listTerms(
      {
        academicYearId,
        termType,
        isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
      },
      { page, pageSize },
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing terms:", error);
    return NextResponse.json(
      { error: "Failed to list terms" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/terms
 * Create a new term
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
    const { academicYearId, termType, startDate, endDate } = body;

    // Validate required fields
    if (!academicYearId || !termType || !startDate || !endDate) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: academicYearId, termType, startDate, endDate",
        },
        { status: 400 }
      );
    }

    const term = await termService.createTerm(
      {
        academicYearId,
        termType: termType as TermType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json(term, { status: 201 });
  } catch (error: any) {
    console.error("Error creating term:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to create term" },
      { status: 500 }
    );
  }
}
