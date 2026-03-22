import { NextRequest, NextResponse } from "next/server";
import { reportCardService } from "@/features/report-cards/reportCard.service";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * GET /api/report-cards/[id]
 * Get report card by ID with all relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const reportCard = await reportCardService.getReportCardWithRelations(id, {
      userId: decoded.userId,
      role: decoded.role as any,
    });

    return NextResponse.json({ success: true, data: reportCard });
  } catch (error: any) {
    console.error("Error fetching report card:", error);

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch report card" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/report-cards/[id]
 * Update report card remarks and promotion status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const body = await request.json();
    const {
      classTeacherRemarks,
      headTeacherRemarks,
      promotionStatus,
      nextGrade,
    } = body;

    const reportCard = await reportCardService.updateReportCard(
      id,
      {
        classTeacherRemarks,
        headTeacherRemarks,
        promotionStatus,
        nextGrade,
      },
      {
        userId: decoded.userId,
        role: decoded.role as any,
      }
    );

    return NextResponse.json({ success: true, data: reportCard });
  } catch (error: any) {
    console.error("Error updating report card:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update report card" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/report-cards/[id]
 * Delete report card (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    await reportCardService.deleteReportCard(id, {
      userId: decoded.userId,
      role: decoded.role as any,
    });

    return NextResponse.json({ message: "Report card deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting report card:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete report card" },
      { status: 500 }
    );
  }
}
