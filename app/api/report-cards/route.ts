import { NextRequest, NextResponse } from "next/server";
import { reportCardService } from "@/features/report-cards/reportCard.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/report-cards
 * List report cards with filters and pagination
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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const filters = {
      studentId: searchParams.get("studentId") || undefined,
      classId: searchParams.get("classId") || undefined,
      termId: searchParams.get("termId") || undefined,
      academicYearId: searchParams.get("academicYearId") || undefined,
      promotionStatus: searchParams.get("promotionStatus") as any || undefined,
    };

    const result = await reportCardService.listReportCards(
      filters,
      { page, pageSize },
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error listing report cards:", error);
    return NextResponse.json(
      { error: "Failed to list report cards" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/report-cards
 * Generate a report card for a student
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
    const { studentId, classId, termId, classTeacherId } = body;

    if (!studentId || !classId || !termId || !classTeacherId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const reportCard = await reportCardService.generateReportCard(
      {
        studentId,
        classId,
        termId,
        classTeacherId,
      },
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json(reportCard, { status: 201 });
  } catch (error: any) {
    console.error("Error generating report card:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to generate report card" },
      { status: 500 }
    );
  }
}
