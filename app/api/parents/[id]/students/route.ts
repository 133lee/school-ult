import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import prisma from "@/lib/db/prisma";
import { ParentRelationship } from "@/types/prisma-enums";

/**
 * POST /api/parents/[id]/students
 * Link a student to a parent/guardian
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id: guardianId } = await params;

    // Validate guardian ID
    if (!guardianId) {
      return NextResponse.json(
        { success: false, error: "Guardian ID is required" },
        { status: 400 }
      );
    }

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

    // Parse request body
    const body = await request.json();
    const { studentId, relationship, isPrimary } = body;

    // Validate required fields
    if (!studentId || !relationship) {
      return NextResponse.json(
        { success: false, error: "Student ID and relationship are required" },
        { status: 400 }
      );
    }

    // Verify guardian exists
    const guardian = await prisma.guardian.findUnique({
      where: { id: guardianId },
    });

    if (!guardian) {
      return NextResponse.json(
        { success: false, error: "Guardian not found" },
        { status: 404 }
      );
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Check if link already exists
    const existingLink = await prisma.studentGuardian.findFirst({
      where: {
        studentId,
        guardianId,
      },
    });

    if (existingLink) {
      return NextResponse.json(
        { success: false, error: "Student is already linked to this guardian" },
        { status: 400 }
      );
    }

    // If this is marked as primary, remove primary flag from other guardians for this student
    if (isPrimary) {
      await prisma.studentGuardian.updateMany({
        where: {
          studentId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Create the student-guardian link
    const link = await prisma.studentGuardian.create({
      data: {
        studentId,
        guardianId,
        relationship: relationship as ParentRelationship,
        isPrimary: isPrimary || false,
      },
      include: {
        student: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            studentNumber: true,
          },
        },
        guardian: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: link,
      },
      { status: 201 }
    );
  } catch (error) {
    const { id } = await params;
    console.error(`POST /api/parents/${id}/students error:`, error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/parents/[id]/students/[studentId]
 * Unlink a student from a parent/guardian
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id: guardianId } = await params;

    // Validate guardian ID
    if (!guardianId) {
      return NextResponse.json(
        { success: false, error: "Guardian ID is required" },
        { status: 400 }
      );
    }

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

    // Get studentId from query params
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Find the link
    const link = await prisma.studentGuardian.findFirst({
      where: {
        studentId,
        guardianId,
      },
    });

    if (!link) {
      return NextResponse.json(
        { success: false, error: "Student-guardian link not found" },
        { status: 404 }
      );
    }

    // Delete the link
    await prisma.studentGuardian.delete({
      where: {
        id: link.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student unlinked from guardian successfully",
    });
  } catch (error) {
    const { id } = await params;
    console.error(`DELETE /api/parents/${id}/students error:`, error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
